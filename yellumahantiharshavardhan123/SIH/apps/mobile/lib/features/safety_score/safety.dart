import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:maplibre_gl/mapbox_gl.dart';
import '../geofencing/geofencing.dart';

class SafetyScore { final int score; SafetyScore(this.score); }

final safetyScoreProvider = StateProvider<SafetyScore>((ref) => SafetyScore(100));

void updateSafetyScore(WidgetRef ref, {LatLng? p, double? speed}) {
  final geo = ref.read(geofencingProvider);
  final level = p != null ? ref.read(geofencingProvider.notifier).zoneAt(p) : null;
  final zonePenalty = level == 'restricted' ? -60 : level == 'high' ? -40 : level == 'medium' ? -20 : level == 'low' ? -10 : 0;
  final now = DateTime.now();
  final nightPenalty = (now.hour >= 19 || now.hour < 6) ? -10 : 0;
  final speedPenalty = (speed ?? 0) > 16.6667 ? -5 : 0;
  int score = (100 + zonePenalty + nightPenalty + speedPenalty).clamp(0,100);
  ref.read(safetyScoreProvider.notifier).state = SafetyScore(score);
}
