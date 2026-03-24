# NLP to SQL Chatbot Backend

This is a production-ready backend for a natural language to SQL (NL2SQL) chatbot designed for a clinical database system. It uses **Vanna AI 2.0** with Google Gemini and **FastAPI**.

## Architecture

* **Database Engine**: Local SQLite database (`clinic.db`) with schemas for Patients, Doctors, Appointments, Treatments, and Invoices.
* **LLM Engine**: Google Gemini (via `vanna_setup.py` and `GeminiLlmService`). Vanna translates English text into valid SQL queries based on the database schema and seeded memory.
* **API Framework**: FastAPI provides two main endpoints: `/health` for system status, and `/chat` for questioning the DB.
* **Safety mechanisms**: Custom SQL validation ensures no destructive operations (INSERT, DELETE, UPDATE, DROP, ALTER, EXEC, etc.) can be performed by the LLM-generated queries, allowing only SELECT statements and entirely blocking access to schema tables (`sqlite_master`).
* **Visual Data**: Built-in logic creates automatic Plotly charts (bar, pie) depending on the returned query data.

## Setup Instructions

**1. Create virtual environment and install dependencies**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

**2. Configure Environment Variables**
Create a `.env` file in the project folder with your API key:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

**3. Setup Database**
Generates `clinic.db` with dummy realistic clinical data:
```bash
python setup_database.py
```

**4. Seed Memory**
Train Vanna with 15 initial question-to-SQL pairs to guide it for optimal accuracy:
```bash
python seed_memory.py
```

## Running the API

Start the FastAPI application on Uvicorn:
```bash
uvicorn main:app --port 8000
```
*API docs available at: http://localhost:8000/docs*

## API Usage

### `GET /health`
Returns the status of the database and Vanna agent memory.
```json
{
  "status": "ok",
  "database": "connected",
  "agent_memory_items": 15
}
```

### `POST /chat`
Submits a natural language query.
**Request body:**
```json
{
  "question": "Top 5 patients by total invoice amount"
}
```

**Response body:**
```json
{
  "message": "Execution successful. Retrieved 5 rows.",
  "sql_query": "SELECT p.first_name, p.last_name, SUM(i.amount) as total FROM patients p JOIN invoices i ON p.patient_id = i.patient_id GROUP BY p.patient_id ORDER BY total DESC LIMIT 5;",
  "columns": ["first_name", "last_name", "total"],
  "rows": [["John", "Doe", 4500.0], ...],
  "row_count": 5,
  "chart": {...},
  "chart_type": "bar"
}
```
