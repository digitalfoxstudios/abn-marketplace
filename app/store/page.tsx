"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import VerticalSwitcher from "@/components/vertical-switcher";

type Category = { id: string; name: string; slug: string };
type Shop = { id:string; store_name:string; slug:string; tagline:string|null; logo_url:string|null };
type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null; image_url: string | null;
  unit: string | null; category_id: string | null; sku: string | null; shop_id:string|null;
};
type CartLine = { product: Product; quantity: number };

const money = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(value);

export default function StorePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { router.replace("/account"); return; }
    const client = supabase;
    let active = true;
    async function load() {
      const { data: auth } = await client.auth.getUser();
      if (!auth.user) { router.replace("/account"); return; }
      if (active) setEmail(auth.user.email ?? "");
      const [categoryResult, productResult, shopResult] = await Promise.all([
        client.from("categories").select("id,name,slug").eq("vertical", "store").eq("is_active", true).order("sort_order"),
        client.from("products").select("id,name,slug,description,price,compare_at_price,image_url,unit,category_id,sku,shop_id").eq("vertical", "store").eq("is_active", true).order("created_at", { ascending: false }),
        client.from("digital_shops").select("id,store_name,slug,tagline,logo_url").eq("status","active").order("store_name"),
      ]);
      if (!active) return;
      if (categoryResult.error) setError(categoryResult.error.message);
      else setCategories(categoryResult.data ?? []);
      if (!shopResult.error) setShops((shopResult.data ?? []) as Shop[]);
      if (productResult.error) setError(productResult.error.message);
      else {
        const rows = (productResult.data ?? []) as Product[];
        setProducts(rows);
        if (rows.length) {
          const inventoryResult = await client.from("inventory").select("product_id,quantity,reserved_quantity").in("product_id", rows.map(p => p.id));
          if (!inventoryResult.error && active) {
            const totals: Record<string, number> = {};
            for (const item of inventoryResult.data ?? []) totals[item.product_id] = (totals[item.product_id] ?? 0) + Math.max(0, item.quantity - item.reserved_quantity);
            setStock(totals);
          }
        }
      }
      if (active) setLoading(false);
    }
    load().catch(e => { if (active) { setError(e instanceof Error ? e.message : "Unable to load the store."); setLoading(false); } });
    return () => { active = false; };
  }, [router]);

  const filtered = useMemo(() => products.filter(p =>
    (activeCategory === "all" || p.category_id === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.description ?? "").toLowerCase().includes(search.toLowerCase()))
  ), [products, activeCategory, search]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0);

  function addToCart(product: Product) {
    if ((stock[product.id] ?? 0) < 1) return;
    setCart(current => {
      const found = current.find(line => line.product.id === product.id);
      if (found) return current.map(line => line.product.id === product.id
        ? { ...line, quantity: Math.min(line.quantity + 1, stock[product.id] ?? 0) } : line);
      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, quantity: number) {
    if (quantity <= 0) setCart(current => current.filter(line => line.product.id !== productId));
    else setCart(current => current.map(line => line.product.id === productId
      ? { ...line, quantity: Math.min(quantity, stock[productId] ?? quantity) } : line));
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/account");
  }

  return (
    <main className="store-shell">
      <header className="store-header">
        <a className="store-brand" href="/store"><span className="store-brand-mark">ABN</span><span>Shopping<small>ABN Shopping</small></span></a><VerticalSwitcher/>
        <div className="store-header-right">{email?<><span>{email}</span><button className="store-outline" onClick={signOut}>Sign out</button></>:<a className="store-outline" href="/account">Sign in</a>}</div>
      </header>

      <section className="store-hero">
        <div><span className="store-kicker">ABN STORE · ONE NETWORK</span><h1>Find what you need.<br/><em>Shop with confidence.</em></h1><p>Explore products listed in the ABN marketplace. More categories and local sellers will be added as the catalogue grows.</p></div>
        <div className="store-hero-art" aria-hidden="true"><div className="store-art-circle">ABN</div><span>SHOP</span><b>01</b></div>
      </section>

      <section className="store-content">
        {shops.length>0&&<section className="store-shops-section"><div className="store-shops-heading"><div><span className="store-kicker">SELLER STOREFRONTS</span><h2>Explore digital shops</h2></div><span>Discover independent ABN sellers</span></div><div className="store-shops-row">{shops.map(shop=><a className="store-shop-chip" href={"/shops/"+encodeURIComponent(shop.slug)} key={shop.id}>{shop.logo_url?<img src={shop.logo_url} alt=""/>:<span className="store-shop-initial">{shop.store_name.slice(0,1).toUpperCase()}</span>}<span><strong>{shop.store_name}</strong><small>{shop.tagline||"Visit digital shop"}</small></span><b>→</b></a>)}</div></section>}
        <div className="store-toolbar"><div><span className="store-kicker">THE CATALOGUE</span><h2>Explore products</h2></div><button className="store-cart-button" onClick={() => setCartOpen(true)}>Cart <b>{cartCount}</b></button></div>
        <label className="store-search"><span aria-hidden="true">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." aria-label="Search products"/></label>
        <div className="store-categories"><button className={activeCategory === "all" ? "selected" : ""} onClick={() => setActiveCategory("all")}>All products</button>{categories.map(c => <button key={c.id} className={activeCategory === c.id ? "selected" : ""} onClick={() => setActiveCategory(c.id)}>{c.name}</button>)}</div>

        {loading ? <div className="store-empty">Loading ABN Store catalogue…</div> : error ? <div className="store-empty store-error">We couldn't load the catalogue: {error}</div> : filtered.length === 0 ? (
          <div className="store-empty"><div className="store-empty-icon">▣</div><h3>{search ? "No matching products" : "The ABN Store catalogue is being prepared"}</h3><p>{search ? "Try another search term or category." : "Product listings will appear here after an ABN administrator adds and activates products. We have prepared the shopping categories; no sample products or fake prices are shown."}</p>{search && <button className="store-outline" onClick={() => {setSearch("");setActiveCategory("all");}}>Clear search</button>}</div>
        ) : (
          <div className="store-product-grid">{filtered.map(product => {
            const available = stock[product.id] ?? 0;
            return <article className="store-product" key={product.id}>
              <a className="store-product-image" href={"/products/"+encodeURIComponent(product.slug)} aria-label={"View "+product.name}>{product.image_url ? <img src={product.image_url} alt={product.name}/> : <span>ABN</span>}</a>
              <div className="store-product-body"><h3><a href={"/products/"+encodeURIComponent(product.slug)}>{product.name}</a></h3>{product.shop_id&&shops.find(shop=>shop.id===product.shop_id)&&<a className="store-product-seller" href={"/shops/"+encodeURIComponent(shops.find(shop=>shop.id===product.shop_id)!.slug)}>Sold by {shops.find(shop=>shop.id===product.shop_id)!.store_name}</a>}<p>{product.description || "Available from ABN Store."}</p><div className="store-price">{money(Number(product.price))}{product.unit ? <small> / {product.unit}</small> : null}</div><div className="store-stock">{available > 0 ? `${available} available` : "Currently out of stock"}</div><a className="store-product-details-link" href={"/products/"+encodeURIComponent(product.slug)}>View details & variants</a><button className="store-add" disabled={available < 1} onClick={() => addToCart(product)}>{available > 0 ? "Add to cart +" : "Out of stock"}</button></div>
            </article>;
          })}</div>
        )}
      </section>

      {cartOpen && <div className="store-overlay" onClick={() => setCartOpen(false)}><aside className="store-cart-panel" onClick={e => e.stopPropagation()}><div className="store-cart-head"><div><span className="store-kicker">YOUR SELECTION</span><h2>Shopping cart</h2></div><button onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>{cart.length === 0 ? <p className="store-cart-empty">Your cart is empty. Add products from the catalogue.</p> : <><div className="store-cart-lines">{cart.map(line => <div className="store-cart-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{money(Number(line.product.price))} each</small></div><div className="store-quantity"><button onClick={() => changeQuantity(line.product.id,line.quantity-1)}>−</button><b>{line.quantity}</b><button onClick={() => changeQuantity(line.product.id,line.quantity+1)}>+</button></div></div>)}</div><div className="store-cart-total"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="store-checkout-note">Cash on Delivery is planned for launch. Secure checkout is being implemented next; this cart does not place an order or reserve stock.</div><button className="store-checkout" disabled>Checkout coming next</button></>}</aside></div>}
      <footer className="store-footer"><a href="/store">ABN Shopping</a><span>ABN Marketplace · An initiative of BSVS</span></footer>
    </main>
  );
}
