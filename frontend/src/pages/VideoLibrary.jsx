import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "youtubeRagVideoLibrary";

function getVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setVideos(Array.isArray(saved) ? saved : []);
    } catch {
      setVideos([]);
    }
  }, []);

  function saveVideos(updatedVideos) {
    setVideos(updatedVideos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
  }

  function addVideo(event) {
    event.preventDefault();
    setMessage("");

    const cleanUrl = url.trim();
    const videoId = getVideoId(cleanUrl);

    if (!videoId) {
      setMessage("Please enter a valid YouTube video URL.");
      return;
    }

    if (videos.some((video) => video.id === videoId)) {
      setMessage("This video is already in your library.");
      return;
    }

    const newVideo = {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: `YouTube video (${videoId})`,
      addedAt: new Date().toISOString(),
    };

    saveVideos([newVideo, ...videos]);
    setUrl("");
    setMessage("Video saved to your library.");
  }

  function removeVideo(id) {
    saveVideos(videos.filter((video) => video.id !== id));
    setMessage("Video removed from your library.");
  }

  return (
    <main className="library-page">
      <h1>Video Library</h1>
      <p>Save and organize the YouTube videos you want to study.</p>

      <form className="library-form" onSubmit={addVideo}>
        <label htmlFor="library-video-url">YouTube video URL</label>
        <div className="library-input-row">
          <input
            id="library-video-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
          <button type="submit">Add Video</button>
        </div>
      </form>

      {message && <p role="status" className="library-message">{message}</p>}

      <h2>Saved Videos ({videos.length})</h2>

      {videos.length === 0 ? (
        <div className="library-empty">
          <p>Your library is empty.</p>
          <p>Add a YouTube URL above to save it here.</p>
          <Link to="/">Go to Chat</Link>
        </div>
      ) : (
        <div className="library-grid">
          {videos.map((video) => (
            <article className="library-card" key={video.id}>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt="YouTube video thumbnail"
                />
              </a>
              <h3>{video.title}</h3>
              <p className="library-video-id">Video ID: {video.id}</p>
              <div className="library-card-actions">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch Video
                </a>
                <button type="button" onClick={() => removeVideo(video.id)}>
                  Remove
                </button>
              </div>
              <p className="library-added">
                Saved {new Date(video.addedAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}