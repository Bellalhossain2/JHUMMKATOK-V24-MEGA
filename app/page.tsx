"use client";

import { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// @ts-ignore
import { joinRoom, selfId } from "trystero/torrent";

export const dynamic = "force-dynamic";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    if (!user) return;
    const r = joinRoom({ appId: "jhummkatok-v24-mega-2024" }, "global-chat");
    const [send, get] = r.makeAction("msg");
    // @ts-ignore
    r.onPeerJoin(() => setPeers((p) => p + 1));
    // @ts-ignore
    r.onPeerLeave(() => setPeers((p) => Math.max(0, p - 1)));
    // @ts-ignore
    get((data: any, peerId: string) => {
      setMessages((m) => [...m, data]);
    });
    // @ts-ignore
    setRoom({ send });
    return () => r.leave();
  }, [user]);

  const sendMsg = () => {
    if (!input.trim() || !room) return;
    const msg = { text: input, name: user.name, pic: user.picture, time: new Date().toLocaleTimeString(), id: selfId };
    room.send(msg);
    setMessages((m) => [...m, msg]);
    setInput("");
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId="10665741577-0d8k6v9l5t3r5f8q9j2k4l6m8n0p1q2r.apps.googleusercontent.com">
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "#000", color: "#fff", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 48, marginBottom: 20 }}>JHUMMKATOK V24 MEGA</h1>
          <p style={{ marginBottom: 20 }}>Login with Google to enter live chat</p>
          <GoogleLogin
            onSuccess={(cred: any) => {
              const payload = JSON.parse(atob(cred.credential.split(".")[1]));
              setUser(payload);
            }}
            onError={() => alert("Login Failed")}
          />
          <p style={{ marginTop: 20, fontSize: 12, opacity: 0.6 }}>After login you will be connected P2P via Trystero (no server)</p>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ padding: 15, background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
        <b>JHUMMKATOK V24 MEGA • LIVE • {peers + 1} online</b>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={user.picture} width={32} height={32} style={{ borderRadius: "50%" }} />
          <span>{user.name}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ background: m.id === selfId ? "#1a3a5a" : "#1a1a1a", padding: 10, borderRadius: 10, maxWidth: "80%", alignSelf: m.id === selfId ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: 12, opacity: 0.6, display: "flex", gap: 6, alignItems: "center" }}>
              <img src={m.pic} width={16} height={16} style={{ borderRadius: "50%" }} /> {m.name} • {m.time}
            </div>
            <div style={{ marginTop: 4 }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 15, background: "#111", display: "flex", gap: 10 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} placeholder="Type message..." style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#000", color: "#fff" }} />
        <button onClick={sendMsg} style={{ padding: "12px 20px", borderRadius: 8, background: "#fff", color: "#000", fontWeight: "bold", cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
} 
