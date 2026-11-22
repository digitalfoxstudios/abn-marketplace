"use client";
import {useEffect,useMemo,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";
import VerticalSwitcher from "@/components/vertical-switcher";
type Product={id:string;name:string;slug:string;description:string|null;price:number;compare_at_price:number|null;image_url:string|null;unit:string|null;sku:string|null;shop_id:string|null};
type Image={id:string;image_url:string;alt_text:string|null;sort_order:number};
type Variant={id:string;name:string;sku:string|null;price:number|null;compare_at_price:number|null;image_url:string|null;attributes:Record<string,string>;stock_quantity:number};
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
export default function ProductDetailPage(){
 const params=useParams<{slug:string}>();const router=useRouter();
 const [product,setProduct]=useState<Product|null>(null);const [shop,setShop]=useState<{store_name:string;slug:string}|null>(null);const [images,setImages]=useState<Image[]>([]);const [variants,setVariants]=useState<Variant[]>([]);
 const [selected,setSelected]=useState("");const [activeImage,setActiveImage]=useState(0);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let alive=true;async function load(){const db=createSupabaseBrowserClient();if(!db){router.replace("/account");return;}
 const {data:p,error:e}=await db.from("products").select("id,name,slug,description,price,compare_at_price,image_url,unit,sku,shop_id").eq("slug",decodeURIComponent(params.slug)).eq("vertical","store").eq("is_active",true).maybeSingle();
 if(e)throw e;if(!p){if(alive){setError("This product is unavailable.");setLoading(false);}return;}
 const shopResult=p.shop_id?await db.from("digital_shops").select("store_name,slug").eq("id",p.shop_id).eq("status","active").maybeSingle():{data:null,error:null};
 const [im,va]=await Promise.all([db.from("product_images").select("id,image_url,alt_text,sort_order").eq("product_id",p.id).order("sort_order"),db.from("product_variants").select("id,name,sku,price,compare_at_price,image_url,attributes,stock_quantity").eq("product_id",p.id).eq("is_active",true).order("created_at")]);
 if(!alive)return;setProduct(p as Product);setShop(shopResult.data);setImages((im.data??[]) as Image[]);setVariants((va.data??[]) as Variant[]);if(va.data?.length)setSelected(va.data[0].id);setLoading(false);
 }load().catch(e=>{if(alive){setError(e instanceof Error?e.message:"Unable to load product.");setLoading(false);}});return()=>{alive=false}},[params.slug,router]);
 const variant=variants.find(v=>v.id===selected)??null;
 const gallery=useMemo(()=>{const all=[...(product?.image_url?[{id:"primary",image_url:product.image_url,alt_text:product.name,sort_order:-1}]:[]),...images];if(variant?.image_url&&!all.some(x=>x.image_url===variant.image_url))all.unshift({id:"variant",image_url:variant.image_url,alt_text:variant.name,sort_order:-2});return all},[product,images,variant]);
 useEffect(()=>setActiveImage(0),[selected]);
 if(loading)return <main className="product-loading">Loading product details…</main>;
 if(!product)return <main className="product-loading"><p>{error||"Product not found."}</p><a href="/store">Back to ABN Shopping</a></main>;
 const price=Number(variant?.price??product.price);
 return <main className="product-page"><header className="product-header"><a href="/store" className="product-brand"><b>ABN</b> Shopping</a><VerticalSwitcher/><a href="/store" className="product-back">← All products</a></header>
 <div className="product-breadcrumb"><a href="/store">Home</a> / ABN Shopping / {product.name}</div>
 <section className="product-detail-layout"><div className="product-gallery"><div className="product-main-image">{gallery[activeImage]?.image_url?<img src={gallery[activeImage].image_url} alt={gallery[activeImage].alt_text||product.name}/>:<span>ABN</span>}</div>
 {gallery.length>1&&<div className="product-thumbnails">{gallery.map((im,i)=><button key={im.id} className={activeImage===i?"selected":""} onClick={()=>setActiveImage(i)}><img src={im.image_url} alt={im.alt_text||("Product view "+(i+1))}/></button>)}</div>}</div>
 <div className="product-info"><span className="product-kicker">ABN SHOPPING</span><h1>{product.name}</h1>{shop&&<p className="product-seller">Sold by <a href={"/shops/"+encodeURIComponent(shop.slug)}>{shop.store_name}</a></p>}<p className="product-sku">Product code: {product.sku||"—"}</p><div className="product-detail-price">{money(price)}{product.unit&&<small> / {product.unit}</small>}{(variant?.compare_at_price??product.compare_at_price)&&<del>{money(Number(variant?.compare_at_price??product.compare_at_price))}</del>}</div>
 {variants.length>0&&<div className="product-variant-area"><h3>Choose a variant</h3><div className="product-variant-list">{variants.map(v=><button key={v.id} className={selected===v.id?"chosen":""} onClick={()=>setSelected(v.id)}>{v.image_url&&<img src={v.image_url} alt=""/>}<span>{v.name}</span>{v.price!=null&&<b>{money(Number(v.price))}</b>}</button>)}</div></div>}
 {variant&&<div className="product-attributes">{Object.entries(variant.attributes||{}).map(([k,v])=><span key={k}><b>{k}:</b> {v}</span>)}</div>}
 {variant&&<p className="product-availability">{variant.stock_quantity>0?variant.stock_quantity+" in stock for this variant":"This variant is currently out of stock"}</p>}
 <div className="product-detail-note">Cash on Delivery is planned for launch. Ordering will be enabled after checkout and stock validation are complete.</div><a className="product-back-button" href="/store">Continue shopping</a></div></section>
 <section className="product-description"><h2>Product details & description</h2><p>{product.description||"Detailed product information will be provided by ABN Shopping."}</p><dl><div><dt>Product</dt><dd>{product.name}</dd></div><div><dt>SKU</dt><dd>{product.sku||"Not specified"}</dd></div><div><dt>Unit</dt><dd>{product.unit||"Not specified"}</dd></div></dl></section>
 <footer className="product-footer">ABN Shopping · An initiative of Bahujan Samaj Vikas Sansthan</footer></main>
}