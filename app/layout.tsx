import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lovie P2P Requests",
  description: "P2P payment request flow built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
