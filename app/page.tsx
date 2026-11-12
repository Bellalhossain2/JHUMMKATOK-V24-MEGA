"use client";
import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, deleteDoc, query, orderBy, onSnapshot, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB66YshhdHYNlC7zzRRUqw6qz0_Y-Q1VAQ",
  authDomain: "jhummka-c2bbe.firebaseapp.com",
  databaseURL: "https://jhummka-c2bbe-default-rtdb.firebaseio.com",
  projectId: "jhummka-c2bbe",
  storageBucket: "jhummka-c2bbe.firebasestorage.app",
  messagingSenderId: "337271453923",
  appId: "1:337271453923:web:2b4be740a21cee7b98add6",
  measurementId: "G-29JQLMP02D"
};

let app:any; let auth:any; let db:any; let storage:any;
if(!getApps().length){ app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app); storage=getStorage(app); }
else { app=getApps()[0]; auth=getAuth(app); db=getFirestore(app); storage=getStorage(app); }

const ROOMS = Array.from({length:15},(_,i)=>`Room ${i+1}`);

export default function Page(){
const [user,setUser]=useState(null as any);
const [myId,setMyId]=useState("");
const [room,setRoom]=useState("Room 1");
const [isLive,setIsLive]=useState(false);
const [liveMap,setLiveMap]=useState({} as any);
const [videos,setVideos]=useState([] as any);
const [watch,setWatch]=useState(null as any);
const [uploadFile,setUploadFile]=useState(null as any);
const [status,setStatus]=useState("Loading...");
const localRef=useRef(null as any);
const remoteRef=useRef(null as any);
const streamRef=useRef(null as any);
const peerRef=useRef(null as any);
const recorderRef=useRef(null as any);
const chunksRef=useRef([] as any);

useEffect(()=>{
const unsub=onAuthStateChanged(auth, async (u:any)=>{
if(u){
let userData={id:u.uid,name:u.displayName,email:u.email,avatar:u.photoURL};
setUser(userData); setMyId(u.uid); setStatus("✅ "+u.displayName);
await setDoc(doc(db,"users",u.uid),userData,{merge:true});
}else{ setUser(null); }
});
return ()=>unsub();
},[]);

useEffect(()=>{
if(!db)return;
// Listen to 15 rooms live
let unsubs:any=[];
ROOMS.forEach((r:any)=>{
let unsub=onSnapshot(doc(db,"live",r),(snap:any)=>{
if(snap.exists()){ let data=snap.data(); if(Date.now()-data.time<30000) setLiveMap((prev:any)=>({...prev,[r]:data})); else setLiveMap((prev:any)=>{let n={...prev}; delete n[r]; return n;}); }
else{ setLiveMap((prev:any)=>{let n={...prev}; delete n[r]; return n;}); }
});
unsubs.push(unsub);
});
let unsubVideos=onSnapshot(query(collection(db,"videos"),orderBy("time","desc")),(snap:any)=>{
let list:any=[]; snap.forEach((d:any)=>list.push({fid:d.id,...d.data()})); setVideos(list.filter((v:any)=>v.room===room || !v.room));
});
return ()=>{unsubs.forEach((u:any)=>u()); unsubVideos();};
},[room]);

useEffect(()=>{
if(!user||!myId)return;
import("peerjs").then((m:any)=>{
let Peer=m.default||m.Peer||m;
let peer=new Peer(myId,{config:{iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"turn:openrelay.metered.ca:80",username:"openrelay.metered.ca",credential:"openrelay.metered.ca"}]}});
peerRef.current=peer;
peer.on("call",(call:any)=>{call.answer(streamRef.current); call.on("stream",(rs:any)=>{ if(remoteRef.current){ remoteRef.current.srcObject=rs; remoteRef.current.play().catch(()=>{}); }});});
});
},[user,myId]);

async function loginGoogle(){ await signInWithPopup(auth,new GoogleAuthProvider()); }
async function logout(){ await signOut(auth); }

