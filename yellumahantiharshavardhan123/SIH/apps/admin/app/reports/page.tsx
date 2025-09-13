'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../src/lib/supabaseClient';

export default function ReportsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: alerts } = await supabase.from('panic_alerts').select('*').gte('started_at', new Date(Date.now() - 7*24*3600e3).toISOString());
      const { data: locs } = await supabase.from('tourist_locations').select('*').gte('captured_at', new Date(Date.now() - 24*3600e3).toISOString());
      const byDay = new Map<string, number>();
      alerts?.forEach(a => { const d = a.started_at?.slice(0,10); byDay.set(d, (byDay.get(d) || 0) + 1); });
      setStats({
        alertsWeek: alerts?.length || 0,
        locationsDay: locs?.length || 0,
        timeline: Array.from(byDay.entries()).map(([d,c]) => ({ date: d, count: c }))
      });
    }
    load();
  }, [supabase]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded p-4"><div className="text-sm text-slate-500">Alerts (7d)</div><div className="text-2xl font-semibold">{stats.alertsWeek}</div></div>
          <div className="border rounded p-4"><div className="text-sm text-slate-500">Locations (24h)</div><div className="text-2xl font-semibold">{stats.locationsDay}</div></div>
          <div className="border rounded p-4 col-span-3">
            <div className="text-sm text-slate-500 mb-2">Alerts timeline</div>
            <div className="flex gap-2 items-end h-32">
              {stats.timeline.map((t: any) => (
                <div key={t.date} className="bg-brand/40 w-10" style={{ height: 8 + t.count * 20 }} title={`${t.date}: ${t.count}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
