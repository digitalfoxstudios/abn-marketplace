import { redirect } from "next/navigation";

// ABN Marketplace will be launched as a separate seller/business application.
// Until that application has its own deployment, send old customer links to ABN Shopping.
export default function MarketplaceRoute(){
  redirect("/store");
}
