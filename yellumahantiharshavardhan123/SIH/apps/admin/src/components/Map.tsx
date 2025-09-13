'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MLMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '../lib/supabaseClient';
import type { PanicAlert } from '@tripsafe/shared';

const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_STYLE_URL || `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

export default function Map() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({ container: container.current, style: styleUrl as string, center: [77.216,28.613], zoom: 11 });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    map.on('load', async () => {
      const rz = await supabase.from('risk_zones').select('*');
      const features = (rz.data as any[] | null)?.map(z => ({ ...z.geojson, properties: { ...(z.geojson.properties||{}), level: z.level } })) || [];
      map.addSource('risk_zones', { type: 'geojson', data: { type: 'FeatureCollection', features } as any });
      map.addLayer({ id: 'risk-fill', type: 'fill', source: 'risk_zones', paint: {
        'fill-color': [
          'match',['get','level'],
          'low','#16a34a','medium','#f59e0b','high','#f97316','restricted','#ef4444','#888888'
        ],
        'fill-opacity': 0.2
      }});
      map.addLayer({ id: 'risk-outline', type: 'line', source: 'risk_zones', paint: { 'line-color': '#666', 'line-width': 1 } });

      map.addSource('tourist_locations', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      map.addLayer({ id: 'loc-heat', type: 'heatmap', source: 'tourist_locations', paint: {
        'heatmap-intensity': 1,
        'heatmap-radius': 30,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ]
      }});
      map.addLayer({ id: 'panic', type: 'circle', source: 'tourist_locations', paint: {
        'circle-radius': 6,
        'circle-color': '#ef4444',
        'circle-opacity': 0.8
      }, filter: ['==', ['get', 'isPanic'], true] });

      const { data } = await supabase.from('tourist_locations').select('*').limit(500).order('captured_at', { ascending: false });
      const features2 = (data as any[] | null)?.map(row => ({ type: 'Feature', properties: { isPanic: false }, geometry: { type: 'Point', coordinates: [row.lng, row.lat] } })) || [];
      (map.getSource('tourist_locations') as GeoJSONSource).setData({ type: 'FeatureCollection', features: features2 } as any);
    });

    return () => { map.remove(); };
  }, [container, supabase]);

  useEffect(() => {
    let ch1: ReturnType<typeof supabase.channel> | null = null;
    let ch2: ReturnType<typeof supabase.channel> | null = null;
    ch1 = supabase
      .channel('tourist_locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tourist_locations' }, payload => {
        const map = mapRef.current; if (!map) return;
        const src = map.getSource('tourist_locations') as GeoJSONSource;
        const data = src?._data as any;
        const features = data ? data.features : [];
        features.push({ type: 'Feature', properties: { isPanic: false }, geometry: { type: 'Point', coordinates: [payload.new.lng, payload.new.lat] } });
        src.setData({ type: 'FeatureCollection', features } as any);
      })
      .subscribe();

    ch2 = supabase
      .channel('panic_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'panic_alerts' }, payload => {
        setAlerts(prev => {
          const next = [...prev];
          const idx = next.findIndex(x => x.id === (payload.new as any).id);
          if (payload.eventType === 'INSERT') next.unshift(payload.new as any);
          if (payload.eventType === 'UPDATE' && idx >= 0) next[idx] = payload.new as any;
          return next;
        });
      })
      .subscribe();

    return () => { if (ch1) supabase.removeChannel(ch1); if (ch2) supabase.removeChannel(ch2); };
  }, [supabase]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const src = map.getSource('tourist_locations') as GeoJSONSource;
    const data = src?._data as any;
    const features = (data ? data.features : []).map((f: any) => f);
    alerts.forEach(a => {
      if (a.last_lat && a.last_lng) {
        features.push({ type: 'Feature', properties: { isPanic: true }, geometry: { type: 'Point', coordinates: [a.last_lng, a.last_lat] } });
      }
    });
    src?.setData({ type: 'FeatureCollection', features } as any);
  }, [alerts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Live Map</h1>
        <div className="flex gap-2">
          {alerts.filter(a => a.status==='active').map(a => (
            <span key={a.id} className="badge badge-red">{a.id.slice(0,6)}</span>
          ))}
        </div>
      </div>
      <div ref={container} className="w-full h-[70vh] rounded border" />
    </div>
  );
}
