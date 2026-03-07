import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "CipherPay Audit",
  description: "User export and auditor verification portal"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
