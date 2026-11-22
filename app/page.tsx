import { redirect } from "next/navigation";

// ABN Shopping is the primary customer app. ABN Now is available through its in-app switcher.
export default function Home(){
  redirect("/store");
}
