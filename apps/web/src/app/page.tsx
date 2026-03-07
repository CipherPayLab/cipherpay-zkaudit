import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold">CipherPay Audit Portal</h1>
      <p className="mt-3 text-slate-600">
        Choose a role to continue.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/user"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h2 className="text-xl font-medium">User Export</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select auditable transactions and export a signed audit bundle.
          </p>
        </Link>

        <Link
          href="/auditor"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h2 className="text-xl font-medium">Auditor Verification</h2>
          <p className="mt-2 text-sm text-slate-600">
            Upload an audit bundle and verify proofs, signatures, and receipts.
          </p>
        </Link>
      </div>
    </main>
  );
}
