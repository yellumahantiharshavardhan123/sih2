'use client';
import { useEffect, useMemo, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '../../../src/lib/supabaseClient';

const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_STYLE_URL || `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

export default function FamilyPage({ params }: { params: { code: string } }) {
  const supabase = useMemo(() => createClient(), []);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  useEffect(() => {
    async function init() {
      if (!ref.current) return;
      const map = new maplibregl.Map({ container: ref.current, style: styleUrl as string, center: [77.216, 28.613], zoom: 12 });
      mapRef.current = map;
      const { data: fl } = await supabase.from('family_links').select('*').eq('code', params.code).eq('active', true).single();
      if (!fl) return;
      const { data: locs } = await supabase.from('tourist_locations').select('*').eq('user_id', fl.user_id).order('captured_at', { ascending: false }).limit(1);
      if (locs && locs[0]) {
        map.setCenter([locs[0].lng, locs[0].lat]);
        new maplibregl.Marker().setLngLat([locs[0].lng, locs[0].lat]).addTo(map);
      }
      const ch = supabase
        .channel('family_live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tourist_locations', filter: `user_id=eq.${fl.user_id}` }, payload => {
          map.setCenter([payload.new.lng, payload.new.lat]);
          new maplibregl.Marker().setLngLat([payload.new.lng, payload.new.lat]).addTo(map);
        })
        .subscribe();
      return () => { supabase.removeChannel(ch); map.remove(); };
    }
    init();
  }, [supabase, params.code]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Family View</h1>
      <div ref={ref} className="w-full h-[70vh] rounded border" />
    </div>
  );
}
