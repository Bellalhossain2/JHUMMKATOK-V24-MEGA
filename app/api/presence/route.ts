export const dynamic = 'force-dynamic';
let liveMap = globalThis as any;
if(!liveMap._JHUMM) liveMap._JHUMM = new Map();
export async function GET(){
let now=Date.now();
let all=[];
for(let [id,data] of liveMap._JHUMM){
if(now - data.time < 20000) all.push(data);
else liveMap._JHUMM.delete(id);
}
return new Response(JSON.stringify(all),{headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}});
}
export async function POST(req:Request){
try{
let data=await req.json();
data.time=Date.now();
liveMap._JHUMM.set(data.id,data);
let now=Date.now();
let all=[];
for(let [id,d] of liveMap._JHUMM){
if(now - d.time < 20000) all.push(d);
else liveMap._JHUMM.delete(id);
}
return new Response(JSON.stringify(all),{headers:{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}});
}catch(e){
return new Response("[]",{headers:{"Access-Control-Allow-Origin":"*"}});
}
}
export async function OPTIONS(){
return new Response("",{headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
}
