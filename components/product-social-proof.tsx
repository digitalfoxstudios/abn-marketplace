"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RelatedProduct = { id:string; name:string; slug:string; price:number; compare_at_price:number|null; image_url:string|null };
type Review = { id:string; rating:number; title:string|null; review_text:string; customer_name:string|null; photo_urls:string[]; created_at:string; verified_purchase:boolean };
type EligibleOrderItem = { id:string; product_name:string; created_at?:string };
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

export default function ProductSocialProof({productId,categoryId}:{productId:string;categoryId:string|null}){
 const [related,setRelated]=useState<RelatedProduct[]>([]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [eligible,setEligible]=useState<EligibleOrderItem[]>([]);
 const [rating,setRating]=useState(5);
 const [title,setTitle]=useState("");
 const [body,setBody]=useState("");
 const [orderItem,setOrderItem]=useState("");
 const [files,setFiles]=useState<File[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [signedIn,setSignedIn]=useState(false);
 const [loading,setLoading]=useState(true);
 const db=createSupabaseBrowserClient();
 useEffect(()=>{
  let live=true;
  async function load(){
   if(!db){setLoading(false);return;}
   const [{data:auth},{data:rv}] = await Promise.all([
    db.auth.getUser(),
    db.from("product_reviews").select("id,rating,title,review_text,customer_name,photo_urls,created_at,verified_purchase").eq("product_id",productId).eq("status","published").order("created_at",{ascending:false}).limit(20)
   ]);
   if(!live)return;
   setSignedIn(!!auth.user);
   setReviews((rv??[]) as Review[]);
   if(auth.user){
    const {data:items}=await db.from("order_items").select("id,product_name,orders!inner(customer_id)").eq("product_id",productId).eq("orders.customer_id",auth.user.id).limit(30);
    if(live)setEligible((items??[]) as unknown as EligibleOrderItem[]);
   }
   const query=db.from("products").select("id,name,slug,price,compare_at_price,image_url").eq("vertical","store").eq("is_active",true).neq("id",productId).limit(8);
   const {data:rp}=categoryId?await query.eq("category_id",categoryId).order("created_at",{ascending:false}):await query.order("created_at",{ascending:false});
   if(live)setRelated((rp??[]) as RelatedProduct[]);
   if(live)setLoading(false);
  }
  load().catch(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[productId,categoryId]);
 const average=useMemo(()=>reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0,[reviews]);
 async function submitReview(){
  if(!db)return;
  if(!orderItem){setMessage("A verified purchase is required before submitting a review.");return;}
  if(body.trim().length<8){setMessage("Please write at least 8 characters in your review.");return;}
  if(files.length>3){setMessage("Please upload up to 3 photos.");return;}
  setBusy(true);setMessage("");
  try{
   const {data:auth}=await db.auth.getUser();
   if(!auth.user)throw new Error("Please sign in to submit a review.");
   const urls:string[]=[];
   for(const file of files){
    if(!file.type.startsWith("image/")||file.size>5*1024*1024)throw new Error("Each photo must be an image under 5 MB.");
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
    const path=auth.user.id+"/"+productId+"/"+crypto.randomUUID()+"-"+safe;
    const {error:uploadError}=await db.storage.from("product-review-photos").upload(path,file,{contentType:file.type,upsert:false});
    if(uploadError)throw uploadError;
    const {data}=db.storage.from("product-review-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
   }
   const {error}=await db.from("product_reviews").insert({product_id:productId,customer_id:auth.user.id,order_item_id:orderItem,rating,title:title.trim()||null,review_text:body.trim(),photo_urls:urls,status:"pending",verified_purchase:true});
   if(error)throw error;
   setMessage("Thank you! Your verified-purchase review has been submitted for moderation.");
   setTitle("");setBody("");setFiles([]);setOrderItem("");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not submit your review.");}
  finally{setBusy(false);}
 }
 return <div className="product-social-proof">
  <section className="related-products-section">
   <div className="social-section-heading"><div><span>YOU MAY ALSO LIKE</span><h2>Related products</h2></div></div>
   {loading?<p className="social-muted">Finding similar products…</p>:related.length===0?<p className="social-muted">More products are being added to ABN Shopping.</p>:
    <div className="related-product-grid">{related.map(p=><a className="related-product-card" href={"/products/"+encodeURIComponent(p.slug)} key={p.id}><div className="related-product-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<span>ABN</span>}</div><strong>{p.name}</strong><b>{money(Number(p.price))}</b>{p.compare_at_price&&<del>{money(Number(p.compare_at_price))}</del>}</a>)}</div>}
  </section>
  <section className="customer-reviews-section">
   <div className="social-section-heading"><div><span>REAL CUSTOMER EXPERIENCES</span><h2>Customer reviews & photos</h2></div><div className="review-summary">{reviews.length?<><b>{average.toFixed(1)} ★</b><small>{reviews.length} published {reviews.length===1?"review":"reviews"}</small></>:<small>No published reviews yet</small>}</div></div>
   {reviews.length===0?<p className="social-muted">Be the first customer to share an experience after purchasing this product.</p>:
    <div className="customer-review-list">{reviews.map(r=><article className="customer-review" key={r.id}><div className="review-author"><b>{r.customer_name||"ABN Customer"}</b><span>{r.rating} / 5 ★</span>{r.verified_purchase&&<em>Verified purchase</em>}<time>{new Date(r.created_at).toLocaleDateString("en-IN")}</time></div>{r.title&&<h3>{r.title}</h3>}<p>{r.review_text}</p>{r.photo_urls?.length>0&&<div className="review-photo-grid">{r.photo_urls.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt={"Customer product photo "+(i+1)}/></a>)}</div>}</article>)}</div>}
   <div className="write-review-box"><h3>Share your experience</h3>
    {!signedIn?<p className="social-muted">Sign in and purchase this product to leave a verified review with photos.</p>:eligible.length===0?<p className="social-muted">Only customers who purchased this product can submit a verified review. Your eligible purchase will appear here after ordering.</p>:
     <div className="review-form">
      <label>Purchased product order item<select value={orderItem} onChange={e=>setOrderItem(e.target.value)}><option value="">Choose your purchase</option>{eligible.map(o=><option key={o.id} value={o.id}>{o.product_name} · {o.id.slice(0,8)}</option>)}</select></label>
      <label>Your rating<select value={rating} onChange={e=>setRating(Number(e.target.value))}><option value={5}>5 - Excellent</option><option value={4}>4 - Very good</option><option value={3}>3 - Good</option><option value={2}>2 - Fair</option><option value={1}>1 - Poor</option></select></label>
      <label>Review title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Summarise your experience"/></label>
      <label>Your review<textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="What did you like or dislike about the product?"/></label>
      <label>Add product photos (up to 3, 5 MB each)<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={e=>setFiles(Array.from(e.target.files??[]).slice(0,3))}/></label>
      {files.length>0&&<small>{files.length} photo(s) selected</small>}
      <button type="button" disabled={busy} onClick={submitReview}>{busy?"Submitting…":"Submit verified review"}</button>
     </div>}
    {message&&<p className="review-form-message" role="status">{message}</p>}
   </div>
  </section>
 </div>;
}
