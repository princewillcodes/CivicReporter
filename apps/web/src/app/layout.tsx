import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicReporter Ghana — Community reports",
  description: "A Ghana-focused civic hazard reporting prototype with clearly labeled sample content.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
