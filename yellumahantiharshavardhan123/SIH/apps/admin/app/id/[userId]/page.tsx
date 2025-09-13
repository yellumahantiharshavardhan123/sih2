import { createServiceClient } from '../../../src/lib/supabaseClient';
import crypto from 'crypto';

function stablePayload(p: any) {
  const obj = {
    name: p.name || '',
    id_proof_type: p.id_proof_type || '',
    id_proof_number: p.id_proof_number || '',
    emergency_contact_phone: p.emergency_contact_phone || '',
    trip_start: p.trip_start || '',
    trip_end: p.trip_end || ''
  };
  const json = JSON.stringify(obj);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  const short = hash.slice(0,10);
  const checksum = hash.slice(-2);
  return { json, hash, display: `${short}${checksum}` };
}

export default async function Page({ params }: { params: { userId: string } }) {
  const supabase = createServiceClient();
  const { data: p } = await supabase.from('profiles').select('*').eq('id', params.userId).single();
  const payload = p ? stablePayload(p) : null;
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">Digital Tourist ID</h1>
      {p && payload && (
        <div className="border rounded p-4 space-y-2">
          <div className="text-lg font-semibold">{p.name}</div>
          <div className="text-sm">{p.id_proof_type}: {p.id_proof_number}</div>
          <div className="text-sm">Emergency: {p.emergency_contact_phone}</div>
          <div className="text-sm">Trip: {p.trip_start} → {p.trip_end}</div>
          <div className="text-sm">Hash: {payload.display}</div>
          <div className="text-xs break-all">QR: {payload.json}</div>
        </div>
      )}
    </div>
  );
}
