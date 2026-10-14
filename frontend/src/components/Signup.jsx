import { useState } from "react";

export default function Signup() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleSignup=()=>{
    console.log(email,password);
  }

  return(
    <div className="auth-page">
      <h1>Signup</h1>

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

      <button onClick={handleSignup}>
        Signup
      </button>
    </div>
  )
}