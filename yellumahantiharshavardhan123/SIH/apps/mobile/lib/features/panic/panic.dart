import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../../config/supabase.dart';

class PanicState { final bool active; PanicState(this.active); }

class PanicNotifier extends StateNotifier<PanicState> {
  Timer? _timer;
  PanicNotifier():super(PanicState(false));

  Future<void> toggle() async {
    if (state.active) {
      state = PanicState(false);
      await sb.from('panic_alerts').update({'status':'resolved','resolved_at': DateTime.now().toIso8601String()}).eq('user_id', sb.auth.currentUser?.id ?? '');
      _timer?.cancel();
    } else {
      state = PanicState(true);
      await sb.from('panic_alerts').insert({'user_id': sb.auth.currentUser?.id, 'status':'active'});
      _timer = Timer.periodic(const Duration(seconds: 10), (_) async {
        final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        await sb.from('tourist_locations').insert({
          'user_id': sb.auth.currentUser?.id,
          'lat': pos.latitude,
          'lng': pos.longitude,
          'accuracy': pos.accuracy,
          'speed': pos.speed,
          'heading': pos.heading
        });
        await sb.from('panic_alerts').update({'last_lat': pos.latitude, 'last_lng': pos.longitude}).eq('user_id', sb.auth.currentUser?.id ?? '');
      });
    }
  }
}

final panicProvider = StateNotifierProvider<PanicNotifier, PanicState>((ref)=>PanicNotifier());
