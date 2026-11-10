"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://cmuyicvjcdovetyqrhyg.supabase.co","sb_publishable_-IvEyygE-zQncMt10fyNOg_MLaIGaH3");
export default function Page(){
  const [user,setUser]=useState(false);
  const [msg,setMsg]=useState("");
  const [msgs,setMsgs]=useState<any[]>([]);
  const [room,setRoom]=useState("jhumm-room-1");
  const [counts,setCounts]=useState<Record<string,number>>({});
  const [liveUsers,setLiveUsers]=useState<any[]>([]);
  const myId=useState(()=>"user_"+Math.random().toString(36).slice(2,6))[0];
  useEffect(()=>{
    if(!user) return;
    supabase.from("messages").select("*").eq("room",room).order("created_at",{ascending:true}).limit(100).then(({data})=>data&&setMsgs(data));
    const ch=supabase.channel(`chat-${room}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`room=eq.${room}`},p=>setMsgs(s=>[...s,p.new])).subscribe();
    let lobby:any;
    import("trystero").then(({joinRoom,selfId})=>{
      lobby=joinRoom({appId:"jhummkatok-v24-mega-hybrid-v3"},"jhumm-lobby-v3");
      const [send,get]=lobby.makeAction("presence");
      const announce=()=>send({id:myId,room,time:Date.now(),selfId});
      announce();
      const it=setInterval(announce,3000);
      const map:Record<string,any>={};
      get((d:any)=>{
        map[d.id]={room:d.room,time:Date.now()};
        const c:Record<string,number>={};
        const u:any[]=[];
        Object.entries(map).forEach(([id,p]:any)=>{if(Date.now()-p.time<10000){c[p.room]=(c[p.room]||0)+1;u.push({id,room:p.room});}});
        setCounts(c);setLiveUsers(u);
      });
      (window as any).it=it;
    });
    return()=>{supabase.removeChannel(ch);lobby?.leave();clearInterval((window as any).it);};
  },[user,room,myId]);
  const send=async()=>{if(!msg.trim())return;await supabase.from("messages").insert({room,text:msg,user_id:myId,time:new Date().toLocaleTimeString()});setMsg("");};
  if(!user) return <div style={{background:"black",color:"white",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><h1 style={{fontSize:50,margin:0,fontWeight:900}}>JHUMMKATOK</h1><p style={{color:"#0f0",fontWeight:"bold"}}>HYBRID LIVE - Unlimited 🔴</p><button onClick={()=>setUser(true)} style={{marginTop:20,padding:"15px 40px",background:"white",color:"black",borderRadius:30,fontWeight:"bold",cursor:"pointer",fontSize:18,border:"none"}}>ENTER 🔴 15 ROOMS LIVE</button><p style={{marginTop:15,fontSize:12,opacity:0.5}}>ID: {myId}</p></div>;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:15,fontFamily:"sans-serif"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0}}>🔴 {room} - Unlimited</h2><div style={{fontSize:12,background:"#0f0",color:"#000",padding:"6px 12px",borderRadius:20,fontWeight:"bold"}}>{liveUsers.length} online</div></div><div style={{display:"flex",flexWrap:"wrap",gap:6,margin:"15px 0"}}>{Array.from({length:15},(_,i)=>{const r=`jhumm-room-${i+1}`;const active=room===r;const count=counts[r]||0;return <button key={r} onClick={()=>setRoom(r)} style={{padding:"8px 12px",borderRadius:20,border:"1px solid #333",background:active?"#fff":"#111",color:active?"#000":"#fff",cursor:"pointer",fontSize:13,fontWeight:active?"bold":"normal"}}>Room {i+1} {count>0&&<span style={{background:active?"#000":"#0f0",color:active?"#fff":"#000",borderRadius:10,padding:"2px 6px",fontSize:11,marginLeft:4}}>{count}</span>}</button>;})}</div><div style={{display:"flex",gap:15}}><div style={{flex:2,background:"#111",height:420,overflowY:"auto",padding:12,borderRadius:12,border:"1px solid #222"}}>{msgs.map((m:any)=><div key={m.id} style={{margin:"8px 0",background:m.user_id===myId?"#0f0":"#222",color:m.user_id===myId?"#000":"#fff",padding:"8px 12px",borderRadius:12,maxWidth:"85%"}}><span style={{fontSize:11,fontWeight:"bold",opacity:0.7}}>{m.user_id} • {m.time}</span><div>{m.text}</div></div>)}</div><div style={{flex:1,background:"#0a0a0a",borderRadius:12,padding:10,height:420,overflowY:"auto",border:"1px solid #222"}}><div style={{fontSize:12,fontWeight:"bold",marginBottom:10,color:"#0f0"}}>🔴 LIVE USERS</div>{liveUsers.map((u:any)=><div key={u.id} style={{fontSize:12,padding:"8px 0",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between"}}><span>👤 {u.id}</span><span style={{color:"#0f0",background:"#111",padding:"2px 6px",borderRadius:10}}>{u.room.replace("jhumm-room-","R")}</span></div>)}</div></div><div style={{display:"flex",gap:10,marginTop:12}}><input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Message in ${room}...`} style={{flex:1,padding:14,borderRadius:25,border:"1px solid #333",background:"#111",color:"#fff",outline:"none"}}/><button onClick={send} style={{padding:"12px 25px",borderRadius:25,background:"#0f0",color:"#000",fontWeight:"bold",cursor:"pointer",border:"none"}}>Send</button></div></div>;
}