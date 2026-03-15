import type { AuditBundleV1, AuditBundleVerificationResult } from "@cipherpay/audit-types";

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
  return new Date(unix * 1000).toLocaleString();
}

interface VerificationSummaryProps {
  result: AuditBundleVerificationResult;
  bundle?: AuditBundleV1 | null;
}

export function VerificationSummary({ result, bundle }: VerificationSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Bundle Verification Summary</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Overall Result</div>
            <div className={`mt-1 font-semibold ${result.ok ? "text-emerald-700" : "text-red-700"}`}>
              {result.ok ? "PASS" : "FAIL"}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Bundle Signature</div>
            <div
              className={`mt-1 font-semibold ${
                result.bundle_signature_valid ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {result.bundle_signature_valid ? "Valid" : "Invalid"}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Entries</div>
            <div className="mt-1 font-semibold text-slate-900">{result.entries.length}</div>
          </div>
        </div>
      </div>

      {result.bundle_errors.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          <div className="font-semibold">Bundle Errors</div>
          <ul className="mt-3 list-disc pl-5">
            {result.bundle_errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.bundle_warnings.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 shadow-sm">
          <div className="font-semibold">Bundle Warnings</div>
          <ul className="mt-3 list-disc pl-5">
            {result.bundle_warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Entry Results</h3>
        </div>

        <div className="divide-y">
          {result.entries.map((entry) => {
            const bundleEntry = bundle?.entries.find(
              (e) => String(e.entry_id) === String(entry.entry_id)
            );
            const disc = bundleEntry?.selective_disclosure;
            const receipt = bundleEntry?.onchain_receipt;

            return (
              <div key={entry.entry_id} className="p-6">
                {/* Header row: entry id / type + pass/fail badge */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Entry #{entry.entry_id}
                      </span>
                      {bundleEntry && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-600">
                          {bundleEntry.event_type}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Proof: {entry.proof_valid ? "valid" : "invalid"} · Receipt:{" "}
                      {entry.receipt_match ? "matched" : "failed"}
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      entry.ok
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {entry.ok ? "PASS" : "FAIL"}
                  </div>
                </div>

                {/* Transaction detail grid */}
                {bundleEntry && (
                  <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-slate-50 px-4 py-3 text-xs">
                    {disc?.amount && (
                      <>
                        <span className="text-slate-400">Amount</span>
                        <span className="font-semibold text-slate-800">
                          {lamportsToSol(disc.amount)}
                        </span>
                      </>
                    )}
                    {(disc?.sender_name || disc?.sender) && (
                      <>
                        <span className="text-slate-400">Sender</span>
                        <span className="text-slate-700">
                          {disc.sender_name ?? disc.sender}
                        </span>
                      </>
                    )}
                    {(disc?.recipient_name || disc?.recipient) && (
                      <>
                        <span className="text-slate-400">Recipient</span>
                        <span className="text-slate-700">
                          {disc.recipient_name ?? disc.recipient}
                        </span>
                      </>
                    )}
                    {receipt?.spent_unix_ts && (
                      <>
                        <span className="text-slate-400">Timestamp</span>
                        <span className="text-slate-700">
                          {formatTs(receipt.spent_unix_ts)}
                        </span>
                      </>
                    )}
                    {receipt?.tx_signature && (
                      <>
                        <span className="text-slate-400">Tx Sig</span>
                        <span
                          className="cursor-pointer font-mono text-slate-500 hover:text-slate-800"
                          title={receipt.tx_signature}
                          onClick={() =>
                            navigator.clipboard.writeText(receipt.tx_signature!)
                          }
                        >
                          {receipt.tx_signature.slice(0, 16)}…
                        </span>
                      </>
                    )}
                    {receipt?.nullifier_record_pda && (
                      <>
                        <span className="text-slate-400">PDA</span>
                        <span
                          className="cursor-pointer font-mono text-slate-500 hover:text-slate-800"
                          title={receipt.nullifier_record_pda}
                          onClick={() =>
                            navigator.clipboard.writeText(receipt.nullifier_record_pda!)
                          }
                        >
                          {receipt.nullifier_record_pda.slice(0, 16)}…
                        </span>
                      </>
                    )}
                  </div>
                )}

                {entry.errors.length > 0 ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="font-medium">Errors</div>
                    <ul className="mt-2 list-disc pl-5">
                      {entry.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {entry.warnings.length > 0 ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    <div className="font-medium">Warnings</div>
                    <ul className="mt-2 list-disc pl-5">
                      {entry.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
