"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function VerticalSwitcher(){
 const path=usePathname();
 const items=[{label:"ABN Shopping",href:"/store",active:path==="/store"||path.startsWith("/products/")||path.startsWith("/shops/")},{label:"ABN Now",href:"/now",active:path==="/now"||path.startsWith("/now/")}];
 return <nav className="abn-switcher" aria-label="ABN customer apps">{items.map(item=><Link key={item.href} href={item.href} className={item.active?"active":""}>{item.label}</Link>)}</nav>;
}
