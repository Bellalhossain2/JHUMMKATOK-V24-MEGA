"use client";
import { useState, useRef } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { joinRoom, selfId } from "trystero/torrent";

const GOOGLE_CLIENT_ID = "824624379526-0ss4euebvtp5bndbb8r1ut7cqcg30p4j.apps.googleusercontent.com";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const joinMain = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    const room = joinRoom({appId:"jhummkatok_v24_mega_final"}, "MAIN_ROOM_1");
    const [sendStream, getStream] = room.makeAction("stream");
    setJoined(true);
    setUsers([{id:selfId, name:user.name, photo:user.picture, stream, isYou:true}]);
    room.onPeerJoin(id => sendStream(stream, id));
    getStream((s:any, id:string)=>{
      setUsers(prev => prev.find(u=>u.id===id) ? prev : [...prev, {id, name:`User`, stream:s, isYou:false}]);
    });
    sendStream(stream);
  };

  if(!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{background:"#000", minHeight:"100vh", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"}}>
        <div style={{background:"#111", borderRadius:"20px", padding:"30px", textAlign:"center", border:"2px solid #ff0050", maxWidth:"400px", width:"100%"}}>
          <h1 style={{color:"#ff0050", margin:"0 0 10px 0"}}>JHUMMKATOK V24</h1>
          <p style={{opacity:.7, margin:"0 0 20px 0"}}>15 MEGA LIVE Rooms - Google Login Required</p>
          <div style={{background:"#fff", borderRadius:"10px", padding:"10px", display:"flex", justifyContent:"center"}}>
            <GoogleLogin onSuccess={cred=>{
              const payload = JSON.parse(atob(cred.credential!.split('.')[1]));
              setUser(payload);
            }} theme="filled_black" size="large" width="300" />
          </div>
          <p style={{fontSize:"11px", opacity:.5, marginTop:"15px"}}>Login with Google to join MAIN STAGE Room 1<br/>3 LIVE working now!</p>
        </div>
      </div>
      </GoogleOAuthProvider>
    )
  }

  return (
    <div style={{background:"#000", minHeight:"100vh", color:"#fff", padding:"10px"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#111", padding:"10px", borderRadius:"12px"}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <img src={user.picture} style={{width:"35px", height:"35px", borderRadius:"50%"}}/>
          <span>Hi, {user.name}</span>
        </div>
        <span style={{background:"#ff0050", padding:"5px 10px", borderRadius:"15px", fontSize:"12px"}}>LIVE</span>
      </div>

      <div style={{background:"#111", border:"3px solid #ff0050", borderRadius:"15px", padding:"10px", marginTop:"10px"}}>
        <h2 style={{textAlign:"center", color:"#ff0050", margin:"0 0 10px 0"}}>🔴 ROOM 1 MAIN - {users.length || 1} LIVE</h2>
        {!joined ? (
          <div style={{textAlign:"center", padding:"20px", background:"#222", borderRadius:"12px"}}>
            <button onClick={joinMain} style={{background:"#ff0050", color:"#fff", border:"none", padding:"14px 28px", borderRadius:"25px", fontWeight:"bold", fontSize:"16px", cursor:"pointer"}}>🚀 JOIN NOW - GO LIVE</button>
            <p style={{fontSize:"12px", opacity:.6, marginTop:"10px"}}>Everyone joins same room - See each other!</p>
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
            {users.map(u=>(
              <div key={u.id} style={{background:"#000", borderRadius:"10px", overflow:"hidden", border: u.isYou ? "2px solid #ff0050":"1px solid #333"}}>
                <video autoPlay playsInline muted={u.isYou} ref={el=>{if(el && u.stream) (el as any).srcObject=u.stream}} style={{width:"100%", height:"180px", objectFit:"cover"}}/>
                <div style={{padding:"5px", fontSize:"11px", textAlign:"center", background: u.isYou ? "#ff0050" : "#222"}}>{u.isYou ? "YOU - " + u.name : u.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
