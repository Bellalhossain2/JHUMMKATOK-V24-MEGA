"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [user, setUser] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState<{id:string,text:string,time:string}[]>([]);
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
    const m = {id:Date.now().toString(), text:msg, time:new Date().toLocaleTimeString()};
    (window as any).sendChat(m);
    setMsgs(s=>[...s,m]);
    setMsg("");
  };

  if(!user) return <button onClick={()=>setUser(true)} className="p-10 m-10 bg-black text-white">Enter Jhummkatok - 15 Rooms Live</button>;

  return (
    <div className="p-4">
      <h1>15 ROOMS LIVE - {peers+1} online in {currentRoom}</h1>
      <div className="grid grid-cols-5 gap-2 my-4">
        {Array.from({length:15}, (_,i)=>{
          const r = `jhumm-room-${i+1}`;
          return <button key={r} onClick={()=>{setCurrentRoom(r); setMsgs([]);}} className={`p-2 border ${currentRoom===r?'bg-black text-white':''}`}>Room {i+1}</button>
        })}
      </div>
      <div>{msgs.map(m=><div key={m.id}><b>{m.time}</b> {m.text}</div>)}</div>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type message" className="border p-2" />
      <button onClick={send} className="bg-black text-white p-2 ml-2">Send</button>
    </div>
  );
} 
