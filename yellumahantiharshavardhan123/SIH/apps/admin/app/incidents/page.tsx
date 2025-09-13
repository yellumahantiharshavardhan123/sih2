'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../src/lib/supabaseClient';
import type { Incident } from '@tripsafe/shared';

export default function IncidentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    supabase.from('incidents').select('*').order('created_at', { ascending: false }).then(({ data }) => setIncidents((data as any) || []));
  }, [supabase]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('incidents').update({ status }).eq('id', id);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Incidents</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th>ID</th><th>User</th><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {incidents.map(i => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.id.slice(0,8)}</td>
              <td>{i.user_id}</td>
              <td>{i.category}</td>
              <td className="max-w-[320px] truncate" title={i.description || ''}>{i.description}</td>
              <td>{i.status}</td>
              <td className="space-x-2">
                <button className="px-2 py-1 border rounded" onClick={() => updateStatus(i.id, 'reviewing')}>Reviewing</button>
                <button className="px-2 py-1 border rounded" onClick={() => updateStatus(i.id, 'resolved')}>Resolved</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
