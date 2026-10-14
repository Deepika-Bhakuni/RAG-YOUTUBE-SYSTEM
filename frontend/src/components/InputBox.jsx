import { useState } from "react";

function InputBox() {
  const [message, setMessage] = useState("");

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="Ask about your videos..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button>Send</button>
    </div>
  );
}

export default InputBox;