async function goLive(){
let currentLive=liveMap[room];
if(currentLive && currentLive.id!==myId){ alert(`Room ${room} - Single Live Only! ${currentLive.name} is LIVE! Choose other room from 15 rooms!`); return; }
let s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});
streamRef.current=s; if(localRef.current){ localRef.current.srcObject=s; localRef.current.play().catch(()=>{}); }
chunksRef.current=[];
let recorder=new MediaRecorder(s,{mimeType:"video/webm"});
recorderRef.current=recorder;
recorder.ondataavailable=(e:any)=>{ if(e.data.size>0) chunksRef.current.push(e.data); };
recorder.onstop=async ()=>{
let blob=new Blob(chunksRef.current,{type:"video/webm"});
let fName=`live-records/${room}_${myId}_${Date.now()}.webm`;
let sRef=ref(storage,fName);
await uploadBytes(sRef,blob);
let url=await getDownloadURL(sRef);
await addDoc(collection(db,"videos"),{type:"live_record",room:room,url:url,name:user.name,avatar:user.avatar,uid:myId,time:Date.now(),likes:0});
setStatus("✅ Recording Saved to "+room);
};
recorder.start();
setIsLive(true);
let payload={id:myId,name:user.name,avatar:user.avatar,room:room,time:Date.now(),isLive:true};
await setDoc(doc(db,"live",room),payload);
try{ await fetch("/api/presence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); }catch(e){}
setStatus(`🔴 LIVE in ${room} + Recording...`);
}

async function stopLive(){
if(streamRef.current) streamRef.current.getTracks().forEach((t:any)=>t.stop());
if(recorderRef.current) recorderRef.current.stop();
setIsLive(false);
await deleteDoc(doc(db,"live",room));
try{ await fetch("/api/presence",{method:"POST",body:JSON.stringify({id:myId,room:room,isLive:false,time:Date.now()})}); }catch(e){}
setStatus("Stopped");
}

async function joinP(h:any){
setWatch(h);
let streamToSend=streamRef.current;
if(!streamToSend){ streamToSend=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); streamRef.current=streamToSend; }
let call=peerRef.current.call(h.id,streamToSend);
call.on("stream",(rs:any)=>{ if(remoteRef.current){ remoteRef.current.srcObject=rs; remoteRef.current.play().catch(()=>{}); }});
}

async function doUpload(){
if(!uploadFile||!user){ alert("Select video"); return; }
setStatus("Uploading to "+room+"...");
let fName=`uploads/${room}_${myId}_${Date.now()}_${uploadFile.name}`;
let sRef=ref(storage,fName);
await uploadBytes(sRef,uploadFile);
let url=await getDownloadURL(sRef);
await addDoc(collection(db,"videos"),{type:"upload",room:room,url:url,name:user.name,avatar:user.avatar,uid:myId,time:Date.now(),likes:0});
setStatus("✅ Uploaded to "+room); setUploadFile(null);
}

let currentLive=liveMap[room];
let allLives=Object.values(liveMap) as any[];

