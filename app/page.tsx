"use client";
import { useState } from "react";

const rooms = Array.from({length:15}, (_,i)=> ({
  id: i+1,
  name: `LIVE Room ${i+1}`,
  host: `Host ${i+1}`,
  viewers: Math.floor(Math.random()*500)+10,
  isLive: i<5
}));

export default function MainApp(){
  return (
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:"20px"}}>
      <h1 style={{color:"#ff0050",textAlign:"center"}}>JHUMMKATOK V24 MEGA - LIVE 🔴</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"15px",marginTop:"20px"}}>
        {rooms.map(r=>(
          <div key={r.id} style={{background:"#111",borderRadius:"15px",padding:"15px",border: r.isLive ? "2px solid #ff0050":"1px solid #333"}}>
            <div style={{background: r.isLive ? "#ff0050":"#333",width:"60px",height:"60px",borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px"}}>🔴</div>
            <h3 style={{textAlign:"center",margin:"10px 0 5px"}}>{r.name}</h3>
            <p style={{textAlign:"center",fontSize:"12px",opacity:0.7}}>{r.host} • {r.viewers} viewers</p>
            <button style={{width:"100%",marginTop:"10px",background: r.isLive ? "#ff0050":"#222",color:"#fff",border:"none",padding:"8px",borderRadius:"20px"}}>
              {r.isLive ? "JOIN LIVE" : "OFFLINE"}
            </button>
          </div>
        ))}
      </div>
      <p style={{textAlign:"center",marginTop:"20px",opacity:0.5}}>TikTok Style | PeerJS + Firebase | jhummkatok.com</p>
    </div>
  )
} 
