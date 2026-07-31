import {json,currentUser} from "../../_lib/common.js";
import {CHAPTERS} from "../../_lib/chapters.js";
export async function onRequestGet({request,env,params}) {
  const u=await currentUser(request,env); if(!u) return json({error:"Devi effettuare il login."},401);
  if(!u.pro) return json({error:"Serve l'accesso PRO per aprire i capitoli."},403);
  const ch=CHAPTERS.find(x=>x.num===Number(params.num));
  return ch?json(ch):json({error:"Capitolo non trovato."},404);
}
