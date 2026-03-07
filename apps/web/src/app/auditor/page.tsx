import Link from "next/link";

export default function AuditorPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Auditor Verification</h1>
      <p className="mt-2 text-slate-600">
        Upload a CipherPay audit bundle and verify it.
      </p>

      <div className="mt-6">
        <Link
          href="/auditor/upload"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Upload Bundle
        </Link>
      </div>
    </main>
  );
}
