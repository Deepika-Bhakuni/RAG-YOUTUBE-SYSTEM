import { useEffect, useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function changeTheme(event) {
    setTheme(event.target.value);
    setMessage("Theme preference updated.");
  }

  function clearStorageItem(key, label) {
    const confirmed = window.confirm(
      `Are you sure you want to clear ${label}? This cannot be undone.`
    );

    if (!confirmed) return;

    localStorage.removeItem(key);
    setMessage(`${label} cleared.`);
  }

  return (
    <main className="settings-page">
      <h1>Settings</h1>
      <p>Manage your YouTube RAG Assistant preferences and saved data.</p>

      {message && <p className="settings-message" role="status">{message}</p>}

      <section className="settings-card">
        <h2>Appearance</h2>
        <p>Choose your preferred theme.</p>

        <label htmlFor="settings-theme">Theme</label>
        <select
          id="settings-theme"
          value={theme}
          onChange={changeTheme}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      <section className="settings-card">
        <h2>Chat History</h2>
        <p>Remove your locally saved chat history.</p>
        <button
          type="button"
          className="settings-danger"
          onClick={() => clearStorageItem("chatHistory", "chat history")}
        >
          Clear Chat History
        </button>
      </section>

      <section className="settings-card">
        <h2>Video Library</h2>
        <p>Remove all videos saved in your library.</p>
        <button
          type="button"
          className="settings-danger"
          onClick={() =>
            clearStorageItem("youtubeRagVideoLibrary", "video library")
          }
        >
          Clear Video Library
        </button>
      </section>

      <section className="settings-card">
        <h2>Saved Summaries</h2>
        <p>Remove all summaries saved on this browser.</p>
        <button
          type="button"
          className="settings-danger"
          onClick={() =>
            clearStorageItem("youtubeRagSummaries", "saved summaries")
          }
        >
          Clear Summaries
        </button>
      </section>

      <section className="settings-card">
        <h2>About</h2>
        <p><strong>YouTube RAG Assistant</strong></p>
        <p>
          An application for exploring YouTube video transcripts,
          asking questions, finding relevant timestamps, and saving
          videos and study notes.
        </p>
      </section>
    </main>
  );
}