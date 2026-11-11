"use client";
import { useState, useEffect, useRef } from "react";
export default function Page(){
const [user,setUser]=useState(null as any);
const [name,setName]=useState("");
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
const localRef=useRef(null as any);
const remoteRef=useRef(null as any);
const streamRef=useRef(null as any);
const hostRef=useRef(null as any);
const viewRef=useRef(null as any);
const chatSend=useRef(null as any);
const giftSend=useRef(null as any);
useEffect(()=>{
let s=localStorage.getItem("jhumm_v24");
if(s){let u=JSON.parse(s);setUser(u);setMyId(u.id);setAvatar(u.avatar);}
},[]);
useEffect(()=>{
if(!user||!myId)return;
import("trystero").then(function(m){
let jr=m.joinRoom;
let lobby=jr({appId:"jhumm-v24-final-v3"},"presence");
let a=lobby.makeAction("h");
let send=a[0];let get=a[1];
function ann(){send({id:myId,name:user.name,avatar:user.avatar,room:room,isLive:isLive,time:Date.now()});}
ann();
let iv=setInterval(ann,2000);
let mp={} as any;
get(function(d:any){mp[d.id]=d;mp[d.id].time=Date.now();let all=Object.values(mp).filter(function(h:any){return Date.now()-h.time<8000&&h.isLive;});setHosts(all as any);});
let cr=jr({appId:"jhumm-v24-final-v3"},room);
let ca=cr.makeAction("chat");
chatSend.current=ca[0];
ca[1](function(msg:any){setChats(function(p:any){return [...p.slice(-20),msg];});});
let ga=cr.makeAction("gift");
giftSend.current=ga[0];
ga[1](function(g:any){let id=Date.now();setGifts(function(p:any){return [...p,{id:id,emoji:g.emoji}];});setTimeout(function(){setGifts(function(p:any){return p.filter(function(x:any){return x.id!==id;});});},2500);});
return function(){clearInterval(iv);};
});
},[user,myId,isLive,room]);
function upAvatar(e:any){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=function(){setAvatar(r.result as string);};r.readAsDataURL(f);}
function startOtp(){if(!name||!phone||!avatar){alert("Need Name Phone Photo");return;}let o=Math.floor(100000+Math.random()*900000).toString();setGenOtp(o);setStep(1);}
function doVerify(){if(otp!==genOtp){alert("Wrong OTP is "+genOtp);return;}let id=name.slice(0,3)+Math.random().toString(36).slice(2,4);let u={id:id,name:name,phone:phone,avatar:avatar};localStorage.setItem("jhumm_v24",JSON.stringify(u));setUser(u);setMyId(id);}
async function goLive(){let s=await navigator.mediaDevices.getUserMedia({video:true,audio:true});streamRef.current=s;if(localRef.current)localRef.current.srcObject=s;setIsLive(true);let m=await import("trystero");let hr=m.joinRoom({appId:"jhumm-v24-final-v3"},"host-"+myId);hostRef.current=hr;hr.addStream(s);hr.onPeerJoin(function(){hr.addStream(streamRef.current);});}
async function joinP(h:any){if(h.id===myId)return;if(viewRef.current)viewRef.current.leave();setWatch(h);let m=await import("trystero");let vr=m.joinRoom({appId:"jhumm-v24-final-v3"},"host-"+h.id);viewRef.current=vr;vr.onPeerStream(function(st:any){if(remoteRef.current){remoteRef.current.srcObject=st;remoteRef.current.play();}});}
function sendChat(){if(!chatIn.trim())return;if(chatSend.current)chatSend.current({id:Date.now(),name:user.name,text:chatIn});setChatIn("");}
function sendGift(e:any){if(giftSend.current)giftSend.current({emoji:e});if(chatSend.current)chatSend.current({id:Date.now(),name:"System",text:user.name+" sent "+e});}
return(
<div className="bg-black text-white min-h-screen p-2">
{!user && (
<div className="flex items-center justify-center min-h-screen">
<div className="bg-zinc-900 p-5 rounded-2xl w-full max-w-xs">
<h2 className="text-center text-pink-600 font-bold">JHUMMKATOK V24</h2>
<p className="text-center text-xs text-zinc-500 mt-1">Photo + OTP + Chat + Gifts</p>
{step===0 ? (
<div>
<div className="flex justify-center mt-3"><label className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-pink-600 cursor-pointer">{avatar ? <img src={avatar} className="w-full h-full object-cover" alt="av"/> : <span>PHOTO</span>}<input type="file" accept="image/*" onChange={upAvatar} className="hidden"/></label></div>
<p className="text-center text-xs text-zinc-600 mt-1">Tap to upload photo</p>
<input value={name} onChange={function(e:any){setName(e.target.value);}} placeholder="Name" className="w-full p-3 mt-3 bg-zinc-800 rounded-xl text-white"/>
<input value={phone} onChange={function(e:any){setPhone(e.target.value);}} placeholder="Phone" className="w-full p-3 mt-2 bg-zinc-800 rounded-xl text-white"/>
<button onClick={startOtp} className="w-full bg-pink-600 p-3 rounded-xl mt-3 font-bold">SEND OTP</button>
</div>
) : (
<div>
<p className="text-green-400 text-sm mt-3">OTP: {genOtp} (Demo)</p>
<input value={otp} onChange={function(e:any){setOtp(e.target.value);}} placeholder="Enter OTP" className="w-full p-3 mt-2 bg-zinc-800 border border-green-500 rounded-xl text-white"/>
<button onClick={doVerify} className="w-full bg-green-500 text-black p-3 rounded-xl mt-3 font-bold">VERIFY</button>
<button onClick={function(){setStep(0);}} className="w-full bg-zinc-800 p-2 rounded-xl mt-2 text-xs">Back</button>
</div>
)}
</div>
</div>
)}
{user && (
<div>
<div className="flex gap-1 overflow-x-auto">
{Array.from({length:12},function(_,i){let r="jhumm-room-"+(i+1);return(<button key={r} onClick={function(){setRoom(r);}} className={room===r ? "bg-pink-600 px-3 py-1 rounded-full text-xs" : "bg-zinc-800 px-3 py-1 rounded-full text-xs"}>{r==="jhumm-room-1" ? "1 AUTO" : i+1}</button>);})}
</div>
<div className="flex gap-2 mt-2 items-center">
{!isLive ? <button onClick={goLive} className="bg-pink-600 px-4 py-2 rounded-full text-sm">GO LIVE</button> : <button onClick={function(){streamRef.current.getTracks().forEach(function(t:any){t.stop();});hostRef.current.leave();setIsLive(false);}} className="bg-zinc-800 px-4 py-2 rounded-full text-sm">STOP</button>}
<span className="text-xs text-green-400">{hosts.length} LIVE</span>
<button onClick={function(){localStorage.clear();location.reload();}} className="ml-auto bg-zinc-800 px-2 py-1 rounded text-xs">{user.name} Logout</button>
</div>
<div className="relative mt-3">
<video ref={localRef} autoPlay muted playsInline className="w-full h-40 bg-zinc-900 rounded-xl"></video>
<div className="relative mt-2 bg-zinc-900 rounded-xl"><video ref={remoteRef} autoPlay playsInline className="w-full h-64 rounded-xl"></video></div>
</div>
<div className="flex gap-2 overflow-x-auto mt-3">
{hosts.filter(function(h:any){return h.id!==myId;}).map(function(h:any){return(<div key={h.id} onClick={function(){joinP(h);}} className="min-w-16 text-center p-2 rounded-xl bg-zinc-800"><img src={h.avatar} className="w-10 h-10 rounded-full mx-auto object-cover" alt="av"/><div className="text-xs mt-1">{h.name}</div><div className="text-xs bg-pink-600 rounded-full mt-1 px-2 py-1">JOIN</div></div>);})}
</div>
{hosts.filter(function(h:any){return h.id!==myId;}).length>0 && !watch ? <button onClick={function(){joinP(hosts.filter(function(h:any){return h.id!==myId;})[0]);}} className="fixed bottom-20 left-3 bg-pink-600 px-5 py-3 rounded-full font-bold z-20">JOIN</button> : null}
{watch ? <button onClick={function(){viewRef.current.leave();setWatch(null);}} className="fixed bottom-20 left-3 bg-black bg-opacity-80 px-4 py-2 rounded-full z-20 text-sm">Leave {watch.name}</button> : null}
<div className="bg-zinc-900 rounded-xl mt-3 h-20 overflow-y-auto p-2">{chats.map(function(c:any){return(<div key={c.id} className="text-xs mb-1"><b className="text-pink-500">{c.name}: </b>{c.text}</div>);})}</div>
<div className="flex gap-2 mt-2"><input value={chatIn} onChange={function(e:any){setChatIn(e.target.value);}} placeholder="Chat..." className="flex-1 p-2 bg-zinc-800 rounded-full text-sm text-white"/><button onClick={sendChat} className="bg-pink-600 px-4 rounded-full text-sm">Send</button></div>
<div className="flex gap-2 mt-2 bg-zinc-900 p-2 rounded-xl overflow-x-auto"><button onClick={function(){sendGift("HEART");}} className="bg-zinc-800 px-3 py-1 rounded-full">HEART</button><button onClick={function(){sendGift("ROSE");}} className="bg-zinc-800 px-3 py-1 rounded-full">ROSE</button><button onClick={function(){sendGift("DIAMOND");}} className="bg-zinc-800 px-3 py-1 rounded-full">DIAMOND</button><button onClick={function(){sendGift("FIRE");}} className="bg-zinc-800 px-3 py-1 rounded-full">FIRE</button></div>
<div className="fixed bottom-16 left-1/2 text-3xl flex gap-2">{gifts.map(function(g:any){return(<div key={g.id}>{g.emoji}</div>);})}</div>
</div>
)}
</div>
);
} 