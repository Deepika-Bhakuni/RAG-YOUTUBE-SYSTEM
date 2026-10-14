@echo off
title YouTube RAG Auto Start

echo Starting Backend...
start cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 6

echo Starting Frontend...
start cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5

start http://localhost:5173

exit