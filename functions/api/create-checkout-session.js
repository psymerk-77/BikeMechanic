import {json,currentUser} from "../_lib/common.js";
export async function onRequestPost({request,env}) {
  const u=await currentUser(request,env); if(!u) return json({error:"Devi effettuare il login."},401);
  if(!env.STRIPE_SECRET_KEY) return json({error:"Stripe non configurato."},503);
  const p=new URLSearchParams();
  p.set("mode","payment");
  p.set("success_url",`${new URL(request.url).origin}/?paid=1`);
  p.set("cancel_url",`${new URL(request.url).origin}/?cancelled=1`);
  p.set("customer_email",u.email);
  if(env.STRIPE_PRICE_ID) {
    p.set("line_items[0][price]",env.STRIPE_PRICE_ID);
  } else {
    p.set("line_items[0][price_data][currency]","eur");
    p.set("line_items[0][price_data][product_data][name]","BIKE MECHANIC PRO");
    p.set("line_items[0][price_data][unit_amount]",String(env.PRICE_CENTS||1990));
    p.set("line_items[0][quantity]","1");
  }
  const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,"Content-Type":"application/x-www-form-urlencoded"},body:p});
  const d=await r.json();
  if(!r.ok) return json({error:d.error?.message||"Stripe error"},503);
  return json({url:d.url});
}
