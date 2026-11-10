"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [user, setUser] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState<any[]>([]);
  const [peers, setPeers] = useState(0);
  const [currentRoom, setCurrentRoom] = useState("jhumm-room-1");

  useEffect(() => {
    if(!user) return;
    let room:any;
    import("trystero").then(({joinRoom})=>{
      room = joinRoom({appId:"jhummkatok-v24-mega"}, currentRoom);
      const [sendChat, getChat] = room.makeAction("chat");
      room.onPeerJoin(()=> setPeers(p=>p+1));
      room.onPeerLeave(()=> setPeers(p=>Math.max(0,p-1)));
      getChat((m:any)=> setMsgs(s=>[...s,m]));
      (window as any).sendChat = sendChat;
    });
    return ()=> room?.leave();
  }, [user, currentRoom]);

  const send = () => {
    if(!msg) return;
    const m = {id:Date.now(), text:msg, time:new Date().toLocaleTimeString()};
    (window as any).sendChat(m);
    setMsgs(s=>[...s,m]);
    setMsg("");
  };

  if(!user) return (
    <div style={{background:"black", color:"white", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}>
      <h1 style={{fontSize:40}}>JHUMMKATOK</h1>
      <p>15 Rooms Live - No Server - P2P</p>
      <button onClick={()=>setUser(true)} style={{marginTop:20, padding:"15px 30px", background:"white", color:"black", borderRadius:30, fontWeight:"bold", cursor:"pointer"}}>ENTER 15 ROOMS 🔴 LIVE</button>
    </div>
  );

  return (
    <div style={{background:"#000", color:"#fff", minHeight:"100vh", padding:20, fontFamily:"sans-serif"}}>
      <h2 style={{textAlign:"center"}}>🔴 LIVE: {currentRoom} - {peers+1} Online</h2>
      <div style={{display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", margin:"20px 0"}}>
        {Array.from({length:15}, (_,i)=>{
          const r = `jhumm-room-${i+1}`;
          const active = currentRoom===r;
          return <button key={r} onClick={()=>{setCurrentRoom(r); setMsgs([]); setPeers(0);}} style={{padding:"8px 14px", borderRadius:20, border:"1px solid #333", background: active ? "#fff" : "#111", color: active ? "#000" : "#fff", cursor:"pointer"}}>Room {i+1}</button>
        })}
      </div>
      <div style={{background:"#111", height:300, overflowY:"auto", padding:10, borderRadius:10, marginBottom:10}}>
        {msgs.map(m=><div key={m.id} style={{margin:"5px 0"}}><span style={{color:"#888", fontSize:12}}>{m.time}</span> {m.text}</div>)}
        {msgs.length===0 && <div style={{color:"#555", textAlign:"center", marginTop:100}}>No messages yet - Be first!</div>}
      </div>
      <div style={{display:"flex", gap:10}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Message in ${currentRoom}...`} style={{flex:1, padding:12, borderRadius:25, border:"1px solid #333", background:"#111", color:"#fff"}} />
        <button onClick={send} style={{padding:"12px 25px", borderRadius:25, background:"#fff", color:"#000", fontWeight:"bold", cursor:"pointer"}}>Send</button>
      </div>
    </div>
  );
} 
