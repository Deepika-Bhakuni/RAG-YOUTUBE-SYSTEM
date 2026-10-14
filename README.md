# YouTube Video RAG Q&A System

An AI-powered application that allows users to interact with YouTube video content by asking questions and retrieving relevant answers from video transcripts.

## Features

- YouTube transcript extraction
- Retrieval-Augmented Generation (RAG) question answering
- Semantic search using FAISS
- Sentence embeddings using Sentence Transformers
- Timestamp-based information retrieval
- Support for multiple YouTube videos
- Chat history
- Video library
- Video summaries and notes
- Light and dark themes
- React frontend and FastAPI backend

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Python, FastAPI  
**Machine Learning:** Sentence Transformers, FAISS  
**Data Source:** YouTube video transcripts

## Project Structure

```text
RAG-YOUTUBE-SYSTEM/
├── backend/
│   ├── api.py
│   ├── main.py
│   ├── rag.py
│   ├── summary.py
│   ├── transcript.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── app.py
├── start-project.bat
└── .gitignore
```

## Getting Started

### Prerequisites

- Python
- Node.js and npm
- A valid API key if required by your backend configuration

### Backend Setup

Open a terminal in the project directory and run:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables using `backend/.env.example`. Add your own API key locally; never upload real credentials to GitHub.

Start the backend:

```bash
uvicorn main:app --reload
```

Backend API documentation: http://127.0.0.1:8000/docs

### Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Security

API keys and other secrets must remain in local environment files and must never be committed to the repository.

## Future Improvements

- Improve automatic video summarization
- Add deployment support
- Enhance retrieval quality and answer evaluation

## Author

Deepika Bhakuni

GitHub: https://github.com/Deepika-Bhakuni
