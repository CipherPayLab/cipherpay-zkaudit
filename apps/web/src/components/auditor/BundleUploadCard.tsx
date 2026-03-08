"use client";

import { useRef, useState } from "react";

interface BundleUploadCardProps {
  onBundleLoaded: (bundle: unknown) => void;
}

export function BundleUploadCard({ onBundleLoaded }: BundleUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");

  async function handleFile(file: File) {
    try {
      setError(null);
      setFilename(file.name);
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      onBundleLoaded(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse bundle JSON");
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Upload Audit Bundle</h2>
      <p className="mt-2 text-sm text-slate-600">
        Choose a signed <span className="font-mono">cipherpay-audit-bundle.json</span> file.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Choose File
        </button>
        {filename ? <span className="self-center text-sm text-slate-600">{filename}</span> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
    </div>
  );
}
