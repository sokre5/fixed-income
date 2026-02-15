import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fixed-Income Manual Insight Tracker",
  description: "Manual-entry clarity dashboard for fixed-income market drivers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
