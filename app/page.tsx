"use client";
import { useState, useRef } from "react";

export default function Page() {
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([{id:1, name:"Host 1", isYou:false}]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const joinRoom = async (roomNum: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
      if(videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setJoined(true);
      const newUser = {id: users.length+1, name: `User ${users.length+1} (from Room ${roomNum})`, isYou: true};
      setUsers([...users, newUser]);
    } catch(e) {
      // if no camera, still join
      setJoined(true);
      setUsers([...users, {id: users.length+1, name: `Guest ${users.length+1}`, isYou: true}]);
    }
  };

  return (
    <div style={{background:"#000", minHeight:"100vh", color:"#fff", padding:"15px"}}>
      <h1 style={{color:"#ff0050", textAlign:"center", fontSize:"28px", fontWeight:"bold"}}>JHUMMKATOK V24 MEGA LIVE</h1>
     
      {/* ROOM 1 - MAIN MEGA ROOM */}
      <div style={{background:"#111", border:"3px solid #ff0050", borderRadius:"15px", padding:"15px", marginTop:"15px"}}>
        <h2 style={{color:"#ff0050", textAlign:"center"}}>🔴 LIVE Room 1 - MAIN STAGE - {users.length} LIVE</h2>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"15px"}}>
          {users.map(u=>(
            <div key={u.id} style={{background:"#222", borderRadius:"10px", padding:"10px", textAlign:"center", border: u.isYou ? "2px solid #ff0050" : "1px solid #333"}}>
              <div style={{background:"#ff0050", width:"60px", height:"60px", borderRadius:"50%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px"}}>{u.isYou ? "YOU" : "LIVE"}</div>
              <p style={{fontSize:"12px", marginTop:"5px"}}>{u.name}</p>
              {u.isYou && <video ref={videoRef} autoPlay muted playsInline style={{width:"100%", borderRadius:"8px", marginTop:"5px", background:"#000"}}></video>}
            </div>
          ))}
        </div>
        {joined && <p style={{textAlign:"center", color:"#0f0", marginTop:"10px"}}>✅ You are LIVE in Room 1!</p>}
      </div>

      {/* ROOMS 2-15 - JOIN BUTTONS TO ROOM 1 */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px", marginTop:"20px"}}>
        {Array.from({length:14}, (_,i)=>i+2).map(num=>(
          <div key={num} style={{background:"#111", borderRadius:"15px", padding:"15px", border:"1px solid #333", textAlign:"center"}}>
            <div style={{background:"#333", width:"60px", height:"60px", borderRadius:"50%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center"}}>LIVE</div>
            <h3 style={{marginTop:"10px"}}>LIVE Room {num}</h3>
            <p style={{fontSize:"12px", opacity:.7}}>Click to join MAIN Room 1</p>
            <button onClick={()=>joinRoom(num)} style={{width:"100%", marginTop:"10px", background:"#ff0050", color:"#fff", border:"none", padding:"10px", borderRadius:"20px", fontWeight:"bold", cursor:"pointer"}}>
              JOIN LIVE → Room 1
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 
