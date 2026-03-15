"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditBundleVerificationResult, AuditBundleV1 } from "@cipherpay/audit-types";
import { VerificationSummary } from "@/components/auditor/VerificationSummary";

function lamportsToSol(lamports: string | undefined): string {
  if (!lamports) return "—";
  try {
    const sol = Number(BigInt(lamports)) / 1e9;
    return `${sol.toLocaleString("en-US", { maximumFractionDigits: 9 })} SOL`;
  } catch {
    return lamports;
  }
}

function formatTs(unix: number | undefined): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toISOString().replace("T", " ").replace("Z", " UTC");
}

function buildReport(
  result: AuditBundleVerificationResult,
  bundle: AuditBundleV1 | null
): string {
  const now = new Date().toISOString();
  const lines: string[] = [];
  const hr = "─".repeat(60);

  const passCount = result.entries.filter((e) => e.ok).length;
  const failCount = result.entries.length - passCount;

  lines.push("╔════════════════════════════════════════════════════════════╗");
  lines.push("║          CipherPay ZK Audit Verification Report           ║");
  lines.push("╚════════════════════════════════════════════════════════════╝");
  lines.push("");
  lines.push(`Generated At     : ${now}`);
  lines.push(`Overall Result   : ${result.ok ? "PASS ✓" : "FAIL ✗"}`);
  lines.push(`Bundle Signature : ${result.bundle_signature_valid ? "Valid" : "Invalid"}`);
  lines.push(`Total Entries    : ${result.entries.length}  (PASS: ${passCount}  FAIL: ${failCount})`);

  if (bundle) {
    lines.push("");
    lines.push(`Bundle Created   : ${bundle.header.created_at_iso ?? "—"}`);
    lines.push(`Network          : ${bundle.header.network ?? "—"}`);
    lines.push(`Owner Wallet     : ${bundle.header.owner?.wallet_pubkey ?? "—"}`);
    lines.push(`Purpose          : ${bundle.header.purpose ?? "—"}`);
    if (bundle.header.notes) {
      lines.push(`Notes            : ${bundle.header.notes}`);
    }
  }

  lines.push("");

  if (result.bundle_errors.length > 0) {
    lines.push(hr);
    lines.push("BUNDLE ERRORS");
    lines.push(hr);
    result.bundle_errors.forEach((e) => lines.push(`  • ${e}`));
    lines.push("");
  }

  if (result.bundle_warnings.length > 0) {
    lines.push(hr);
    lines.push("BUNDLE WARNINGS");
    lines.push(hr);
    result.bundle_warnings.forEach((w) => lines.push(`  • ${w}`));
    lines.push("");
  }

  lines.push(hr);
  lines.push("ENTRY RESULTS");
  lines.push(hr);

  result.entries.forEach((entry, idx) => {
    // Find corresponding bundle entry for transaction details
    const bundleEntry = bundle?.entries.find((e) => String(e.entry_id) === String(entry.entry_id));
    const disc = bundleEntry?.selective_disclosure;
    const receipt = bundleEntry?.onchain_receipt;

    lines.push("");
    lines.push(`[${idx + 1}] Entry ID        : ${entry.entry_id}`);

    if (bundleEntry) {
      lines.push(`    Type             : ${bundleEntry.event_type.toUpperCase()}`);
    }

    if (disc?.amount) {
      lines.push(`    Amount           : ${lamportsToSol(disc.amount)}`);
    }
    if (disc?.sender_name || disc?.sender) {
      lines.push(`    Sender           : ${disc.sender_name ?? disc.sender}`);
    }
    if (disc?.recipient_name || disc?.recipient) {
      lines.push(`    Recipient        : ${disc.recipient_name ?? disc.recipient}`);
    }
    if (disc?.memo) {
      lines.push(`    Memo             : ${disc.memo}`);
    }

    if (receipt?.spent_unix_ts) {
      lines.push(`    Timestamp        : ${formatTs(receipt.spent_unix_ts)}`);
    }
    if (receipt?.tx_signature) {
      lines.push(`    Tx Signature     : ${receipt.tx_signature}`);
    }
    if (receipt?.nullifier_record_pda) {
      lines.push(`    Nullifier PDA    : ${receipt.nullifier_record_pda}`);
    }

    lines.push(`    Result           : ${entry.ok ? "PASS ✓" : "FAIL ✗"}`);
    lines.push(`    ZK Proof         : ${entry.proof_valid ? "Valid" : "Invalid"}`);
    lines.push(`    On-chain Receipt : ${entry.receipt_match ? "Matched" : "Failed"}`);

    if (entry.errors.length > 0) {
      lines.push(`    Errors:`);
      entry.errors.forEach((e) => lines.push(`      - ${e}`));
    }
    if (entry.warnings.length > 0) {
      lines.push(`    Warnings:`);
      entry.warnings.forEach((w) => lines.push(`      - ${w}`));
    }
  });

  lines.push("");
  lines.push(hr);
  lines.push("END OF REPORT");
  lines.push(hr);

  return lines.join("\n");
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditorVerifyPage() {
  const [result, setResult] = useState<AuditBundleVerificationResult | null>(null);
  const [bundle, setBundle] = useState<AuditBundleV1 | null>(null);

  useEffect(() => {
    const rawResult = sessionStorage.getItem("cipherpay_audit_result");
    if (rawResult) {
      setResult(JSON.parse(rawResult) as AuditBundleVerificationResult);
    }
    const rawBundle = sessionStorage.getItem("cipherpay_audit_bundle");
    if (rawBundle) {
      setBundle(JSON.parse(rawBundle) as AuditBundleV1);
    }
  }, []);

  function handleExport() {
    if (!result) return;
    const report = buildReport(result, bundle);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadText(report, `cipherpay-audit-report-${timestamp}.txt`);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Verification Result</h1>
          <p className="mt-2 text-slate-600">
            Review bundle-level and entry-level verification output.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              ↓ Export Report
            </button>
          )}
          <Link
            href="/auditor"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>
      <div className="mt-6">
        {result ? (
          <VerificationSummary result={result} bundle={bundle} />
        ) : (
          <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
            No verification result found. Please upload a bundle first.
          </div>
        )}
      </div>
    </main>
  );
}
