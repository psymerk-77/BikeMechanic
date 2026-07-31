import {json,currentUser} from "../_lib/common.js";
export async function onRequestGet({request,env}) {
  const u=await currentUser(request,env); if(!u) return json({error:"Devi effettuare il login."},401);
  return json({email:u.email,pro:!!u.pro});
}
