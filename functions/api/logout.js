import {parseCookie,digestHex,json} from "../_lib/common.js";
export async function onRequestPost({request,env}) {
  const token=parseCookie(request,"bm_session");
  if(token){const th=await digestHex(new TextEncoder().encode(token));await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(th).run();}
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{"content-type":"application/json","Set-Cookie":"bm_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"}});
}
