import os
from functools import lru_cache
from urllib.parse import urlparse, parse_qs
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()

app = FastAPI(title="YouTube Video RAG Q&A API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = []


def extract_video_id(video: str) -> str:
    video = video.strip()
    parsed = urlparse(video if "://" in video else f"https://{video}")
    hostname = (parsed.hostname or "").lower()
    video_id = None

    if hostname in {
        "youtube.com", "www.youtube.com", "m.youtube.com",
        "music.youtube.com",
    }:
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
        elif parsed.path.startswith(("/shorts/", "/embed/", "/live/")):
            parts = parsed.path.strip("/").split("/")
            if len(parts) > 1:
                video_id = parts[1]

    elif hostname in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/").split("/")[0]

    elif re.fullmatch(r"[A-Za-z0-9_-]{11}", video):
        video_id = video

    if not video_id or not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise ValueError("Please provide a valid YouTube URL or video ID.")

    return video_id


def get_transcript_segments(video_id: str) -> list[dict]:
    transcript = YouTubeTranscriptApi().fetch(video_id)
    return [
        {
            "text": item.text,
            "start": item.start,
            "video_id": video_id,
        }
        for item in transcript
    ]


@lru_cache(maxsize=8)
def get_video_rag(video_id: str):
    """Create and cache a vector index for a video."""
    from rag import create_chunks, create_vector_store

    transcript_segments = get_transcript_segments(video_id)
    chunks = create_chunks(transcript_segments)

    if not chunks:
        raise ValueError("No transcript chunks were created for this video.")

    index, embeddings = create_vector_store(chunks)
    return chunks, index


class TranscriptRequest(BaseModel):
    video: str


class QuestionRequest(BaseModel):
    question: str
    video: str


class SummaryRequest(BaseModel):
    video: str


@app.get("/")
def home():
    return {"message": "YouTube Video RAG Q&A API is running."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/transcript")
def transcript(video: str):
    try:
        video_id = extract_video_id(video)
        segments = get_transcript_segments(video_id)
        transcript_text = " ".join(item["text"] for item in segments).strip()

        if not transcript_text:
            raise HTTPException(
                status_code=404,
                detail="The video transcript is empty.",
            )

        return {
            "success": True,
            "video_id": video_id,
            "transcript": transcript_text,
        }

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve this video's transcript. Captions may be unavailable or inaccessible.",
        )


@app.post("/ask")
def ask_ai(data: QuestionRequest):
    question = data.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        video_id = extract_video_id(data.video)
        chunks, index = get_video_rag(video_id)

        from rag import ask_question

        answer = ask_question(
            question,
            chunks,
            index,
            video_id,
            chat_history,
        )

        chat_history.append({"question": question, "answer": answer})
        del chat_history[:-20]

        return {"answer": answer, "video_id": video_id}

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        print("RAG question error:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not answer the question. Check the backend terminal for details.",
        )


@app.post("/summary")
def summarize_video(data: SummaryRequest):
    try:
        video_id = extract_video_id(data.video)
        segments = get_transcript_segments(video_id)
        transcript_text = " ".join(item["text"] for item in segments).strip()

        if not transcript_text:
            raise HTTPException(status_code=404, detail="Transcript is empty.")

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GROQ_API_KEY is not configured on the backend.",
            )

        from groq import Groq
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Summarize the supplied YouTube transcript accurately. "
                        "Use clear headings, key takeaways, and important details. "
                        "Do not invent information not supported by the transcript."
                    ),
                },
                {
                    "role": "user",
                    "content": transcript_text[:24000],
                },
            ],
            temperature=0.3,
        )

        return {
            "success": True,
            "video_id": video_id,
            "summary": response.choices[0].message.content,
        }

    except HTTPException:
        raise
    except Exception as exc:
        print("Summary error:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Could not generate the summary. Check the backend terminal for details.",
        )
