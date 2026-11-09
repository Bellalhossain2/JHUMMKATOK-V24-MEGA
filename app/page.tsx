"use client";
import { useState, useRef, useEffect } from "react";

export default function Page() {
  const [joined, setJoined] = useState(false);
  const [myId, setMyId] = useState("");
  const [peers, setPeers] = useState<any[]>([]);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const myStreamRef = useRef<MediaStream | null>(null);

  const joinMainRoom = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
      myStreamRef.current = stream;
      if(myVideoRef.current) myVideoRef.current.srcObject = stream;
     
      const id = "user_" + Math.floor(Math.random()*10000);
      setMyId(id);
      setJoined(true);
     
      // Add yourself + fake users to simulate multi-live
      setPeers([{id: id, name: "YOU (LIVE)", stream}]);
     
      // For demo - add 2 fake peers (in real app, other users would appear here via PeerJS)
      setTimeout(()=> {
        setPeers(prev => [...prev, {id: "host", name: "Host 1 (Room 1 Owner)", stream: null}])
      }, 500);
     
    } catch(e) {
      alert("Allow camera/mic to go LIVE!");
    }
  };

  return (
    <div style={{background:"#000", minHeight:"100vh", color:"#fff", padding:"12px"}}>
      <h1 style={{color:"#ff0050", textAlign:"center", margin:0}}>JHUMMKATOK V24 MEGA LIVE</h1>
      <p style={{textAlign:"center", opacity:.6, fontSize:"12px"}}>Room 1 is MAIN - All users LIVE together</p>

      {/* MAIN ROOM 1 */}
      <div style={{background:"#111", border:"3px solid #ff0050", borderRadius:"15px", padding:"12px", marginTop:"12px"}}>
        <h2 style={{textAlign:"center", color:"#ff0050", margin:"0 0 10px 0"}}>🔴 ROOM 1 MAIN - {joined ? peers.length : 1} LIVE NOW</h2>
       
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
          {joined ? peers.map(p=>(
            <div key={p.id} style={{background:"#222", borderRadius:"12px", overflow:"hidden", border: p.id===myId ? "2px solid #ff0050":"1px solid #333"}}>
              {p.id===myId ? <video ref={myVideoRef} autoPlay muted playsInline style={{width:"100%", height:"140px", objectFit:"cover", background:"#000"}}/>
              : <div style={{width:"100%", height:"140px", background:"#333", display:"flex", alignItems:"center", justifyContent:"center"}}>🔴 LIVE CAM</div>}
              <div style={{padding:"6px", fontSize:"12px", textAlign:"center"}}>{p.name}</div>
            </div>
          )) : (
            <div style={{gridColumn:"span 2", textAlign:"center", padding:"20px"}}>
              <div style={{background:"#222", padding:"20px", borderRadius:"12px"}}>
                <p>Host is LIVE in Room 1</p>
                <button onClick={joinMainRoom} style={{background:"#ff0050", color:"#fff", border:"none", padding:"12px 30px", borderRadius:"25px", fontWeight:"bold", marginTop:"10px", cursor:"pointer", fontSize:"16px"}}>🚀 JOIN ROOM 1 NOW - GO LIVE</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROOMS 2-15 */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"15px"}}>
        {Array.from({length:14}, (_,i)=>i+2).map(n=>(
          <div key={n} style={{background:"#111", borderRadius:"12px", padding:"12px", textAlign:"center", border:"1px solid #333"}}>
            <div style={{fontSize:"11px", opacity:.6}}>LIVE Room {n}</div>
            <div style={{fontSize:"12px", margin:"5px 0"}}>{Math.floor(Math.random()*400)+20} viewers</div>
            <button onClick={joinMainRoom} style={{width:"100%", background: joined ? "#333" : "#ff0050", color:"#fff", border:"none", padding:"8px", borderRadius:"20px", fontSize:"12px", cursor:"pointer"}}>
              {joined ? "✅ IN MAIN ROOM" : `JOIN → ROOM 1`}
            </button>
          </div>
        ))}
      </div>

      {joined && <div style={{textAlign:"center", marginTop:"15px", background:"#0f0", color:"#000", padding:"8px", borderRadius:"20px", fontSize:"12px", fontWeight:"bold"}}>✅ YOU ARE LIVE IN ROOM 1 WITH {peers.length} PEOPLE!</div>}
    </div>
  )
} 
