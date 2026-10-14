import { useState, useRef, useEffect } from "react"
import axios from "axios"

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void: #020408;
    --bg-deep: #060d1a;
    --bg-panel: rgba(8, 18, 38, 0.85);
    --bg-glass: rgba(14, 30, 60, 0.6);
    --bg-input: rgba(10, 22, 48, 0.9);
    --accent-cyan: #00e5ff;
    --accent-blue: #0084ff;
    --accent-purple: #7c3aff;
    --accent-glow: rgba(0, 229, 255, 0.15);
    --border-subtle: rgba(0, 180, 255, 0.12);
    --border-glow: rgba(0, 229, 255, 0.35);
    --text-primary: #e8f4ff;
    --text-secondary: #6b8caa;
    --text-muted: #2d4a6a;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  body {
    background: var(--bg-void);
    font-family: var(--font-display);
    color: var(--text-primary);
    margin: 0;
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    min-height: 100vh;;
    display: flex;
}

  .noise-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0, 180, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 180, 255, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }

  .orb-1 {
    position: fixed; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 84, 255, 0.12) 0%, transparent 70%);
    top: -200px; left: -200px; pointer-events: none; z-index: 0;
    animation: driftOrb1 20s ease-in-out infinite alternate;
  }
  .orb-2 {
    position: fixed; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124, 58, 255, 0.1) 0%, transparent 70%);
    bottom: -150px; right: -100px; pointer-events: none; z-index: 0;
    animation: driftOrb2 25s ease-in-out infinite alternate;
  }
  @keyframes driftOrb1 { from { transform: translate(0,0); } to { transform: translate(80px, 60px); } }
  @keyframes driftOrb2 { from { transform: translate(0,0); } to { transform: translate(-60px, -80px); } }

  .sidebar {
    width: 260px; flex-shrink: 0;
    background: var(--bg-panel);
    border-right: 1px solid var(--border-subtle);
    backdrop-filter: blur(24px);
    display: flex; flex-direction: column;
    padding: 24px 0; position: relative; z-index: 10;
  }

  .sidebar-logo {
    padding: 0 24px 28px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .logo-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 0 20px rgba(0, 132, 255, 0.35);
  }
  .logo-icon svg { width: 20px; height: 20px; fill: white; }
  .logo-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-primary); }
  .logo-tag {
    font-size: 10px; font-family: var(--font-mono); color: var(--accent-cyan);
    letter-spacing: 2px; margin-top: 2px; text-transform: uppercase;
  }

  .sidebar-section { padding: 20px 16px 8px; }
  .sidebar-label {
    font-size: 9px; font-family: var(--font-mono); letter-spacing: 3px;
    color: var(--text-muted); text-transform: uppercase; padding: 0 8px; margin-bottom: 8px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px; cursor: pointer;
    font-size: 13px; color: var(--text-secondary); font-weight: 500;
    transition: all 0.2s; margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--bg-glass); color: var(--text-primary); }
  .nav-item.active {
    background: rgba(0, 229, 255, 0.08);
    color: var(--accent-cyan);
    border: 1px solid rgba(0, 229, 255, 0.18);
    box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.05);
  }
  .nav-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent-cyan);
    box-shadow: 0 0 8px var(--accent-cyan);
    flex-shrink: 0;
  }
  .nav-item .nav-icon { width: 16px; height: 16px; opacity: 0.6; }
  .nav-item.active .nav-icon { opacity: 1; }

  .sidebar-footer {
    margin-top: auto; padding: 20px 16px;
    border-top: 1px solid var(--border-subtle);
  }
  .status-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 8px;
    background: rgba(0, 255, 128, 0.06);
    border: 1px solid rgba(0, 255, 128, 0.15);
  }
  .status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00ff88; flex-shrink: 0;
    box-shadow: 0 0 8px #00ff88;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  .status-text { font-size: 11px; font-family: var(--font-mono); color: #00ff88; }

  .main {
    flex: 1; display: flex; flex-direction: column;
    width: calc(100% - 260px); min-width: 0;overflow: hidden;
  }

  .topbar {
    padding: 18px 32px;
    border-bottom: 1px solid var(--border-subtle);
    backdrop-filter: blur(12px);
    background: rgba(2, 4, 8, 0.5);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .topbar-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
  .topbar-sub { font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); margin-top: 2px; }
  .topbar-actions { display: flex; gap: 8px; }
  .icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-glass);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
  }
  .icon-btn:hover { border-color: var(--border-glow); background: var(--accent-glow); }
  .icon-btn svg { width: 15px; height: 15px; stroke: var(--text-secondary); fill: none; }

  .chat-area {
    flex: 1; overflow-y: auto; padding: 32px; width: 100%;
    display: flex; flex-direction: column; gap: 20px;
    scroll-behavior: smooth;
     min-height: 0; 
     padding-bottom: 20px;
  }
  .chat-area::-webkit-scrollbar { width: 4px; }
  .chat-area::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 2px; }

  .welcome-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: auto; flex: 1;
    
  }
  .welcome-orb {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(0,132,255,0.2), rgba(124,58,255,0.2));
    border: 1px solid rgba(0,132,255,0.3);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px;
    box-shadow: 0 0 40px rgba(0,132,255,0.15), inset 0 0 30px rgba(124,58,255,0.1);
    animation: rotateGlow 8s linear infinite;
  }
  @keyframes rotateGlow { from{box-shadow: 0 0 40px rgba(0,132,255,0.15), 0 0 0 rgba(124,58,255,0.1);} 50%{box-shadow: 0 0 60px rgba(124,58,255,0.2), 0 0 40px rgba(0,132,255,0.1);} to{box-shadow: 0 0 40px rgba(0,132,255,0.15), 0 0 0 rgba(124,58,255,0.1);} }
  .welcome-orb svg { width: 36px; height: 36px; }
  .welcome-h { font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; letter-spacing: -0.5px; }
  .welcome-p { font-size: 14px; color: var(--text-secondary); max-width: 380px; line-height: 1.7; }
  .welcome-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 24px; }
  .welcome-chip {
    padding: 7px 14px; border-radius: 20px; font-size: 12px;
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary); cursor: pointer;
    transition: all 0.2s; font-family: var(--font-mono);
    background: var(--bg-glass);
  }
  .welcome-chip:hover { border-color: var(--border-glow); color: var(--accent-cyan); background: var(--accent-glow); }

  @keyframes fadeUp { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }

  .msg-row { display: flex; gap: 12px; animation: fadeUp 0.35s ease; }
  .msg-row.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
  }
  .msg-avatar.ai {
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    box-shadow: 0 0 14px rgba(0,132,255,0.3);
    font-family: var(--font-mono);
    color: white;
  }
  .msg-avatar.user { background: rgba(255,255,255,0.08); color: var(--text-secondary); }

  .msg-bubble {
    max-width: 72%; padding: 14px 18px; border-radius: 14px;
    font-size: 14px; line-height: 1.75;
  }
  .msg-bubble.ai {
    background: var(--bg-glass);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    border-top-left-radius: 4px;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  }
  .msg-bubble.user {
    background: linear-gradient(135deg, rgba(0,84,255,0.25), rgba(124,58,255,0.2));
    border: 1px solid rgba(0,132,255,0.25);
    color: var(--text-primary);
    border-top-right-radius: 4px;
  }

  .msg-label {
    font-size: 10px; font-family: var(--font-mono); letter-spacing: 1px;
    color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;
  }

  .typing-dots { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
  .typing-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent-cyan);
    box-shadow: 0 0 8px var(--accent-cyan);
    animation: typingBounce 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%,100%{transform:translateY(0);opacity:0.4;} 50%{transform:translateY(-6px);opacity:1;} }

  .input-dock {
    padding: 20px 32px; background: rgba(2,4,8,0.8);
    border-top: 1px solid var(--border-subtle);
    backdrop-filter: blur(20px); flex-shrink: 0;
    position: relative;
    z-index: 50;
  }
  .input-wrap {
    display: flex; gap: 12px; align-items: flex-end;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 14px; padding: 12px 14px;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .input-wrap:focus-within {
    border-color: var(--border-glow);
    box-shadow: 0 0 0 3px rgba(0,229,255,0.07), 0 0 30px rgba(0,180,255,0.08);
  }

  textarea.ai-input {
    flex: 1; background: transparent; border: none; outline: none; resize: none;
    font-family: var(--font-display); font-size: 14px;
    color: var(--text-primary); line-height: 1.6; min-height: 22px; max-height: 160px;
  }
  textarea.ai-input::placeholder { color: var(--text-muted); }

  .send-btn {
    width: 40px; height: 40px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
    box-shadow: 0 0 20px rgba(0,132,255,0.3);
  }
  .send-btn:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 0 30px rgba(0,132,255,0.5);
  }
  .send-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .send-btn svg { width: 18px; height: 18px; fill: white; }
  .send-btn.loading { background: linear-gradient(135deg, #1a4a7a, #4a2a7a); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }

  .input-meta {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px; padding: 0 2px;
  }
  .input-hint { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); }
  .char-count { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); }

  .scanner-line {
    height: 1px; width: 100%;
    background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
    opacity: 0;
    animation: scanFade 3s ease-in-out infinite;
  }
  @keyframes scanFade { 0%,100%{opacity:0;} 50%{opacity:0.4;} }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .chat-area { padding: 20px; }
    .input-dock { padding: 14px 20px; }
    .msg-bubble { max-width: 88%; font-size: 13px; }
  }

  @keyframes cursor-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  .cursor { display: inline-block; animation: cursor-blink 1s step-end infinite; color: var(--accent-cyan); }
