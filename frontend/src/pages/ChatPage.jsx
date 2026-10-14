
import { useState, useEffect } from "react";

const EXAMPLE_QUESTIONS = [
  "What is this video about?",
  "Explain the main concepts simply.",
  "What are the key takeaways?",
];

export default function ChatPage() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chatHistory");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const loadVideo = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSummary("");
    setTranscript("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transcript?video=${encodeURIComponent(url.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.transcript) {
        throw new Error(
          data.detail || "Could not load the video transcript."
        );
      }

      setTranscript(data.transcript);
    } catch (err) {
      setError(
        err.message || "Cannot connect to the backend. Check that it is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = () => {
    if (!transcript) {
      setError("Please load a video first.");
      return;
    }

    setError("");
    setSummary(
      transcript.length > 700
        ? transcript.substring(0, 700) + "..."
        : transcript
    );
  };

  const handleAsk = async (questionOverride) => {
    const currentQuestion = (
      typeof questionOverride === "string" ? questionOverride : question
    ).trim();

    if (!url.trim()) {
      setError("Please enter and load a YouTube video first.");
      return;
    }

    if (!transcript) {
      setError("Please wait until the video transcript has loaded.");
      return;
    }

    if (!currentQuestion) {
      setError("Please type a question.");
      return;
    }

    setAsking(true);
    setError("");
    setAnswer("");
    setQuestion(currentQuestion);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          video: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The AI could not answer your question."
        );
      }

      if (!data.answer) {
        throw new Error("The backend returned an empty answer.");
      }

      setAnswer(data.answer);

      const updated = [
        {
          question: currentQuestion,
          answer: data.answer,
          video: url.trim(),
          timestamp: new Date().toISOString(),
        },
        ...history,
      ];

      setHistory(updated);

      try {
        localStorage.setItem("chatHistory", JSON.stringify(updated));
      } catch {
        // Keep displaying the answer if browser storage is unavailable.
      }

      setQuestion("");
    } catch (err) {
      setError(
        err.message || "Could not connect to the AI. Check the backend terminal."
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="layout">
      <aside className="history-panel">
        <div className="history-heading">
          <span className="section-eyebrow">YOUR ACTIVITY</span>
          <h2>Chat History</h2>
          <p>Your previous questions and answers.</p>
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <span className="empty-icon">◷</span>
            <p>Your conversations will appear here.</p>
          </div>
        ) : (
          history.map((item, index) => (
            <button
              type="button"
              key={`${item.timestamp || "history"}-${index}`}
              className="history-item"
              onClick={() => {
                setUrl(item.video || "");
                setQuestion(item.question || "");
                setAnswer(item.answer || "");
                setError("");
              }}
              title="Restore this question and answer"
            >
              <strong>{item.question}</strong>
              <span>
                {item.answer
                  ? item.answer.substring(0, 100) +
                    (item.answer.length > 100 ? "..." : "")
                  : ""}
              </span>
            </button>
          ))
        )}
      </aside>

      <main className="chat-page">
        <header className="chat-hero">
          <span className="section-eyebrow">AI-POWERED VIDEO LEARNING</span>
          <h1>Learn from any video.</h1>
          <p className="subtitle">
            Load a YouTube video, explore its transcript, and ask questions
            to understand the content.
          </p>
        </header>

        <section className="premium-card">
          <label className="field-label" htmlFor="youtube-url">
            YouTube video URL
          </label>

          <div className="video-input-row">
            <input
              id="youtube-url"
              type="url"
              value={url}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              type="button"
              className="premium-btn"
              onClick={loadVideo}
              disabled={loading}
            >
              {loading ? "Loading video..." : "Load Video →"}
            </button>
          </div>

          {loading && (
            <p className="status-message">Loading the video transcript...</p>
          )}

          {transcript && !loading && (
            <p className="success-message">
              ✓ Transcript loaded successfully
            </p>
          )}
        </section>

        {error && (
          <div role="alert" className="error-message">
            <strong>Something needs your attention</strong>
            <p>{error}</p>
          </div>
        )}

        {!transcript && !loading && (
          <section className="welcome-card">
            <div className="welcome-icon">✦</div>
            <h2>Your video learning assistant</h2>
            <p>
              Start by pasting a YouTube URL above. Once the transcript
              loads, you can explore the content and ask questions.
            </p>
            <div className="feature-pills">
              <span>Transcript analysis</span>
              <span>AI Q&amp;A</span>
              <span>Study notes</span>
            </div>
          </section>
        )}

        {transcript && (
          <section className="transcript-card">
            <div className="section-title-row">
              <div>
                <span className="section-eyebrow">VIDEO CONTENT</span>
                <h2>Transcript</h2>
              </div>
              <span className="content-badge">Loaded</span>
            </div>

            <details>
              <summary>Read transcript</summary>
              <p className="transcript-text">{transcript}</p>
            </details>

            <button
              type="button"
              className="summary-btn"
              onClick={generateSummary}
              disabled={!transcript}
            >
              ✨ Generate Summary
            </button>
          </section>
        )}

        {summary && (
          <section className="summary-card">
            <span className="section-eyebrow">QUICK STUDY NOTES</span>
            <h2>Video Summary</h2>
            <p className="content-text">{summary}</p>
            <p className="summary-note">
              This quick summary uses the beginning of the transcript.
            </p>
          </section>
        )}

        {transcript && (
          <section className="chat-card">
            <span className="section-eyebrow">ASK YOUR VIDEO</span>
            <h2>What would you like to learn?</h2>
            <p className="chat-description">
              Ask a question about the loaded video's content.
            </p>

            {!answer && !asking && (
              <div className="example-questions">
                {EXAMPLE_QUESTIONS.map((example) => (
                  <button
                    type="button"
                    key={example}
                    className="example-question"
                    onClick={() => setQuestion(example)}
                  >
                    {example} <span>↗</span>
                  </button>
                ))}
              </div>
            )}

            {asking && (
              <div className="answer-loading" role="status">
                <span className="loading-dot" />
                <div>
                  <strong>Thinking about your question...</strong>
                  <p>Searching for relevant video information.</p>
                </div>
              </div>
            )}

            {answer && (
              <div className="user-answer">
                <span className="answer-label">AI ANSWER</span>
                <p className="content-text">{answer}</p>
              </div>
            )}

            <form
              className="ask-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!asking) handleAsk();
              }}
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="ask-input"
                placeholder="Ask something about this video..."
                disabled={asking}
                aria-label="Your question"
              />

              <button
                type="submit"
                className="ask-btn"
                disabled={asking || !question.trim()}
              >
                {asking ? "Thinking..." : "Ask AI ↑"}
              </button>
            </form>

            <p className="privacy-note">
              Answers are generated from your question and the backend's
              retrieved video context.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
