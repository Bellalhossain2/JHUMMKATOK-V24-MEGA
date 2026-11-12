export const dynamic = 'force-dynamic';
const FB="https://trystero-101-default-rtdb.firebaseio.com/jhumm-v36-presence";
export async function GET(){
try{
let r=await fetch(FB+".json");
let d=await r.json()||{};
let now=Date.now();
let all=Object.values(d as any).filter((x:any)=>now-x.time<20000);
return new Response(JSON.stringify(all),{headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}});
}catch(e){return new Response("[]",{headers:{"Access-Control-Allow-Origin":"*"}});}
}
export async function POST(req:Request){
try{
let b=await req.json();
await fetch(FB+"/"+b.id+".json",{method:"PUT",body:JSON.stringify(b)});
let r=await fetch(FB+".json");
let d=await r.json()||{};
let now=Date.now();
let all=Object.values(d as any).filter((x:any)=>now-x.time<25000);
return new Response(JSON.stringify(all),{headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}});
}catch(e){return new Response("[]",{headers:{"Access-Control-Allow-Origin":"*"}});}
}
export async function OPTIONS(){
return new Response("",{headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
} 