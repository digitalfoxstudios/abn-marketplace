"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MarketplacePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { router.replace("/account"); return; }
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) { router.replace("/account"); return; }
      setEmail(data.user.email ?? "");
      setChecking(false);
    });
    return () => { active = false; };
  }, [router]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/account");
    router.refresh();
  }

  if (checking) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>Loading your ABN Marketplace…</main>;

  const cards = [
    { title: "ABN Store", text: "Browse the live product catalogue, search categories and build your cart.", mark: "01", href: "/store", active: true },
    { title: "ABN Business", text: "Discover businesses, services and local providers.", mark: "02", href: "", active: false },
    { title: "ABN Daily Needs", text: "Daily essentials, groceries and fresh produce.", mark: "03", href: "", active: false },
  ];

  return <main style={{minHeight:"100vh",background:"#f6f8f7",color:"#14251e",fontFamily:"Arial,sans-serif"}}>
    <header style={{background:"#fff",borderBottom:"1px solid #e5ebe7",padding:"16px max(20px, calc((100vw - 1100px) / 2))",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <a href="/" style={{color:"#08784e",fontWeight:800,fontSize:22,textDecoration:"none"}}>ABN <span style={{color:"#14251e"}}>Marketplace</span></a>
      <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><span style={{color:"#53645b",fontSize:13}}>{email}</span><button onClick={signOut} disabled={signingOut} style={{border:"1px solid #d5dfd9",borderRadius:9,background:"#fff",padding:"9px 13px",cursor:"pointer"}}>{signingOut?"Signing out…":"Sign out"}</button></div>
    </header>
    <section style={{maxWidth:1100,margin:"0 auto",padding:"64px 20px 28px"}}>
      <p style={{color:"#08784e",fontWeight:700,letterSpacing:1.5,fontSize:12}}>WELCOME TO ABN</p>
      <h1 style={{fontSize:"clamp(34px,6vw,58px)",lineHeight:1.05,margin:"10px 0 14px",maxWidth:720}}>Your marketplace. All in one network.</h1>
      <p style={{color:"#53645b",fontSize:17,lineHeight:1.6,maxWidth:650}}>You are signed in. Start with ABN Store; the Business and Daily Needs experiences are in development.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:18,marginTop:34}}>
        {cards.map(card=><article key={card.mark} style={{background:"#fff",border:"1px solid #e2eae5",borderRadius:18,padding:24,minHeight:205,boxShadow:"0 8px 28px rgba(20,37,30,.04)"}}>
          <p style={{color:"#08784e",fontWeight:800,fontSize:13}}>{card.mark}</p><h2 style={{fontSize:23,margin:"18px 0 9px"}}>{card.title}</h2><p style={{color:"#53645b",lineHeight:1.55,margin:0}}>{card.text}</p>
          {card.active?<a href={card.href} style={{display:"inline-block",marginTop:20,background:"#08784e",color:"#fff",padding:"11px 15px",borderRadius:9,fontSize:13,fontWeight:700}}>Open ABN Store →</a>:<p style={{color:"#8a6b25",fontSize:12,fontWeight:700,marginTop:20}}>IN DEVELOPMENT</p>}
        </article>)}
      </div>
      <p style={{color:"#718078",fontSize:13,marginTop:30}}>ABN Marketplace is an initiative of Bahujan Samaj Vikas Sansthan.</p>
    </section>
  </main>;
}
