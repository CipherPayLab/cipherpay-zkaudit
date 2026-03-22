"use client";

import { useEffect } from "react";
import { consumeCipherPayTokenFromHash } from "@/lib/cipherpayClientAuth";

/** Captures JWT from #cp_token=… (opened from CipherPay dashboard) for API Authorization fallback. */
export function CipherPayTokenBridge() {
  useEffect(() => {
    consumeCipherPayTokenFromHash();
  }, []);
  return null;
}
