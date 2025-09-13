create type risk_level as enum ('low','medium','high','restricted');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  id_proof_type text,
  id_proof_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  trip_start date,
  trip_end date,
  languages text[] default '{"en"}',
  share_location_opt_in boolean default false,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text,
  phone text,
  relationship text,
  created_at timestamptz default now()
);

create table if not exists risk_zones (
  id uuid primary key default gen_random_uuid(),
  name text,
  level risk_level not null,
  geojson jsonb not null,
  created_at timestamptz default now()
);

create table if not exists tourist_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lat double precision,
  lng double precision,
  accuracy double precision,
  speed double precision,
  heading double precision,
  captured_at timestamptz default now()
);

create table if not exists geofence_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  zone_id uuid references risk_zones(id) on delete set null,
  event_type text not null check (event_type in ('enter','exit')),
  triggered_at timestamptz default now()
);

create table if not exists panic_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  status text not null check (status in ('active','resolved')) default 'active',
  started_at timestamptz default now(),
  resolved_at timestamptz,
  last_lat double precision,
  last_lng double precision,
  note text
);

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text,
  description text,
  status text default 'submitted',
  created_at timestamptz default now()
);

create table if not exists family_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  code text unique,
  active boolean default true,
  created_at timestamptz default now()
);

alter publication supabase_realtime add table tourist_locations;
alter publication supabase_realtime add table panic_alerts;
alter publication supabase_realtime add table geofence_events;
