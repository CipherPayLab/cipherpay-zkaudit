"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BundleUploadCard } from "@/components/auditor/BundleUploadCard";

export default function AuditorUploadPage() {
  const router = useRouter();
  const [bundle, setBundle] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    try {
      if (!bundle) {
        throw new Error("Please upload a bundle first");
      }

      setBusy(true);
      setError(null);

      const response = await fetch("/api/auditor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bundle)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `Verification failed: ${response.status}`);
      }

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

          <div className="mt-4">
            <button
              type="button"
              onClick={handleVerify}
              disabled={!bundle || busy}
              className={`rounded-lg px-4 py-2 text-sm text-white ${
                !bundle || busy
                  ? "bg-slate-300"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Verify Bundle
            </button>
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