`

const PROMPTS = [
  "Summarize this YouTube video for me",
  "What are the key takeaways?",
  "Explain the main concept in simple terms",
  "List all actionable tips mentioned",
]

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const i = useRef(0)

  useEffect(() => {
    i.current = 0
    setDisplayed("")
    setDone(false)
    const interval = setInterval(() => {
      if (i.current < text.length) {
        setDisplayed(text.slice(0, i.current + 1))
        i.current++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span className="cursor">▋</span>}
    </span>
  )
}

export default function App() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollBottom = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight
      }
    }, 50)
  }

  const askAI = async (q) => {

  const query = (q || question).trim()

  if (!query || loading) return

  const userMsg = {
    role: "user",
    text: query
  }

  setMessages((prev) => [...prev, userMsg])

  setQuestion("")

  setLoading(true)

  scrollBottom()

  if (textareaRef.current) {
    textareaRef.current.style.height = "22px"
  }

  try {

    const response = await axios.post(
      "http://127.0.0.1:8000/ask",
      {
        question: query
      }
    )

    const aiMsg = {
      role: "ai",
      text: response.data.answer
    }

    setMessages((prev) => [...prev, aiMsg])

  } catch (error) {

    console.log(error)

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "⚠️ Backend connection failed. Make sure FastAPI server is running."
      }
    ])

  } finally {

    setLoading(false)

    scrollBottom()

  }
}
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      askAI()
    }
  }

  const handleTextarea = (e) => {
    setQuestion(e.target.value)
    e.target.style.height = "22px"
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="logo-name">NexusAI</div>
          <div className="logo-tag">YouTube RAG v2.0</div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          <div className="nav-item active">
            <div className="nav-dot" />
            Chat Assistant
          </div>
          <div className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            Video Library
          </div>
          <div className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            Summaries
          </div>
          <div className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            Settings
          </div>
        </div>

        <div className="sidebar-section" style={{marginTop: "12px"}}>
          <div className="sidebar-label">Recent Chats</div>
          {["Python tutorial Q&A", "React hooks explained", "ML fundamentals"].map((t, i) => (
            <div key={i} className="nav-item" style={{fontSize: "12px"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" style={{flexShrink:0, opacity:0.5}}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="status-chip">
            <div className="status-dot" />
            <div className="status-text">Backend connected</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="scanner-line" />

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <div className="topbar-title">AI YouTube RAG Assistant</div>
            <div className="topbar-sub">Powered by FastAPI · RAG Pipeline · Claude</div>
          </div>
          <div className="topbar-actions">
            <div className="icon-btn" title="Clear chat" onClick={() => setMessages([])}>
              <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <div className="icon-btn" title="New session">
              <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>
            </div>
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-area" ref={chatRef}>
          {messages.length === 0 && !loading && (
            <div className="welcome-state">
              <div className="welcome-orb">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="28" stroke="url(#gr1)" strokeWidth="1.5" />
                  <circle cx="40" cy="40" r="18" stroke="url(#gr1)" strokeWidth="1" opacity="0.5"/>
                  <circle cx="40" cy="40" r="8" fill="url(#gr1)" opacity="0.8"/>
                  <defs>
                    <linearGradient id="gr1" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00e5ff"/>
                      <stop offset="1" stopColor="#7c3aff"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="welcome-h">Ready to Explore Your Videos</div>
              <div className="welcome-p">Ask me anything about YouTube videos you've loaded. I'll use RAG to find precise, contextual answers.</div>
              <div className="welcome-chips">
                {PROMPTS.map((p, i) => (
                  <div key={i} className="welcome-chip" onClick={() => askAI(p)}>{p}</div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className={`msg-avatar ${msg.role}`}>
                {msg.role === "ai" ? "AI" : "U"}
              </div>
              <div className={`msg-bubble ${msg.role}`}>
                <div className="msg-label">
                  {msg.role === "ai" ? "NexusAI · RAG" : "You"}
                </div>
                {msg.role === "ai" && i === messages.length - 1 && !loading
                  ? <TypingText text={msg.text} />
                  : msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-row">
              <div className="msg-avatar ai">AI</div>
              <div className="msg-bubble ai">
                <div className="msg-label">NexusAI · Thinking</div>
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="input-dock">
          <div className="input-wrap">
            <textarea
              ref={textareaRef}
              className="ai-input"
              value={question}
              onChange={handleTextarea}
              onKeyDown={handleKey}
              placeholder="Ask about your YouTube videos…"
              rows={1}
            />
            <button
              className={`send-btn ${loading ? "loading" : ""}`}
              onClick={() => askAI()}
              disabled={loading || !question.trim()}
              title="Send"
            >
              {loading
                ? <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>
                : <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              }
            </button>
          </div>
          <div className="input-meta">
            <div className="input-hint">↵ to send · Shift+↵ for newline</div>
            <div className="char-count">{question.length} chars</div>
          </div>
        </div>
      </div>
    </>
  )
}