import {json} from "../_lib/common.js";
async function sign(secret, payload){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const b=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function parseSig(h){const out={};for(const x of (h||"").split(",")){const [k,v]=x.split("=");if(k&&v)out[k]=v;}return out;}
export async function onRequestPost({request,env}) {
  if(!env.STRIPE_WEBHOOK_SECRET) return json({error:"Webhook secret non configurato."},503);
  const raw=await request.text(), sig=parseSig(request.headers.get("Stripe-Signature"));
  if(!sig.t||!sig.v1) return json({error:"Firma Stripe mancante."},400);
  const expected=await sign(env.STRIPE_WEBHOOK_SECRET,`${sig.t}.${raw}`);
  if(expected!==sig.v1) return json({error:"Firma Stripe non valida."},400);
  let ev;try{ev=JSON.parse(raw)}catch{return json({error:"JSON non valido."},400);}
  if(ev.type==="checkout.session.completed"){
    const email=ev.data?.object?.customer_details?.email||ev.data?.object?.customer_email;
    if(email) await env.DB.prepare("UPDATE users SET pro=1, paid_at=? WHERE email=?").bind(new Date().toISOString(),email.toLowerCase()).run();
  }
  return json({ok:true});
}
