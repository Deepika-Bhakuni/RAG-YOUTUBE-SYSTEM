import { useState } from "react";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleLogin=()=>{
    console.log(email,password);
  }

  return(
    <div className="auth-page">
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}