const BASE_URL = 'https://hiotrcucswvhwukbbywc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3RyY3Vjc3d2aHd1a2JieXdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4NzEyNiwiZXhwIjoyMDczMjYzMTI2fQ.yGFa0yI7ci-lvhWOLb7hxTuAdwKRIQOlrT70kvKDZXE';

async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

function centerOfFeature(feature) {
  try {
    const geom = feature.geometry;
    if (!geom) return [77.216, 28.613];
    if (geom.type === 'Polygon') {
      const ring = geom.coordinates[0];
      let sx=0, sy=0; for (const [x,y] of ring) { sx+=x; sy+=y; }
      return [sx/ring.length, sy/ring.length];
    }
    if (geom.type === 'MultiPolygon') {
      const ring = geom.coordinates[0][0];
      let sx=0, sy=0; for (const [x,y] of ring) { sx+=x; sy+=y; }
      return [sx/ring.length, sy/ring.length];
    }
  } catch {}
  return [77.216, 28.613];
}

async function ensureContacts(userId) {
  const existing = await api(`/rest/v1/contacts?user_id=eq.${userId}&select=id&limit=1`);
  if (existing.length) return false;
  await api('/rest/v1/contacts', {
    method: 'POST',
    body: { user_id: userId, name: 'Demo Contact', phone: '+911100000099', relationship: 'Friend' }
  });
  return true;
}

async function ensureFamilyLink(userId) {
  const existing = await api(`/rest/v1/family_links?user_id=eq.${userId}&select=code,active&limit=1`);
  if (existing.length) return existing[0];
  const code = 'DEMO' + Math.random().toString(36).slice(2,7).toUpperCase();
  const created = await api('/rest/v1/family_links', {
    method: 'POST',
    body: { user_id: userId, code, active: true }
  });
  return created[0] || { code, active: true };
}

async function insertTouristLocations(userId, coords) {
  const now = Date.now();
  const rows = [0,1,2].map(i => ({
    user_id: userId,
    lat: coords[1] + (Math.random()-0.5)*0.002,
    lng: coords[0] + (Math.random()-0.5)*0.002,
    accuracy: 10 + Math.random()*5,
    speed: Math.random()*3,
    heading: Math.random()*360,
    captured_at: new Date(now - i*60_000).toISOString()
  }));
  await api('/rest/v1/tourist_locations', { method: 'POST', body: rows });
  return rows.length;
}

async function main() {
  const rz = await api('/rest/v1/risk_zones?select=id,name,level,geojson');
  const features = rz.map(z => z.geojson);
  const center = features.length ? centerOfFeature(features[0]) : [77.216, 28.613];

  const profiles = await api('/rest/v1/profiles?select=id,name,email&order=created_at.desc');
  if (!profiles.length) {
    console.log('No profiles found. Seed may not be applied. Aborting.');
    return;
  }
  const target = profiles.slice(0, 2);

  let contactAdds = 0, locAdds = 0, fam = [];
  for (const p of target) {
    if (await ensureContacts(p.id)) contactAdds++;
    const f = await ensureFamilyLink(p.id); fam.push({ user_id: p.id, ...f });
    locAdds += await insertTouristLocations(p.id, center);
  }

  const counts = {
    risk_zones: rz.length,
    profiles: profiles.length,
    contacts: (await api('/rest/v1/contacts?select=id')).length,
    family_links: (await api('/rest/v1/family_links?select=id')).length,
    tourist_locations: (await api('/rest/v1/tourist_locations?select=id')).length,
    incidents: (await api('/rest/v1/incidents?select=id')).length,
    geofence_events: (await api('/rest/v1/geofence_events?select=id')).length
  };

  console.log(JSON.stringify({
    action: 'populate-demo',
    inserted: { contacts: contactAdds, tourist_locations: locAdds },
    family_links: fam,
    counts
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
