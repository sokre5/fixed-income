import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FI-JOURNAL │ Fixed Income Intelligence Platform",
  description: "Bloomberg-style manual insight tracker for fixed-income markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
