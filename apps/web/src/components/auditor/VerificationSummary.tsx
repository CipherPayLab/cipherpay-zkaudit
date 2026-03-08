import type { AuditBundleVerificationResult } from "@cipherpay/audit-types";

interface VerificationSummaryProps {
  result: AuditBundleVerificationResult;
}

export function VerificationSummary({ result }: VerificationSummaryProps) {
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
          {result.entries.map((entry) => (
            <div key={entry.entry_id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{entry.entry_id}</div>
                  <div className="mt-1 text-sm text-slate-500">
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
          ))}
        </div>
      </div>
    </div>
  );
}
