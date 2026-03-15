"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BundleUploadCard } from "@/components/auditor/BundleUploadCard";

const PROGRESS_STEPS = [
  "Sending bundle to server…",
  "Verifying bundle signature…",
  "Running ZK proof verification (may take 10–30 s)…",
  "Checking on-chain nullifier records…",
  "Finalising result…",
];

export default function AuditorUploadPage() {
  const router = useRouter();
  const [bundle, setBundle] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    try {
      if (!bundle) {
        throw new Error("Please upload a bundle first");
      }

      setBusy(true);
      setError(null);

      // Cycle through progress steps while waiting for the server
      let stepIdx = 0;
      setStep(PROGRESS_STEPS[stepIdx]);
      console.log(`[VerifyBundle] ${PROGRESS_STEPS[stepIdx]}`);

      const stepTimer = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, PROGRESS_STEPS.length - 1);
        setStep(PROGRESS_STEPS[stepIdx]);
        console.log(`[VerifyBundle] ${PROGRESS_STEPS[stepIdx]}`);
      }, 4000);

      let response: Response;
      try {
        console.log("[VerifyBundle] POST /api/auditor/verify …");
        const t0 = Date.now();
        response = await fetch("/api/auditor/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bundle),
        });
        console.log(`[VerifyBundle] Response received in ${Date.now() - t0}ms — status=${response.status}`);
      } finally {
        clearInterval(stepTimer);
        setStep(null);
      }

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("[VerifyBundle] Error from server:", data.error);
        throw new Error(data.error ?? `Verification failed: ${response.status}`);
      }

      console.log("[VerifyBundle] Success — redirecting to /auditor/verify");
      sessionStorage.setItem("cipherpay_audit_result", JSON.stringify(data.result));
      router.push("/auditor/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown verification error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Upload Audit Bundle</h1>
      <p className="mt-2 text-slate-600">
        Upload a user-exported bundle and verify it.
      </p>

      <div className="mt-6 space-y-4">
        <BundleUploadCard onBundleLoaded={setBundle} />

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Run Verification</h2>
          <p className="mt-2 text-sm text-slate-600">
            This will validate structure, signature, and each disclosed entry.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={!bundle || busy}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  !bundle || busy
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {busy ? "Verifying…" : "Verify Bundle"}
              </button>
            </div>

            {busy && step && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg
                  className="h-4 w-4 animate-spin text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>{step}</span>
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
