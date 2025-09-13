insert into profiles (id, name, email, phone, id_proof_type, id_proof_number, emergency_contact_name, emergency_contact_phone, trip_start, trip_end, languages, share_location_opt_in)
values
  ('00000000-0000-4000-a000-000000000001','Aarav Kumar','aarav@example.com','+911100000001','Passport','P1234567','Neha Kumar','+911100000010','2025-09-01','2025-09-20','{"en","hi"}',true),
  ('00000000-0000-4000-a000-000000000002','Priya Singh','priya@example.com','+911100000002','Aadhar','1234-5678-9012','Raj Singh','+911100000011','2025-09-05','2025-09-25','{"en"}',false);

insert into contacts (user_id, name, phone, relationship)
values
  ('00000000-0000-4000-a000-000000000001','Neha Kumar','+911100000010','Spouse'),
  ('00000000-0000-4000-a000-000000000002','Raj Singh','+911100000011','Father');

with zones as (
  select * from (values
    ('Connaught Place','medium', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.210,28.633],[77.222,28.633],[77.222,28.620],[77.210,28.620],[77.210,28.633]]]}}'::jsonb),
    ('India Gate','low', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.225,28.617],[77.237,28.617],[77.237,28.606],[77.225,28.606],[77.225,28.617]]]}}'),
    ('Old Delhi','high', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.196,28.663],[77.209,28.663],[77.209,28.651],[77.196,28.651],[77.196,28.663]]]}}'),
    ('Karol Bagh','medium', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.180,28.657],[77.193,28.657],[77.193,28.646],[77.180,28.646],[77.180,28.657]]]}}'),
    ('IGI Airport','restricted', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.061,28.566],[77.093,28.566],[77.093,28.535],[77.061,28.535],[77.061,28.566]]]}}'),
    ('Hauz Khas','low', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.206,28.562],[77.223,28.562],[77.223,28.548],[77.206,28.548],[77.206,28.562]]]}}'),
    ('Saket','medium', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.200,28.516],[77.222,28.516],[77.222,28.500],[77.200,28.500],[77.200,28.516]]]}}'),
    ('Noida Sec 18','high', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.321,28.573],[77.338,28.573],[77.338,28.560],[77.321,28.560],[77.321,28.573]]]}}'),
    ('Gurugram Cyberhub','medium', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.078,28.493],[77.099,28.493],[77.099,28.480],[77.078,28.480],[77.078,28.493]]]}}'),
    ('Yamuna Bank','high', '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.279,28.616],[77.294,28.616],[77.294,28.603],[77.279,28.603],[77.279,28.616]]]}}')
  ) as t(name, level, geojson)
)
insert into risk_zones (name, level, geojson)
select name, level::risk_level, geojson from zones;

insert into incidents (user_id, category, description, status)
values
  ('00000000-0000-4000-a000-000000000001','Theft','Reported pickpocketing near CP','submitted'),
  ('00000000-0000-4000-a000-000000000002','Lost item','Lost wallet near metro','reviewing');

insert into geofence_events (user_id, zone_id, event_type)
select '00000000-0000-4000-a000-000000000001', rz.id, 'enter' from risk_zones rz where rz.name='Connaught Place';

insert into geofence_events (user_id, zone_id, event_type)
select '00000000-0000-4000-a000-000000000001', rz.id, 'exit' from risk_zones rz where rz.name='Connaught Place';
