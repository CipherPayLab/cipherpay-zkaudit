"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

interface CipherPayWalletProviderProps {
  children: React.ReactNode;
}

export function CipherPayWalletProvider({ children }: CipherPayWalletProviderProps) {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  // Phantom (and other modern wallets) auto-register via the Wallet Standard.
  // Passing explicit adapters like PhantomWalletAdapter is redundant and causes warnings.
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
