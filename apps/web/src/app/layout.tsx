import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CipherPay ZK Audit",
  description: "Audit and verify CipherPay shielded activities",
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
