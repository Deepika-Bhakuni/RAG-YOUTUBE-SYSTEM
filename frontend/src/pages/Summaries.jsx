import { useEffect, useState } from "react";

const STORAGE_KEY = "youtubeRagSummaries";

export default function Summaries() {
  const [summaries, setSummaries] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSummaries(Array.isArray(saved) ? saved : []);
    } catch {
      setSummaries([]);
    }
  }, []);

  function saveSummaries(updatedSummaries) {
    setSummaries(updatedSummaries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSummaries));
  }

  function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !summary.trim()) {
      setMessage("Please enter a video title and summary.");
      return;
    }

    const newSummary = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      url: url.trim(),
      text: summary.trim(),
      savedAt: new Date().toISOString(),
    };

    saveSummaries([newSummary, ...summaries]);
    setTitle("");
    setUrl("");
    setSummary("");
    setMessage("Summary saved successfully.");
  }

  function handleDelete(id) {
    saveSummaries(summaries.filter((item) => item.id !== id));
    setMessage("Summary deleted.");
  }

  return (
    <main className="summaries-page">
      <h1>Video Summaries</h1>
      <p>Save and revisit important notes from your YouTube videos.</p>

      <form className="summary-form" onSubmit={handleSave}>
        <label htmlFor="summary-title">Video title</label>
        <input
          id="summary-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. SQL Tutorial for Beginners"
          required
        />

        <label htmlFor="summary-url">YouTube URL (optional)</label>
        <input
          id="summary-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />

        <label htmlFor="summary-text">Summary or notes</label>
        <textarea
          id="summary-text"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Paste your video summary or study notes here..."
          rows={6}
          required
        />

        <button type="submit">Save Summary</button>
      </form>

      {message && <p role="status">{message}</p>}

      <h2>Saved Summaries ({summaries.length})</h2>

      {summaries.length === 0 ? (
        <div className="summary-empty">
          <h3>No summaries saved yet</h3>
          <p>Add a title and summary above to start building your study notes.</p>
        </div>
      ) : (
        <div className="summary-list">
          {summaries.map((item) => (
            <article className="summary-card" key={item.id}>
              <h3>{item.title}</h3>
              <p className="summary-date">
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </p>
              <p className="summary-text">{item.text}</p>

              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open YouTube Video
                </a>
              )}

              <div>
                <button
                  type="button"
                  className="summary-delete"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete Summary
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}