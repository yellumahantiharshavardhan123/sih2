'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../src/lib/supabaseClient';
import type { Profile, TouristLocation } from '@tripsafe/shared';
import { computeSafetyScore } from '@tripsafe/shared';

export default function TouristsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [lastLoc, setLastLoc] = useState<Record<string, TouristLocation | undefined>>({});

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => setProfiles((data as any) || []));
    supabase.from('tourist_locations').select('*').order('captured_at', { ascending: false }).then(({ data }) => {
      const rec: Record<string, TouristLocation> = {};
      (data as any[])?.forEach(t => { if (!rec[t.user_id]) rec[t.user_id] = t; });
      setLastLoc(rec);
    });
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Tourists</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th>Name</th><th>Email</th><th>Last Location</th><th>Score</th><th>ID</th></tr></thead>
        <tbody>
          {profiles.map(p => {
            const loc = lastLoc[p.id!];
            const score = computeSafetyScore({ zoneLevel: null, timestamp: loc?.captured_at || null, speedKmh: loc?.speed || null }).score;
            return (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td>{p.email}</td>
                <td>{loc ? `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}` : '-'}</td>
                <td><span className="badge badge-green">{score}</span></td>
                <td><a className="text-brand" href={`/id/${p.id}`}>View</a></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