return(
<div className="bg-black text-white min-h-screen pb-24">
{!user && (
<div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
<div className="bg-zinc-900 p-8 rounded-[28px] border border-zinc-800 w-full max-w-sm text-center">
<h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">JHUMMKATOK V42</h2>
<p className="text-xs text-zinc-400">15 Rooms • Single Live per Room</p>
<button onClick={loginGoogle} className="w-full bg-white text-black p-4 rounded-full mt-6 font-bold">Continue with Google</button>
</div>
</div>
)}
{user && (
<div className="max-w-md mx-auto">
<div className="p-3 flex items-center gap-2 border-b border-zinc-900">
<img src={user.avatar} className="w-8 h-8 rounded-full"/>
<span className="text-xs font-bold truncate">{user.name}</span>
<div className="ml-auto flex gap-2">
{!isLive ? <button onClick={goLive} className="bg-pink-600 px-3 py-2 rounded-full text-[11px] font-bold">🔴 GO LIVE in {room}</button> : <button onClick={stopLive} className="bg-zinc-800 px-3 py-2 rounded-full text-[11px]">⬛ STOP & SAVE</button>}
<button onClick={logout} className="bg-zinc-900 px-2 py-2 rounded-full text-[10px]">Logout</button>
</div>
</div>

<div className="p-2">
<p className="text-[11px] text-zinc-400 mb-1 font-bold">📍 CHOOSE ROOM (15 Rooms) - Single Live per Room:</p>
<div className="grid grid-cols-5 gap-1.5">
{ROOMS.map((r:any)=>{
let isCurrent=r===room;
let hasLive=liveMap[r];
return(
<button key={r} onClick={()=>setRoom(r)} className={`p-2 rounded-xl text-[10px] font-bold border ${isCurrent?'bg-pink-600 border-pink-500 text-white':'bg-zinc-900 border-zinc-800 text-zinc-300'} ${hasLive?'!border-green-500 !bg-green-900/30':''}`}>
<div>{r}</div>
{hasLive && <div className="text-[8px] text-green-400 mt-0.5">● LIVE</div>}
{!hasLive && <div className="text-[8px] text-zinc-500">Empty</div>}
</button>
);
})}
</div>
<p className="text-[10px] text-green-400 mt-2 font-mono">{status} | {allLives.length} LIVE in 15 rooms</p>
</div>

<div className="p-2 grid grid-cols-2 gap-2">
<div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"><video ref={localRef} autoPlay muted playsInline className="w-full h-36 object-cover"/><p className="text-[9px] text-center p-1">{isLive?`🔴 ${room} REC`:room}</p></div>
<div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"><video ref={remoteRef} autoPlay playsInline className="w-full h-36 object-cover bg-black"/><p className="text-[9px] text-center p-1">{watch?watch.name:room}</p></div>
</div>

{currentLive && currentLive.id!==myId && (
<div className="p-2"><div onClick={()=>joinP(currentLive)} className="bg-pink-900/40 border-2 border-pink-600 rounded-2xl p-3 flex gap-3 cursor-pointer"><img src={currentLive.avatar} className="w-10 h-10 rounded-full"/><div><div className="text-sm font-bold">{currentLive.name} LIVE in {room}</div><div className="text-xs text-pink-400">Single Live - TAP TO SEE 🔥</div></div></div></div>
)}

{!currentLive && <div className="mx-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center"><p className="text-xs text-zinc-400">No one LIVE in {room} - You can GO LIVE! (Single Live per Room)</p></div>}

<div className="p-2 mt-2">
<p className="text-[11px] text-zinc-400 mb-2 font-bold">🔥 All 15 Rooms LIVE ({allLives.length}):</p>
<div className="grid grid-cols-3 gap-2">
{allLives.map((h:any)=>(
<div key={h.id+h.room} onClick={()=>{setRoom(h.room); joinP(h);}} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-center cursor-pointer">
<img src={h.avatar} className="w-10 h-10 rounded-full mx-auto"/>
<div className="text-[10px] font-bold mt-1 truncate">{h.name}</div>
<div className="text-[8px] text-green-400">{h.room} ● LIVE</div>
</div>
))}
</div>
</div>

<div className="p-3 bg-zinc-900 rounded-2xl m-2 border border-zinc-800">
<p className="text-xs font-bold mb-2">📤 Upload to {room}</p>
<input type="file" accept="video/*" onChange={(e:any)=>setUploadFile(e.target.files[0])} className="w-full text-[10px] mb-2"/>
<button onClick={doUpload} className="w-full bg-pink-600 p-2.5 rounded-full text-xs font-bold">Upload Video to {room}</button>
</div>

<div className="p-2">
<p className="text-xs font-bold mb-2">🎥 Videos in {room} ({videos.length})</p>
<div className="space-y-2">
{videos.map((v:any)=>(
<div key={v.fid} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
<video src={v.url} controls className="w-full h-40 bg-black"/>
<div className="p-2 flex justify-between"><span className="text-[10px]">{v.name} • {v.room}</span><span className="text-[9px] text-zinc-500">{new Date(v.time).toLocaleString()}</span></div>
</div>
))}
</div>
</div>

</div>
)}
</div>
);
} 