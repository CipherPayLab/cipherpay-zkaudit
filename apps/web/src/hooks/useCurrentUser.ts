import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  username: string | null;
  owner_cipherpay_pub_key: string;
  solana_wallet_address: string | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setUser(data.user as CurrentUser);
      })
      .catch(() => {});
  }, []);

  return user;
}
