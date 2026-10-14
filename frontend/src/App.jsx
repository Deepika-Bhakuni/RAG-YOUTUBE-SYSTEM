import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import ChatPage from "./pages/ChatPage";
import VideoLibrary from "./pages/VideoLibrary";
import Summaries from "./pages/Summaries";
import Settings from "./pages/Settings";
import Login from "./components/Login";
import Signup from "./components/Signup";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main">
          <Navbar />

          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/videos" element={<VideoLibrary />} />
            <Route path="/summaries" element={<Summaries />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;