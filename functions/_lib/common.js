import { CHAPTERS } from "../_lib/chapters.js";

const COOKIE = "bm_session";
const PBKDF2_ITERATIONS = 120000;

export function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8", ...headers}
  });
}
export async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}
export function norm(s) {
  return String(s||"").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
}
export async function digestHex(bytes) {
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function passwordHash(password, saltBytes=crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2", salt:saltBytes, iterations:PBKDF2_ITERATIONS, hash:"SHA-256"}, key, 256);
  return {salt:[...saltBytes].map(x=>x.toString(16).padStart(2,"0")).join(""), hash:[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("")};
}
export function hexBytes(hex) {
  const a = new Uint8Array(hex.length/2); for(let i=0;i<a.length;i++) a[i]=parseInt(hex.slice(i*2,i*2+2),16); return a;
}
export async function verifyPassword(password, saltHex, expected) {
  const r = await passwordHash(password, hexBytes(saltHex)); return r.hash === expected;
}
export function randomToken() {
  const b=crypto.getRandomValues(new Uint8Array(32)); return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export function cookie(name,value,maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function parseCookie(request,name) {
  const c=request.headers.get("Cookie")||"";
  for(const part of c.split(";")) { const [k,...v]=part.trim().split("="); if(k===name) return v.join("="); }
  return null;
}
export async function currentUser(request, env) {
  const token=parseCookie(request,COOKIE); if(!token) return null;
  const th=await digestHex(new TextEncoder().encode(token));
  const row=await env.DB.prepare("SELECT u.email,u.pro,u.created_at,u.paid_at FROM sessions s JOIN users u ON u.email=s.email WHERE s.token_hash=? AND s.expires_at>?").bind(th,Date.now()).first();
  return row||null;
}
export async function requireUser(request, env) {
  const u=await currentUser(request,env); if(!u) return null; return u;
}
export function searchChapters(q) {
  const nq=norm(q), toks=[...new Set(nq.split(" ").filter(x=>x.length>2))];
  return CHAPTERS.map(ch=>{
    const body=norm([ch.title,ch.subtitle,ch.summary,...(ch.blocks||[]).map(b=>b.text||"")].join(" "));
    const title=norm(ch.title+" "+(ch.subtitle||"")); let score=0;
    if(nq.length>4&&title.includes(nq))score+=60;
    if(nq.length>4&&body.includes(nq))score+=25;
    for(const t of toks){if(title.includes(t))score+=18;score+=Math.min(6,body.split(t).length-1)*4;}
    return {ch,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map((x,i)=>({
    num:x.ch.num,
    confidence:Math.max(35,Math.min(96,Math.round(x.score/(i===0?x.score:Math.max(1,x.score))*96))),
    reason:"Corrispondenza per parole chiave trovate nel testo del capitolo."
  }));
}
