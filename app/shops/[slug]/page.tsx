"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VerticalSwitcher from "@/components/vertical-switcher";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Shop = { id:string; store_name:string; slug:string; tagline:string|null; description:string|null; logo_url:string|null; banner_url:string|null };
type Product = { id:string; name:string; slug:string; description:string|null; price:number; compare_at_price:number|null; image_url:string|null; unit:string|null };
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);

export default function DigitalShopPage(){
 const params=useParams<{slug:string}>();
 const [shop,setShop]=useState<Shop|null>(null);
 const [products,setProducts]=useState<Product[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  async function load(){
   const db=createSupabaseBrowserClient();
   if(!db){setError("The shop catalogue is temporarily unavailable.");setLoading(false);return;}
   const {data:s,error:shopError}=await db.from("digital_shops").select("id,store_name,slug,tagline,description,logo_url,banner_url").eq("slug",decodeURIComponent(params.slug)).eq("status","active").maybeSingle();
   if(shopError)throw shopError;
   if(!s){if(active){setError("This digital shop is not available yet.");setLoading(false);}return;}
   const {data:p,error:productError}=await db.from("products").select("id,name,slug,description,price,compare_at_price,image_url,unit").eq("shop_id",s.id).eq("publication_status","approved").eq("vertical","store").eq("is_active",true).order("created_at",{ascending:false});
   if(productError)throw productError;
   if(active){setShop(s as Shop);setProducts((p??[]) as Product[]);setLoading(false);}
  }
  load().catch(e=>{if(active){setError(e instanceof Error?e.message:"Unable to load this shop.");setLoading(false);}});
  return()=>{active=false};
 },[params.slug]);
 if(loading)return <main className="digital-shop-loading">Opening digital shop…</main>;
 if(!shop)return <main className="digital-shop-loading"><h1>Shop unavailable</h1><p>{error}</p><a href="/store">Back to ABN Shopping</a></main>;
 return <main className="digital-shop-page">
  <header className="digital-shop-header"><a className="digital-shop-brand" href="/store"><b>ABN</b> Shopping</a><VerticalSwitcher/><a href="/store" className="digital-shop-back">← All products</a></header>
  <section className="digital-shop-hero" style={shop.banner_url?{backgroundImage:"linear-gradient(90deg,rgba(8,36,66,.82),rgba(8,36,66,.2)),url("+shop.banner_url+")"}:undefined}>
   <div className="digital-shop-identity">{shop.logo_url?<img src={shop.logo_url} alt={shop.store_name+" logo"}/>:<span>{shop.store_name.slice(0,1).toUpperCase()}</span>}
    <div><small>ABN DIGITAL SHOP</small><h1>{shop.store_name}</h1><p>{shop.tagline||"Discover products from this ABN seller."}</p></div>
   </div>
  </section>
  <section className="digital-shop-content">
   <div className="digital-shop-heading"><div><small>SHOP COLLECTION</small><h2>Products from {shop.store_name}</h2></div><span>{products.length} {products.length===1?"product":"products"}</span></div>
   {shop.description&&<p className="digital-shop-description">{shop.description}</p>}
   {products.length===0?<div className="digital-shop-empty">This shop is getting its products ready. Please check back soon.</div>:
    <div className="digital-shop-products">{products.map(p=><a className="digital-shop-product" href={"/products/"+encodeURIComponent(p.slug)} key={p.id}>
     <div className="digital-shop-product-image">{p.image_url?<><img src={p.image_url} alt={p.name} loading="lazy" onError={e=>{e.currentTarget.parentElement?.setAttribute("data-image-error","true");e.currentTarget.style.display="none";}}/><span className="digital-shop-image-fallback">ABN</span></>:<span className="digital-shop-image-placeholder">ABN</span>}</div>
     <strong>{p.name}</strong><b>{money(Number(p.price))}{p.unit?<small> / {p.unit}</small>:null}</b>
     {p.compare_at_price&&<del>{money(Number(p.compare_at_price))}</del>}
     <span>View product →</span>
    </a>)}</div>}
  </section>
  <footer className="digital-shop-footer">A seller storefront on ABN Shopping · An initiative of BSVS</footer>
 </main>;
}
