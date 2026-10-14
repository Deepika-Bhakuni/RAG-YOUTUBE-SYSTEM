import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>YouTube RAG</h2>

      <nav>
        <Link to="/">💬 Chat</Link>
        <Link to="/videos">🎥 Video Library</Link>
        <Link to="/summaries">📄 Summaries</Link>
        <Link to="/settings">⚙ Settings</Link>
      </nav>

      <div className="sidebar-footer">
        Backend Connected
      </div>
    </div>
  );
}