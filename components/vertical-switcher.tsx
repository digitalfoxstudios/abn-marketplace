"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function VerticalSwitcher(){
 const path=usePathname();
 const items=[{label:"ABN Shopping",href:"/store"},{label:"ABN Now",href:"/now"},{label:"ABN Marketplace",href:"/marketplace"}];
 return <nav className="abn-switcher" aria-label="ABN services">{items.map(item=><Link key={item.href} href={item.href} className={path===item.href?"active":""}>{item.label}</Link>)}</nav>;
}