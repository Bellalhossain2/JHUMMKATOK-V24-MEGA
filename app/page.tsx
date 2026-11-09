"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [user, setUser] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState<{id:string,text:string,time:string}[]>([]);
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    if(!user) return;
    let room:any;
    import("trystero/torrent").then(({joinRoom})=>{
      room = joinRoom({appId:"jhummkatok-v24-mega-2024"},"jhumm-main");
      const [sendChat, getChat] = room.makeAction("chat");
      room.onPeerJoin(()=> setPeers(p=>p+1));
      room.onPeerLeave(()=> setPeers(p=>Math.max(0,p-1)));
      getChat((m:any)=> setMsgs(s=>[...s,m]));
      (window as any).sendChat = sendChat;
    });
    return ()=> room?.leave();
  }, [user]);

  const send = () => {
    if(!msg) return;
    const m = {id:Date.now().toString(), text:msg, time:new Date().toLocaleTimeString()};
    setMsgs(s=>[...s,m]);
    (window as any).sendChat?.(m);
    setMsg("");
  };

  if (!user) {
    return (
      <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",flexDirection:"column",background:"#000",color:"#fff",fontFamily:"sans-serif"}}>
        <h1 style={{fontSize:32, letterSpacing:2}}>JHUMMKATOK V24 MEGA</h1>
        <p>Decentralized P2P Chat - No Server</p>
        <button onClick={()=>setUser(true)} style={{padding:"15px 40px",marginTop:20,cursor:"pointer",background:"#fff",color:"#000",border:"none",borderRadius:8,fontWeight:"bold"}}>Enter Chat</button>
        <p style={{marginTop:20,opacity:0.5,fontSize:12}}>jhumkatok.com - LIVE</p>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#0a0a0a",color:"#fff",fontFamily:"sans-serif"}}>
      <div style={{padding:15,background:"#111",display:"flex",justifyContent:"space-between"}}>
        <b>JHUMMKATOK V24 MEGA - LIVE 🔴</b>
        <span>Peers: {peers+1}</span>
      </div>
      <div style={{flex:1,padding:20,overflowY:"auto"}}>
        {msgs.map(m=><div key={m.id} style={{background:"#222",padding:"10px 15px",marginBottom:10,borderRadius:12,maxWidth:"80%"}}><div style={{fontSize:12,opacity:0.6}}>{m.time}</div>{m.text}</div>)}
      </div>
      <div style={{padding:15,display:"flex",gap:10,background:"#111"}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type message..." style={{flex:1,padding:12,borderRadius:8,border:"none",background:"#222",color:"#fff"}} />
        <button onClick={send} style={{padding:"0 25px",background:"#fff",color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>Send</button>
      </div>
    </div>
  );
} 
