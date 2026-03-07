import Link from "next/link";

export default function UserPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">User Export Center</h1>
      <p className="mt-2 text-slate-600">
        Select your CipherPay transactions and export an audit bundle.
      </p>

      <div className="mt-6">
        <Link
          href="/user/activities"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Open Activities
        </Link>
      </div>
    </main>
  );
}
