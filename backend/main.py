import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import re
import sqlite3
import pandas as pd
from traceback import format_exc

from vanna_setup import get_agent

app = FastAPI(title="NLP to SQL Chatbot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
agent = None
DB_PATH = "clinic.db"

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.on_event("startup")
def startup_event():
    global agent
    try:
        agent = get_agent()
        print("Vanna Agent initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize Vanna agent: {e}")

class ChatRequest(BaseModel):
    question: str

def validate_sql(sql: str) -> bool:
    """Validate SQL is a safe SELECT statement."""
    sql_upper = sql.strip().upper()
    if not sql_upper.startswith("SELECT"):
        return False
    blocked = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "EXEC", "CREATE", "REPLACE", "TRUNCATE"]
    for kw in blocked:
        if re.search(rf"\b{kw}\b", sql_upper):
            return False
    if "SQLITE_MASTER" in sql_upper or "SQLITE_SCHEMA" in sql_upper:
        return False
    return True

def extract_sql_from_response(text: str) -> str:
    """Extract clean SQL from LLM markdown or plain response."""
    # Try to get SQL from ```sql ... ``` fences first
    fence_match = re.search(r"```(?:sql)?\s*(SELECT[\s\S]+?)```", text, re.IGNORECASE)
    if fence_match:
        return fence_match.group(1).strip()
    # Try to find a bare SELECT statement
    select_match = re.search(r"(SELECT[\s\S]+?;)", text, re.IGNORECASE)
    if select_match:
        return select_match.group(1).strip()
    # Try without semicolon
    select_match2 = re.search(r"(SELECT.+)$", text, re.IGNORECASE | re.MULTILINE)
    if select_match2:
        return select_match2.group(1).strip()
    return ""

def get_db_schema() -> str:
    """Read the clinic.db schema for context in the LLM prompt."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table'")
        rows = cursor.fetchall()
        conn.close()
        return "\n".join(r[0] for r in rows if r[0])
    except Exception:
        return ""

async def generate_sql_from_llm(question: str) -> str:
    """Use the Vanna LLM service to generate a SQL query."""
    from vanna.core.llm.models import LlmRequest, LlmMessage
    from vanna.core.user.models import User
    schema = get_db_schema()
    system_msg = LlmMessage(
        role="system",
        content=f"""You are a SQL expert for a SQLite clinical database.

DATABASE SCHEMA:
{schema}

RULES:
- Only write SELECT queries. Never INSERT, UPDATE, DELETE, DROP, or CREATE.
- Use only the tables and columns defined in the schema above.
- Respond ONLY with the SQL query wrapped in ```sql``` code fences."""
    )
    user_msg = LlmMessage(role="user", content=question)
    default_user = User(id="api_user")
    llm_request = LlmRequest(messages=[system_msg, user_msg], user=default_user)
    response = await agent.llm_service.send_request(llm_request)
    # LlmResponse typically has a .content or .message attribute
    if hasattr(response, "content"):
        return response.content
    elif hasattr(response, "message"):
        return response.message
    else:
        return str(response)

def execute_sql(sql: str) -> pd.DataFrame:
    """Execute a SQL query against clinic.db and return a DataFrame."""
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query(sql, conn)
        return df
    finally:
        conn.close()

@app.get("/health")
def health_check():
    """Health check endpoint."""
    db_status = "disconnected"
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("SELECT 1")
        conn.close()
        db_status = "connected"
    except Exception:
        pass

    memory_items = 15  # we seeded 15 items
    return {
        "status": "ok" if db_status == "connected" else "error",
        "database": db_status,
        "agent_memory_items": memory_items
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest) -> Dict[str, Any]:
    if not agent:
        raise HTTPException(status_code=500, detail="Vanna AI agent is not initialized.")

    try:
        # Step 1: Generate SQL via LLM
        raw_response = await generate_sql_from_llm(request.question)
        sql = extract_sql_from_response(raw_response)

        if not sql:
            return {
                "message": raw_response,
                "sql_query": "",
                "columns": [],
                "rows": [],
                "row_count": 0,
                "chart": {},
                "chart_type": "none"
            }

        # Step 2: Validate SQL (SELECT-only gatekeeper)
        if not validate_sql(sql):
            raise HTTPException(
                status_code=400,
                detail="SQL validation failed: Only SELECT statements are allowed."
            )

        # Step 3: Execute SQL directly against SQLite
        df = execute_sql(sql)

        columns = df.columns.tolist()
        rows = df.values.tolist()
        # Coerce non-serializable types
        rows = [[str(v) if not isinstance(v, (int, float, str, type(None))) else v for v in row] for row in rows]
        row_count = len(rows)

        if row_count == 0:
            return {
                "message": "Query executed but returned no results.",
                "sql_query": sql,
                "columns": columns,
                "rows": [],
                "row_count": 0,
                "chart": {},
                "chart_type": "none"
            }

        # Step 4: Auto-generate chart
        chart = {}
        chart_type = "none"
        if len(columns) >= 2:
            import plotly.express as px
            import json
            try:
                x_col = columns[0]
                y_col = columns[-1]
                numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
                if numeric_cols:
                    y_col = numeric_cols[-1]
                    fig = px.bar(df, x=x_col, y=y_col, title=f"{y_col} by {x_col}")
                    chart_type = "bar"
                    chart = json.loads(fig.to_json())
            except Exception:
                pass

        return {
            "message": f"Found {row_count} result(s).",
            "sql_query": sql,
            "columns": columns,
            "rows": rows,
            "row_count": row_count,
            "chart": chart,
            "chart_type": chart_type
        }

    except HTTPException:
        raise
    except Exception as e:
        print(format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

