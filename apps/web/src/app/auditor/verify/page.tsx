"use client";

import { useEffect, useState } from "react";
import type { AuditBundleVerificationResult } from "@cipherpay/audit-types";
import { VerificationSummary } from "@/components/auditor/VerificationSummary";

export default function AuditorVerifyPage() {
  const [result, setResult] = useState<AuditBundleVerificationResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("cipherpay_audit_result");
    if (raw) {
      setResult(JSON.parse(raw) as AuditBundleVerificationResult);
    }
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Verification Result</h1>
      <p className="mt-2 text-slate-600">
        Review bundle-level and entry-level verification output.
      </p>
      <div className="mt-6">
        {result ? (
          <VerificationSummary result={result} />
        ) : (
          <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
            No verification result found. Please upload a bundle first.
          </div>
        )}
      </div>
    </main>
  );
}
