alter table profiles enable row level security;
alter table contacts enable row level security;
alter table risk_zones enable row level security;
alter table tourist_locations enable row level security;
alter table geofence_events enable row level security;
alter table panic_alerts enable row level security;
alter table incidents enable row level security;
alter table family_links enable row level security;

create policy "profiles read own" on profiles for select using (id = auth.uid());
create policy "profiles update own" on profiles for update using (id = auth.uid());

create policy "risk_zones anon read" on risk_zones for select using (true);

create policy "contacts owner" on contacts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tourist_locations insert own" on tourist_locations for insert with check (user_id = auth.uid());
create policy "tourist_locations select own" on tourist_locations for select using (user_id = auth.uid());

create policy "geofence_events owner" on geofence_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "panic_alerts insert own" on panic_alerts for insert with check (user_id = auth.uid());
create policy "panic_alerts update own" on panic_alerts for update using (user_id = auth.uid());
create policy "panic_alerts select own" on panic_alerts for select using (user_id = auth.uid());

create policy "incidents owner" on incidents for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "family_links owner" on family_links for all using (user_id = auth.uid()) with check (user_id = auth.uid());
