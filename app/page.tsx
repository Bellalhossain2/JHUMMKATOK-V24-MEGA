"use client";
import { useState } from "react";

export default function Page() {
  const [user, setUser] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState<string[]>([]);
  if (!user) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "#000", color: "#fff" }}>
        <h1>JHUMMKATOK V24 MEGA</h1>
        <button onClick={() => setUser(true)} style={{ padding: 15, marginTop: 20, cursor: "pointer" }}>Enter Chat</button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <div style={{ padding: 15, background: "#111" }}><b>JHUMMKATOK V24 MEGA - LIVE</b></div>
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>{msgs.map((m, i) => <div key={i} style={{ background: "#222", padding: 10, marginBottom: 10, borderRadius: 10 }}>{m}</div>)}</div>
      <div style={{ padding: 15, display: "flex", gap: 10 }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} style={{ flex: 1, padding: 12 }} />
        <button onClick={() => { if(msg){ setMsgs([...msgs, msg]); setMsg(""); } }}>Send</button>
      </div>
    </div>
  );
} 
