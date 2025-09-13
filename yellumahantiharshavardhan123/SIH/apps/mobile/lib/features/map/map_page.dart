import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:maplibre_gl/mapbox_gl.dart';
import '../../config/maptiler.dart';
import '../panic/panic.dart';
import '../geofencing/geofencing.dart';
import '../safety_score/safety.dart';

class MapPage extends ConsumerStatefulWidget {
  const MapPage({super.key});
  @override
  ConsumerState<MapPage> createState() => _MapPageState();
}

class _MapPageState extends ConsumerState<MapPage> {
  final mapController = Completer<MapboxMapController>();
  @override
  void initState() {
    super.initState();
    ref.read(geofencingProvider.notifier).loadRiskZones();
  }
  @override
  Widget build(BuildContext context) {
    final panic = ref.watch(panicProvider);
    final score = ref.watch(safetyScoreProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('TripSafe')),
      body: Stack(children: [
        MapboxMap(
          styleString: MapTilerConfig.styleUrl,
          initialCameraPosition: const CameraPosition(target: LatLng(28.613,77.216), zoom: 12),
          onMapCreated: (c) async {
            mapController.complete(c);
            await ref.read(geofencingProvider.notifier).attachMap(c);
          },
          myLocationEnabled: true,
          myLocationTrackingMode: MyLocationTrackingMode.Tracking,
        ),
        Positioned(
          right: 16, top: 16,
          child: Card(child: Padding(padding: const EdgeInsets.all(8), child: Text('Score ${score.score}', style: const TextStyle(fontSize: 16))))
        ),
        Positioned(
          left: 16, bottom: 16,
          child: Row(children: [
            ElevatedButton(onPressed: () async {
              await ref.read(geofencingProvider.notifier).teleportTo('restricted');
              final current = ref.read(geofencingProvider).current;
              if (current != null) updateSafetyScore(ref, p: current, speed: 0);
            }, child: const Text('Teleport Restricted')),
            const SizedBox(width: 8),
            ElevatedButton(onPressed: () async {
              await ref.read(geofencingProvider.notifier).teleportTo('medium');
              final current = ref.read(geofencingProvider).current;
              if (current != null) updateSafetyScore(ref, p: current, speed: 0);
            }, child: const Text('Teleport Medium')),
          ])
        )
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => ref.read(panicProvider.notifier).toggle(),
        backgroundColor: panic.active ? Colors.red : Theme.of(context).colorScheme.primary,
        label: Text(panic.active?'Resolve':'Panic'),
        icon: const Icon(Icons.emergency_share),
      ),
    );
  }
}
