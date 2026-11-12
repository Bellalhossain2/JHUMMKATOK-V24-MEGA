import { kv } from '@vercel/kv';
export const dynamic='force-dynamic';
export async function GET(req:Request){
let url=new URL(req.url);
let room=url.searchParams.get('room')||'Room 1';
let key=`live:v42:${room}`;
let all=await kv.hgetall(key) as any||{};
let list=Object.values(all).filter((u:any)=>Date.now()-u.time<30000 && u.isLive);
return new Response(JSON.stringify(list.slice(0,1)),{headers:{"Access-Control-Allow-Origin":"*"}});
}
export async function POST(req:Request){
let b=await req.json();
let room=b.room||'Room 1';
let key=`live:v42:${room}`;
if(!b.isLive){ await kv.hdel(key,b.id); return new Response("[]",{headers:{"Access-Control-Allow-Origin":"*"}}); }
let all=await kv.hgetall(key) as any||{};
let lives=Object.values(all).filter((u:any)=>Date.now()-u.time<30000 && u.isLive);
if(lives.length>=1 && !all[b.id]) return new Response(JSON.stringify(lives.slice(0,1)),{headers:{"Access-Control-Allow-Origin":"*"}});
await kv.hset(key,{[b.id]:b});
return new Response(JSON.stringify([...lives,b].slice(0,1)),{headers:{"Access-Control-Allow-Origin":"*"}});
} 