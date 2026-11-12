"use client";
import { useState, useEffect, useRef } from "react";
export default function Page(){
const [user,setUser]=useState(null as any);
const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [country,setCountry]=useState("Bangladesh");
const [phone,setPhone]=useState("");
const [avatar,setAvatar]=useState("");
const [otp,setOtp]=useState("");
const [genOtp,setGenOtp]=useState("");
const [step,setStep]=useState(0);
const [myId,setMyId]=useState("");
const [room,setRoom]=useState("jhumm-room-1");
const [isLive,setIsLive]=useState(false);
const [hosts,setHosts]=useState([] as any);
const [watch,setWatch]=useState(null as any);
const [chats,setChats]=useState([] as any);
const [chatIn,setChatIn]=useState("");
const [gifts,setGifts]=useState([] as any);
const [status,setStatus]=useState("Connecting...");
const localRef=useRef(null as any);
const remoteRef=useRef(null as any);
const streamRef=useRef(null as any);
const peerRef=useRef(null as any);
const callRef=useRef(null as any);
useEffect(()=>{
let s=localStorage.getItem("jhumm_v32");
if(s){let u=JSON.parse(s);setUser(u);setMyId(u.id);setAvatar(u.avatar);}
},[]);
useEffect(()=>{
if(!user||!myId)return;
setStatus("✅ Own Server Connected!");
let iv=setInterval(async function(){
try{
let payload={id:myId,name:user.name,email:user.email,country:user.country,avatar:user.avatar,room:room,isLive:isLive,time:Date.now()};
let res=await fetch("/api/presence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
let all=await res.json();
let filtered=all.filter(function(h:any){return h.id!==myId && h.isLive;});
setHosts(filtered);
setStatus("✅ LIVE: "+filtered.length+" online | Shared DB | "+user.country);
}catch(e){setStatus("Connecting...");}
},2000);
import("peerjs").then(function(m){
let Peer=(m as any).default || (m as any).Peer || m;
let peer=new Peer(myId,{
config:{iceServers:[
{urls:"stun:stun.l.google.com:19302"},
{urls:"stun:global.stun.twilio.com:3478"},
{urls:"turn:openrelay.metered.ca:80",username:"openrelay.metered.ca",credential:"openrelay.metered.ca"},
{urls:"turn:openrelay.metered.ca:443",username:"openrelay.metered.ca",credential:"openrelay.metered.ca"},
{urls:"turn:openrelay.metered.ca:443?transport=tcp",username:"openrelay.metered.ca",credential:"openrelay.metered.ca"}
]}
});
peerRef.current=peer;
peer.on("open",function(){setStatus("✅ Video Server Ready!");});
peer.on("call",function(call:any){
call.answer(streamRef.current);
call.on("stream",function(rStream:any){
if(remoteRef.current){remoteRef.current.srcObject=rStream; remoteRef.current.play().catch(()=>{}); setWatch({name:call.peer,id:call.peer});}
});
callRef.current=call;
});
});
return function(){clearInterval(iv); if(peerRef.current) peerRef.current.destroy();};
},[user,myId,isLive,room]);
function upAvatar(e:any){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=function(){setAvatar(r.result as string);};r.readAsDataURL(f);}
function startOtp(){if(!name||!email||!phone||!avatar){alert("Need Name Email Phone Photo");return;}let o=Math.floor(100000+Math.random()*900000).toString();setGenOtp(o);setStep(1);}
function doVerify(){let a=otp.toString().trim().replace(/\s/g,""); let b=genOtp.toString().trim(); if(a!==b){alert("OTP is "+b+" you typed "+a);return;} let id=name.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,6)+Math.random().toString(36).slice(2,5); let u={id:id,name:name,email:email,country:country,phone:phone,avatar:avatar}; localStorage.setItem("jhumm_v32",JSON.stringify(u)); setUser(u); setMyId(id);}
async function goLive(){
let s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});
streamRef.current=s;
if(localRef.current){localRef.current.srcObject=s; localRef.current.play().catch(()=>{});}
setIsLive(true);
}
async function joinP(h:any){
if(h.id===myId)return;
setWatch(h);
try{
if(!peerRef.current){alert("Video server loading, wait 3 sec");return;}
let streamToSend=streamRef.current;
if(!streamToSend){
try{streamToSend=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); streamRef.current=streamToSend; if(localRef.current) localRef.current.srcObject=streamToSend;}catch(e){streamToSend=new MediaStream();}
}
let call=peerRef.current.call(h.id, streamToSend);
if(!call){alert("Host "+h.name+" offline, try again in 3 sec"); return;}
callRef.current=call;
call.on("stream",function(rStream:any){
if(remoteRef.current){remoteRef.current.srcObject=rStream; setTimeout(()=>{if(remoteRef.current)remoteRef.current.play().catch(()=>{});},300);}
});
call.on("close",function(){setWatch(null);});
call.on("error",function(){setWatch(null);});
}catch(e:any){alert("Join failed: "+e.message); setWatch(null);}
}
function leaveWatch(){if(callRef.current)callRef.current.close(); if(remoteRef.current)remoteRef.current.srcObject=null; setWatch(null);}
function sendChat(){if(!chatIn.trim())return; let d={id:Date.now(),name:user.name,text:chatIn}; setChats(function(p:any){return [...p.slice(-30),d];}); setChatIn("");}
function sendGift(e:any){let id=Date.now()+Math.random(); setGifts(function(p:any){return [...p,{id:id,emoji:e}];}); setChats(function(p:any){return [...p.slice(-30),{id:id,name:"GIFT",text:user.name+" sent "+e}];}); setTimeout(function(){setGifts(function(p:any){return p.filter(function(x:any){return x.id!==id;});});},3500);}
let otherHosts=hosts.filter(function(h:any){return h.id!==myId;});
return(
<div className="bg-black text-white min-h-screen pb-24">
<style>{`@keyframes fly{0%{transform:translateY(100vh) scale(0.5);opacity:1}100%{transform:translateY(-20vh) scale(1.8);opacity:0}} .gift-fly{animation:fly 3.5s ease-out forwards;}`}</style>
{!user && (
<div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 via-black to-pink-950">
<div className="bg-zinc-900 p-6 rounded-[28px] w-full max-w-sm border border-zinc-800">
<div className="text-center"><h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">JHUMMKATOK</h2><p className="text-pink-500 font-bold">V36 FIXED</p><p className="text-xs text-green-400">Shared DB + iPhone OTP fix</p></div>
{step===0 ? (
<div>
<div className="flex justify-center mt-5"><label className="w-28 h-28 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-[3px] border-pink-600 cursor-pointer">{avatar ? <img src={avatar} className="w-full h-full object-cover" alt="av"/> : <span className="text-sm text-zinc-500">+ PHOTO</span>}<input type="file" accept="image/*" onChange={upAvatar} className="hidden"/></label></div>
<input value={name} onChange={function(e:any){setName(e.target.value);}} placeholder="Full Name" className="w-full p-4 mt-5 bg-zinc-800 rounded-2xl outline-none border border-zinc-700 focus:border-pink-600"/>
<input value={email} onChange={function(e:any){setEmail(e.target.value);}} placeholder="Email" className="w-full p-4 mt-3 bg-zinc-800 rounded-2xl outline-none border border-zinc-700 focus:border-pink-600"/>
<select value={country} onChange={function(e:any){setCountry(e.target.value);}} className="w-full p-4 mt-3 bg-zinc-800 rounded-2xl outline-none border border-zinc-700 focus:border-pink-600"><option>Bangladesh</option><option>USA</option><option>UK</option><option>India</option><option>Canada</option><option>Saudi Arabia</option><option>UAE</option><option>Malaysia</option><option>Other</option></select>
<input value={phone} onChange={function(e:any){setPhone(e.target.value);}} placeholder="Phone" className="w-full p-4 mt-3 bg-zinc-800 rounded-2xl outline-none border border-zinc-700 focus:border-pink-600"/>
<button onClick={startOtp} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-2xl mt-4 font-bold">SEND OTP →</button>
</div>
) : (
<div>
<div className="bg-green-500/20 border border-green-500/30 p-3 rounded-2xl mt-4 text-center"><p className="text-2xl font-mono font-bold">{genOtp}</p><p className="text-xs text-green-400">OTP to {email}</p></div>
<input value={otp} onChange={function(e:any){let v=e.target.value; setOtp(v);}} placeholder="Enter OTP" className="w-full p-4 mt-4 bg-zinc-800 border-2 border-green-500 rounded-2xl text-center text-xl tracking-widest outline-none" inputMode="numeric"/>
<button onClick={doVerify} className="w-full bg-green-500 text-black p-4 rounded-2xl mt-4 font-black">VERIFY & LOGIN 🚀</button>
<button onClick={function(){setStep(0);}} className="w-full text-zinc-500 mt-3 text-sm">← Back</button>
</div>
)}
</div>
</div>
)}
{user && (
<div className="max-w-md mx-auto">
<div className="sticky top-0 z-10 bg-black/90 backdrop-blur p-2 flex gap-1.5 overflow-x-auto border-b border-zinc-900">
{Array.from({length:12},function(_,i){let r="jhumm-room-"+(i+1);let isA=room===r;return(<button key={r} onClick={function(){setRoom(r);}} className={isA ? "bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap" : "bg-zinc-800 px-4 py-1.5 rounded-full text-xs whitespace-nowrap text-zinc-400"}>{r==="jhumm-room-1" ? "🔥 1 AUTO" : i+1}</button>);})}
</div>
<div className="p-2 flex gap-2 items-center">
{!isLive ? <button onClick={goLive} className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2.5 rounded-full text-sm font-bold">🔴 GO LIVE</button> : <button onClick={function(){if(streamRef.current)streamRef.current.getTracks().forEach(function(t:any){t.stop();}); setIsLive(false);}} className="bg-zinc-800 border border-zinc-700 px-5 py-2.5 rounded-full text-sm">⬛ STOP</button>}
<div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-xs text-green-400 font-bold">{otherHosts.length} LIVE</span></div>
<div className="ml-auto flex items-center gap-2"><img src={user.avatar} className="w-7 h-7 rounded-full border border-pink-600" alt="me"/><button onClick={function(){localStorage.clear();location.reload();}} className="bg-zinc-900 px-3 py-1.5 rounded-full text-xs border border-zinc-800">{user.name}</button></div>
</div>
<div className="px-2 py-1"><p className="text-[11px] text-green-400 font-mono bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 inline-block">{status}</p></div>
<div className="p-2 space-y-2">
<div className="relative rounded-[20px] overflow-hidden bg-zinc-900 border border-zinc-800">
<video ref={localRef} autoPlay muted playsInline className="w-full h-48 object-cover bg-zinc-900"></video>
{isLive && <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">● LIVE - {user.country}</div>}
</div>
<div className="relative rounded-[20px] overflow-hidden bg-zinc-900 border border-zinc-800 min-h-[340px]">
<video ref={remoteRef} autoPlay playsInline className="w-full h-[340px] object-cover bg-black"></video>
{!watch && <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black p-4"><p className="text-4xl mb-3">{otherHosts.length>0 ? "🔥" : "👋"}</p><p className="text-white font-bold text-center">{otherHosts.length>0 ? otherHosts.length+" LIVE - TAP BELOW!" : "No one live"}</p></div>}
{watch && <div className="absolute top-3 left-3 right-3 flex justify-between"><div className="bg-black/70 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-zinc-700"><img src={watch.avatar} className="w-6 h-6 rounded-full" alt="host"/><span className="text-xs font-bold">{watch.name} • {watch.country || "Live"}</span><span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">LIVE</span></div><button onClick={leaveWatch} className="bg-black/70 backdrop-blur px-3 py-1.5 rounded-full text-xs border border-zinc-700">✕ Leave</button></div>}
</div>
</div>
<div className="px-2 mt-4">
<p className="text-xs text-zinc-400 mb-2 font-black">🔥 LIVE NOW ({otherHosts.length}) - TAP ANY TO SEE VIDEO</p>
{otherHosts.length===0 ? <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center"><p className="text-zinc-400 text-sm">Waiting...</p></div> : (
<div className="grid grid-cols-3 gap-2">
{otherHosts.map(function(h:any){return(<div key={h.id} onClick={function(){joinP(h);}} className="bg-zinc-900 border-2 border-pink-600 rounded-2xl p-3 text-center cursor-pointer"><div className="relative"><img src={h.avatar} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-pink-600" alt="av"/><div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-zinc-900 animate-pulse"></div></div><div className="text-xs mt-2 font-bold truncate">{h.name}</div><div className="text-[9px] text-zinc-400 truncate">{h.country}</div><div className="text-[10px] bg-gradient-to-r from-pink-600 to-purple-600 rounded-full mt-2 px-3 py-1.5 font-black">SEE VIDEO 🔥</div></div>);})}
</div>
)}
</div>
<div className="px-2 mt-4">
<div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl h-28 overflow-y-auto p-3 space-y-1">
{chats.length===0 && <p className="text-zinc-600 text-xs text-center mt-8">💬 Chat</p>}
{chats.map(function(c:any){return(<div key={c.id} className="text-xs"><b className={c.name==="GIFT" ? "text-yellow-400" : "text-pink-400"}>{c.name}: </b><span className="text-zinc-200">{c.text}</span></div>);})}
</div>
<div className="flex gap-2 mt-2"><input value={chatIn} onChange={function(e:any){setChatIn(e.target.value);}} onKeyDown={function(e:any){if(e.key==="Enter")sendChat();}} placeholder="Chat..." className="flex-1 p-3.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm outline-none focus:border-pink-600"/><button onClick={sendChat} className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 rounded-full text-sm font-bold">Send</button></div>
<div className="mt-3 bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl flex gap-2 overflow-x-auto">
{["❤️","🌹","💎","🔥","🎉","👑","💋","🚀"].map(function(em:any){return(<button key={em} onClick={function(){sendGift(em);}} className="bg-zinc-800 px-4 py-2.5 rounded-full text-lg border border-zinc-700">{em}</button>);})}
</div>
</div>
<div className="fixed bottom-24 left-0 right-0 pointer-events-none h-[50vh] overflow-hidden flex justify-center gap-3">
{gifts.map(function(g:any){let left=Math.random()*60+20;return(<div key={g.id} className="gift-fly absolute text-4xl" style={{left:left+"%", bottom:"0"}}>{g.emoji}</div>);})}
</div>
</div>
)}
</div>
);
} 