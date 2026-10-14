from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------
# IMPORT BACKEND FILES
# ---------------------------------------------------

from backend.transcript import get_transcript

from backend.rag import (
    create_chunks,
    create_vector_store,
    ask_question
)

# ---------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------

app = FastAPI()

# ---------------------------------------------------
# ENABLE CORS
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# YOUTUBE VIDEO IDS
# ---------------------------------------------------

video_ids = [
    "aircAruvnKk",   # CNN video
    "rfscVS0vtbw"    # Python video
]

# ---------------------------------------------------
# LOAD TRANSCRIPTS
# ---------------------------------------------------

all_transcripts = []

for video_id in video_ids:

    transcript_data = get_transcript(video_id)

    for item in transcript_data:
        item["video_id"] = video_id

    all_transcripts.extend(transcript_data)

# ---------------------------------------------------
# CREATE CHUNKS
# ---------------------------------------------------

chunks = create_chunks(all_transcripts)

# ---------------------------------------------------
# CREATE VECTOR DATABASE
# ---------------------------------------------------

index, embeddings = create_vector_store(chunks)

# ---------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------

class QuestionRequest(BaseModel):
    question: str

# ---------------------------------------------------
# ROOT ROUTE
# ---------------------------------------------------

@app.get("/")

def home():

    return {
        "message": "AI YouTube RAG Backend Running Successfully"
    }

# ---------------------------------------------------
# ASK AI ENDPOINT
# ---------------------------------------------------

@app.post("/ask")

def ask_ai(data: QuestionRequest):

    try:

        answer = ask_question(
            data.question,
            chunks,
            index,
            None,
            []
        )

        return {
            "answer": answer
        }

    except Exception as e:

        return {
            "error": str(e)
        }

