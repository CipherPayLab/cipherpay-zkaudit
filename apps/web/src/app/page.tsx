export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">CipherPay ZK Audit</h1>
      <p className="mt-2 text-gray-600">
        User flows: <a href="/user" className="text-blue-600 underline">/user</a> ·{" "}
        <a href="/user/activities" className="text-blue-600 underline">/user/activities</a> ·{" "}
        <a href="/user/export" className="text-blue-600 underline">/user/export</a>
      </p>
      <p className="mt-2 text-gray-600">
        Auditor: <a href="/auditor" className="text-blue-600 underline">/auditor</a> ·{" "}
        <a href="/auditor/upload" className="text-blue-600 underline">/auditor/upload</a> ·{" "}
        <a href="/auditor/verify" className="text-blue-600 underline">/auditor/verify</a>
      </p>
    </main>
  );
}
