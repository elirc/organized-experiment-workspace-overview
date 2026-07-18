import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founder CRM Lite",
  description: "A realistic CRM training application for founder-led sales teams."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
