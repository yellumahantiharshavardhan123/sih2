export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-slate-600">You are logged in. Use the navigation to access Map, Alerts, Tourists, and more.</p>
      <a href="/map" className="inline-flex items-center rounded-xl border px-3 py-2 text-brand hover:bg-slate-50">Go to Live Map →</a>
    </div>
  );
}
