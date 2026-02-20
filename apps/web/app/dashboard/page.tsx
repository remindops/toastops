'use client';

export default function DashboardPage() {
  // Mocking the Telemetry logic explicitly since this is an MVP scaffold visualization
  const telemetry = {
    totalImpressions: 12405,
    clickThroughRate: 14.2,
    activeVariant: 'Variant B (Neon Blue)',
    topPerformers: [
      { name: 'Variant B (Neon Blue)', ctr: 16.5, conversions: 840 },
      { name: 'Variant A (Clean Slate)', ctr: 11.2, conversions: 312 },
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
        <p className="text-neutral-400">Analyze explicit interaction events across all distributed Toast variants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-1">Total Impressions</h3>
          <p className="text-4xl font-bold text-white tracking-tight">{telemetry.totalImpressions.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-1">Avg. Click-Through Rate</h3>
          <p className="text-4xl font-bold text-indigo-400 tracking-tight">{telemetry.clickThroughRate}%</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl border-t-4 border-t-emerald-500">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-1">Active Optimized Variant</h3>
          <p className="text-xl font-bold text-white tracking-tight mt-2">{telemetry.activeVariant}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">A/B Theme Performance Matrix</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-semibold">Theme Variant Name</th>
              <th className="px-6 py-4 font-semibold">Click-Through Rate</th>
              <th className="px-6 py-4 font-semibold">Total Conversions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {telemetry.topPerformers.map((t, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-5 font-medium text-white">{t.name}</td>
                <td className="px-6 py-5 font-medium text-indigo-400">{t.ctr}%</td>
                <td className="px-6 py-5 text-neutral-300">{t.conversions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
