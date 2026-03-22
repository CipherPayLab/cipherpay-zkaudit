import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import { CipherPayWalletProvider } from "@/components/shared/WalletProvider";
import { CipherPayTokenBridge } from "@/components/CipherPayTokenBridge";

export const metadata = {
  title: "CipherPay Audit",
  description: "User export and auditor verification portal"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900" suppressHydrationWarning>
        {/* Runs before React/hydration so sessionStorage has JWT before useActivities fetch */}
        <Script id="cipherpay-cp-token-hash" strategy="beforeInteractive">
          {`
(function(){
  try {
    var h = window.location.hash || '';
    if (h.length < 2) return;
    var m = h.match(/^#cp_token=(.+)$/);
    if (!m) return;
    var t = decodeURIComponent(m[1].trim());
    if (!t) return;
    sessionStorage.setItem('cipherpay_bearer_token', t);
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (e) {}
})();
          `}
        </Script>
        <CipherPayWalletProvider>
          <CipherPayTokenBridge />
          {children}
        </CipherPayWalletProvider>
      </body>
    </html>
  );
}
