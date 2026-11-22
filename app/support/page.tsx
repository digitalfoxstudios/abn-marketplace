"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Channel = { id: string; channel_type: string; label: string; value: string; description: string | null };

export default function SupportPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  useEffect(() => {
    const db = createSupabaseBrowserClient();
    if (!db) return;
    db.from("support_channels").select("id,channel_type,label,value,description").eq("is_active", true).order("display_order")
      .then(({ data }) => setChannels((data ?? []) as Channel[]));
  }, []);
  return <main className="support-page">
    <header className="support-header"><a href="/store"><b>ABN</b> Shopping</a><a href="/account/addresses">My shipping addresses</a></header>
    <section className="support-hero"><span>ABN CUSTOMER CARE</span><h1>We’re here to help.</h1><p>Get help with orders, payments, delivery, returns and account questions.</p></section>
    <section className="support-grid">
      {channels.filter(c => ["email","phone","hours"].includes(c.channel_type)).map(c => <article className="support-card" key={c.id}><small>{c.label}</small><h2>{c.value}</h2><p>{c.description}</p></article>)}
    </section>
    <section className="support-content"><h2>Shipping & delivery</h2><p>Delivery availability and estimated dates depend on the customer’s PIN code, product availability, seller handling time and courier capacity. The final delivery fee and ETA must be shown at checkout before an order is placed.</p><h2>Returns & refunds</h2><p>Return eligibility, time limits and refund methods vary by product category. The final approved ABN returns policy will be published before public launch.</p><h2>Order support</h2><p>Keep your ABN order number and registered phone number ready when contacting customer care. Our support team can help with order status, delayed delivery, damaged items and return requests.</p></section>
    <p className="support-demo-note">Presentation demo: the contact details and policies on this page are placeholders, not live customer-care channels or final legal terms.</p>
    <footer className="support-footer"><a href="/store">Back to ABN Shopping</a><span>ABN Shopping · An initiative of BSVS</span></footer>
  </main>;
}
