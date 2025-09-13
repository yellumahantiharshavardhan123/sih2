export type UUID = string;

export type RiskLevel = 'low' | 'medium' | 'high' | 'restricted';

export interface Profile {
  id: UUID;
  name: string | null;
  email: string | null;
  phone: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  trip_start: string | null;
  trip_end: string | null;
  languages: string[] | null;
  share_location_opt_in: boolean | null;
  created_at: string | null;
}

export interface Contact {
  id: UUID;
  user_id: UUID;
  name: string | null;
  phone: string | null;
  relationship: string | null;
  created_at: string | null;
}

export interface RiskZone {
  id: UUID;
  name: string | null;
  level: RiskLevel;
  geojson: any;
  created_at: string | null;
}

export interface TouristLocation {
  id: UUID;
  user_id: UUID;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  captured_at: string | null;
}

export interface GeofenceEvent {
  id: UUID;
  user_id: UUID;
  zone_id: UUID | null;
  event_type: 'enter' | 'exit';
  triggered_at: string | null;
}

export interface PanicAlert {
  id: UUID;
  user_id: UUID;
  status: 'active' | 'resolved';
  started_at: string | null;
  resolved_at: string | null;
  last_lat: number | null;
  last_lng: number | null;
  note: string | null;
}

export interface Incident {
  id: UUID;
  user_id: UUID;
  category: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
}

export interface FamilyLink {
  id: UUID;
  user_id: UUID;
  code: string | null;
  active: boolean | null;
  created_at: string | null;
}
