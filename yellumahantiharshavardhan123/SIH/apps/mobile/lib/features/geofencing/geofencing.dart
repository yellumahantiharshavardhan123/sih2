import 'dart:async';
import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:maplibre_gl/mapbox_gl.dart';
import '../../config/supabase.dart';
import '../safety_score/safety.dart';

class RiskZone {
  final String id;
  final String name;
  final String level;
  final List<List<LatLng>> polygons;
  RiskZone(this.id,this.name,this.level,this.polygons);
}

class GeofencingState {
  final List<RiskZone> zones;
  final LatLng? current;
  GeofencingState({this.zones=const [], this.current});
  GeofencingState copyWith({List<RiskZone>? zones, LatLng? current}) => GeofencingState(zones: zones ?? this.zones, current: current ?? this.current);
}

class GeofencingNotifier extends StateNotifier<GeofencingState> {
  MapboxMapController? _map;
  Timer? _sim;
  GeofencingNotifier():super(GeofencingState());

  Future<void> attachMap(MapboxMapController c) async {
    _map = c;
    await _drawZones();
  }

  Future<void> loadRiskZones() async {
    final res = await sb.from('risk_zones').select('*');
    final zones = (res.data as List<dynamic>? ?? []).map((z){
      final gj = z['geojson'];
      final coords = gj['geometry']['type'] == 'Polygon' ? [gj['geometry']['coordinates']] : gj['geometry']['coordinates'];
      final polys = (coords as List).map<List<LatLng>>((p){
        final ring = (p as List).first as List;
        return ring.map<LatLng>((c) => LatLng((c as List)[1].toDouble(), c[0].toDouble())).toList();
      }).toList();
      return RiskZone(z['id'], z['name'], z['level'], polys);
    }).toList();
    state = state.copyWith(zones: zones);
    await _drawZones();
  }

  Future<void> _drawZones() async {
    final map = _map; if (map == null) return;
    for (final z in state.zones) {
      final id = 'zone-${z.id}';
      await map.addFill(id, FillOptions(
        geometry: z.polygons,
        fillColor: z.level=='restricted'? '#ef4444' : z.level=='high' ? '#f97316' : z.level=='medium' ? '#f59e0b' : '#16a34a',
        fillOpacity: 0.2,
      ));
    }
  }

  bool _pointInPolygon(LatLng p, List<LatLng> polygon) {
    bool inside = false;
    for (int i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      final xi = polygon[i].longitude, yi = polygon[i].latitude;
      final xj = polygon[j].longitude, yj = polygon[j].latitude;
      final intersect = ((yi > p.latitude) != (yj > p.latitude)) &&
          (p.longitude < (xj - xi) * (p.latitude - yi) / (yj - yi + 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  String? zoneAt(LatLng p) {
    for (final z in state.zones) {
      for (final poly in z.polygons) {
        if (_pointInPolygon(p, poly)) return z.level;
      }
    }
    return null;
  }

  Future<void> teleportTo(String targetLevel) async {
    final zone = state.zones.firstWhere((z) => z.level == targetLevel, orElse: () => state.zones.first);
    final poly = zone.polygons.first;
    double lat = 0, lng = 0; int n = 0;
    for (final p in poly) { lat += p.latitude; lng += p.longitude; n++; }
    final center = LatLng(lat/n, lng/n);
    state = state.copyWith(current: center);
    await sb.from('geofence_events').insert({ 'user_id': sb.auth.currentUser?.id, 'zone_id': zone.id, 'event_type': 'enter' });
  }
}

final geofencingProvider = StateNotifierProvider<GeofencingNotifier, GeofencingState>((ref) => GeofencingNotifier());
