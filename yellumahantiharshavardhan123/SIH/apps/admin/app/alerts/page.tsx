'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../src/lib/supabaseClient';
import type { PanicAlert } from '@tripsafe/shared';

export default function AlertsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);

  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null;
    supabase.from('panic_alerts').select('*').order('started_at', { ascending: false }).then(({ data }) => {
      if (data) setAlerts(data as any);
    });
    sub = supabase
      .channel('panic_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'panic_alerts' }, payload => {
        setAlerts(prev => {
          const next = [...prev];
          const idx = next.findIndex(a => a.id === (payload.new as any).id);
          if (payload.eventType === 'INSERT') next.unshift(payload.new as any);
          if (payload.eventType === 'UPDATE' && idx >= 0) next[idx] = payload.new as any;
          return next;
        });
      })
      .subscribe();
    return () => { if (sub) supabase.removeChannel(sub); };
  }, [supabase]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Active Alerts</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th>ID</th><th>User</th><th>Status</th><th>Started</th><th>Resolved</th></tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.id} className="border-b">
              <td className="py-2">{a.id.slice(0,8)}</td>
              <td>{a.user_id}</td>
              <td><span className={`badge ${a.status==='active'?'badge-red':'badge-green'}`}>{a.status}</span></td>
              <td>{a.started_at}</td>
              <td>{a.resolved_at || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
