import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABN Marketplace",
  description:
    "ABN Store, ABN Business and ABN Daily Needs — one connected marketplace. Cash on Delivery planned at launch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
