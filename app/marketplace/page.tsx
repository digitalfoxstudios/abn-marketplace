"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import VerticalSwitcher from "@/components/vertical-switcher";

type Product = { id:string; slug:string; name:string; price:number; compare_at_price:number|null; image_url:string|null; unit:string|null; category_id:string|null };
type Category = { id:string; name:string; slug:string };

const rupees=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

export default function MarketplacePage(){
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [products,setProducts]=useState<Product[]>([]);
 const [categories,setCategories]=useState<Category[]>([]);
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [signingOut,setSigningOut]=useState(false);

 useEffect(()=>{
  let active=true;
  async function load(){
   const supabase=createSupabaseBrowserClient();
   if(!supabase){router.replace("/account");return;}
   const {data:auth}=await supabase.auth.getUser();
   if(!auth.user){router.replace("/account");return;}
   if(active)setEmail(auth.user.email??"");
   const [p,c]=await Promise.all([
    supabase.from("products").select("id,slug,name,price,compare_at_price,image_url,unit,category_id").eq("vertical","store").eq("is_active",true).order("created_at",{ascending:false}).limit(12),
    supabase.from("categories").select("id,name,slug").eq("vertical","store").eq("is_active",true).order("sort_order")
   ]);
   if(!active)return;
   setProducts((p.data??[]) as Product[]);
   setCategories(c.data??[]);
   setLoading(false);
  }
  load().catch(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[router]);

 const shown=useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())),[products,query]);
 async function signOut(){
  const supabase=createSupabaseBrowserClient();if(!supabase)return;
  setSigningOut(true);await supabase.auth.signOut();router.replace("/account");router.refresh();
 }
 if(loading)return <main className="market-loading">Loading ABN Marketplace…</main>;

 return <main className="flip-market">
  <header className="flip-topbar">
   <div className="flip-top-inner">
    <a className="flip-logo" href="/marketplace"><b>ABN</b><span>Marketplace<small>Business & Services</small></span></a><VerticalSwitcher/>
    <label className="flip-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for products, brands and more"/><button aria-label="Search">⌕</button></label>
    <div className="flip-actions"><span className="flip-user">{email}</span><button className="flip-login" onClick={signOut} disabled={signingOut}>{signingOut?"Signing out…":"Sign out"}</button><a className="flip-cart" href="/store">🛒 <span>Cart</span></a></div>
   </div>
  </header>

  <nav className="flip-categories" aria-label="Shop categories">
   <a href="/store"><span className="flip-cat-icon">▣</span><b>All Products</b></a>
   {categories.map((c,i)=><a href="/store" key={c.id}><span className="flip-cat-icon">{["⌚","⌂","◈","▤","✿","⚽","✚"][i%7]}</span><b>{c.name}</b></a>)}
   <a href="#business"><span className="flip-cat-icon">⌂</span><b>ABN Business</b></a>
   <a href="#daily"><span className="flip-cat-icon">✿</span><b>Daily Needs</b></a>
  </nav>

  <div className="flip-page">
   <section className="flip-banner">
    <div className="flip-banner-copy"><span>WELCOME TO ABN MARKETPLACE</span><h1>Shopping made<br/><em>simple for everyone.</em></h1><p>Discover products, local businesses and everyday essentials — all in one network.</p><a href="/store">Explore ABN Store <b>→</b></a></div>
    <div className="flip-banner-art"><div className="flip-banner-disc">ABN<span>SHOP • DISCOVER • CONNECT</span></div><div className="flip-float flip-float-one">Everyday<br/>shopping</div><div className="flip-float flip-float-two">One network</div></div>
   </section>

   <section className="flip-section">
    <div className="flip-section-head"><div><small>HANDPICKED FOR YOU</small><h2>Top picks from ABN Store</h2></div><a href="/store">VIEW ALL <b>→</b></a></div>
    {query&&<p className="flip-results-label">Showing matches for “{query}”</p>}
    {shown.length===0?<div className="flip-no-products">{query?"No matching products found. Try another search.":"New products are being added to ABN Store. Check back soon."}</div>:
     <div className="flip-product-row">{shown.slice(0,8).map(p=><a className="flip-product" href={"/products/"+encodeURIComponent(p.slug)} key={p.id}><div className="flip-product-img">{p.image_url?<img src={p.image_url} alt={p.name}/>:<span>ABN</span>}</div><strong>{p.name.replace(/^Demo: /,"")}</strong><b>{rupees(Number(p.price))}</b>{p.compare_at_price&&<small><del>{rupees(Number(p.compare_at_price))}</del> <i>Demo price</i></small>}<span className="flip-view-product">Explore product →</span></a>)}</div>}
   </section>

   <section className="flip-service-grid">
    <a className="flip-service-card" id="business" href="#business"><span className="flip-service-symbol">⌂</span><div><small>DISCOVER NEAR YOU</small><h3>ABN Business</h3><p>Find businesses, services and local providers in one directory.</p><b>Coming soon →</b></div></a>
    <a className="flip-service-card daily" id="daily" href="#daily"><span className="flip-service-symbol">✿</span><div><small>EVERYDAY ESSENTIALS</small><h3>ABN Daily Needs</h3><p>Groceries, fresh produce and household essentials from ABN.</p><b>Coming soon →</b></div></a>
   </section>
   <footer className="flip-footer"><a className="flip-footer-brand" href="/">ABN Marketplace</a><span>Cash on Delivery planned for launch · An initiative of BSVS</span><a href="/store">Open Store</a><span>Android app · Coming soon</span></footer>
  </div>
 </main>
}
