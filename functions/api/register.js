import {json,readJson,passwordHash,randomToken,digestHex,cookie} from "../_lib/common.js";
export async function onRequestPost({request,env}) {
  const b=await readJson(request), email=String(b.email||"").trim().toLowerCase(), password=String(b.password||"");
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({error:"Email non valida."},400);
  if(password.length<8) return json({error:"La password deve avere almeno 8 caratteri."},400);
  const exists=await env.DB.prepare("SELECT email FROM users WHERE email=?").bind(email).first();
  if(exists) return json({error:"Account già esistente."},409);
  const hp=await passwordHash(password);
  await env.DB.prepare("INSERT INTO users(email,password_salt,password_hash,pro,created_at) VALUES(?,?,?,?,?)")
    .bind(email,hp.salt,hp.hash,0,new Date().toISOString()).run();
  const token=randomToken(), th=await digestHex(new TextEncoder().encode(token));
  await env.DB.prepare("INSERT INTO sessions(token_hash,email,expires_at,created_at) VALUES(?,?,?,?)")
    .bind(th,email,Date.now()+2592000000,new Date().toISOString()).run();
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{"content-type":"application/json","Set-Cookie":cookie("bm_session",token,2592000)}})
}
