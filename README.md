# NLP-SQL Clinical Chatbot

A full-stack application that translates natural language questions into valid SQL queries, executes them against a local clinical database, and visualizes the results.

This project is divided into two parts:
1. **Frontend (React / Vite)**: A beautiful dashboard interface built with Tailwind CSS and Shadcn UI components.
2. **Backend (FastAPI / Vanna AI)**: A secure, structured LLM reasoning engine that uses Gemini to map language to SQLite tables, blocks destructive queries, and streams back intelligent data arrays and dynamic Plotly charts.

## Project Structure
```
NLP-SQL-Chatbot/
├── backend/               # FastAPI & Vanna Python Server
│   ├── main.py            # API Endpoints (/chat, /health)
│   ├── setup_database.py  # Generates initial sqlite DB schemas (clinic.db)
│   ├── vanna_setup.py     # Configures Google Gemini AI
│   └── seed_memory.py     # Trains Vanna with specific local clinical mappings
├── frontend/              # Vite + React Dashboard UI
│   ├── src/pages/         # Dashboard.tsx interface
│   ├── src/components/    # Reusable UI components
│   └── src/services/      # Axios API integration
└── README.md
```

## Quick Start

### 1. Backend Setup

1. Open a terminal in the `backend/` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/.env` with your API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```
5. Initialize the database and train the AI memory:
   ```bash
   python setup_database.py
   python seed_memory.py
   ```
6. Start the API server:
   ```bash
   uvicorn main:app --port 8000
   ```
   *The API will run on http://localhost:8000. You can view the docs at http://localhost:8000/docs*

### 2. Frontend Setup

1. Open a **new** terminal in the `frontend/` directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at http://localhost:8080*

## Security & Features

* **Read-only SQL Execution**: The backend includes a tight security validator that parses LLM outputs. It explicitly blocks data modification (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`) and restricts access to schema system tables (`sqlite_master`).
* **Visual Data Parsing**: Generates bar charts, pie charts, and contextualized data tables out-of-the-box depending on query shape.
* **Intelligent Demo Memory**: 15 pre-seeded mapping questions train the agent to understand domain-specific aliases (like "who is the busiest doctor?").
