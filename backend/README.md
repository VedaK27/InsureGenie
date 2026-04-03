# FastAPI Backend Setup Guide (Windows & macOS)

This guide explains how to set up and run the FastAPI backend project on **Windows** and **macOS** systems. Follow the steps carefully to ensure the backend runs successfully.

---

# Project Structure

```
backend/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   └── services/
│
├── venv/
├── .env
└── requirements.txt
```

---

# Prerequisites

Before starting, make sure you have:

* Python **3.9 or higher** installed
* pip (Python package manager)
* Git (optional but recommended)
* Internet connection

To check Python installation:

```
python --version
```

On macOS, you may need to use:

```
python3 --version
```

---

# Step 1 — Clone or Download the Project

If using Git:

```
git clone <repository-url>
cd backend
```

Or manually download and open the **backend** folder in your terminal.

---

# Step 2 — Create Virtual Environment

## On macOS

```
python3 -m venv venv
.\venv\Scripts\Activate
uvicorn app.main:app --reload
```

## On Windows

```
python -m venv venv
```

---

# Step 3 — Activate Virtual Environment

## On macOS / Linux

```
source venv/bin/activate
```

## On Windows (Command Prompt)

```
venv\Scripts\activate
```

## On Windows (PowerShell)

```
venv\Scripts\Activate.ps1
```

After activation, you should see:

```
(venv)
```

---

# Step 4 — Install Dependencies

Install required Python packages:

```
pip install -r requirements.txt
```

If `requirements.txt` does not exist, install manually:

```
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

---

# Step 5 — Configure Environment Variables

Create a `.env` file in the **backend** folder.

Example:

```
DATABASE_URL=postgresql://postgres:<YOUR_PASSWORD>@<HOST>:5432/postgres
```

Replace:

* `<YOUR_PASSWORD>` with your database password
* `<HOST>` with your database host

---

# Step 6 — Run the FastAPI Server

From the **backend** folder, run:

```
uvicorn app.main:app --reload
```

You should see output similar to:

```
Uvicorn running on http://127.0.0.1:8000
```

---

# Step 7 — Access the API

Open your browser and visit:

```
http://127.0.0.1:8000
```

Interactive API documentation:

```
http://127.0.0.1:8000/docs
```

---

# Deactivate Virtual Environment

When finished working:

```
deactivate
```

---

# Troubleshooting

## Error: "Could not import module main"

Make sure you run:

```
uvicorn app.main:app --reload
```

Not:

```
uvicorn main:app --reload
```

---

## Error: "command not found: python"

Use:

```
python3
```

---

## VS Code Shows Import Errors but API Runs

Select the correct Python interpreter:

1. Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows)
2. Select **Python: Select Interpreter**
3. Choose:

```
venv/bin/python
```

---

# Updating Dependencies

To update packages:

```
pip install --upgrade pip
pip install -r requirements.txt
```

---

# Recommended Development Workflow

```
1. Activate virtual environment
2. Install dependencies
3. Run server
4. Develop APIs
```

---

# Quick Start Summary

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

Your backend should now be running successfully on both **Windows** and **macOS**.
