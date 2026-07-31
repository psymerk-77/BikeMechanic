import {json,currentUser,searchChapters} from "../_lib/common.js";
export async function onRequestGet({request,env}) {
  const u=await currentUser(request,env); if(!u) return json({error:"Devi effettuare il login."},401);
  if(!u.pro) return json({error:"Serve l'accesso PRO per cercare nel manuale."},403);
  const q=new URL(request.url).searchParams.get("q")||"";
  return json({matches:searchChapters(q)});
}
