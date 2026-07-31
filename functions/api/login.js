import {json,readJson,passwordHash,verifyPassword,randomToken,digestHex,cookie} from "../_lib/common.js";
export async function onRequestPost({request,env}) {
  const b=await readJson(request), email=String(b.email||"").trim().toLowerCase(), password=String(b.password||"");
  const u=await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  if(!u || !(await verifyPassword(password,u.password_salt,u.password_hash))) return json({error:"Email o password non corretti."},401);
  const token=randomToken(), th=await digestHex(new TextEncoder().encode(token));
  await env.DB.prepare("INSERT INTO sessions(token_hash,email,expires_at,created_at) VALUES(?,?,?,?)")
    .bind(th,email,Date.now()+2592000000,new Date().toISOString()).run();
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{"content-type":"application/json","Set-Cookie":cookie("bm_session",token,2592000)}});
}
