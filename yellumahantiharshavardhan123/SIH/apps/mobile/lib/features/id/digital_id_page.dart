import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/supabase.dart';

class DigitalIdPage extends StatefulWidget {
  const DigitalIdPage({super.key});
  @override
  State<DigitalIdPage> createState() => _DigitalIdPageState();
}

class _DigitalIdPageState extends State<DigitalIdPage> {
  Map<String, dynamic>? p;
  @override
  void initState() {
    super.initState();
    () async {
      final user = sb.auth.currentUser;
      if (user != null) {
        final res = await sb.from('profiles').select('*').eq('id', user.id).single();
        setState(()=>p=res.data);
      }
    }();
  }

  @override
  Widget build(BuildContext context) {
    if (p == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final payload = {
      'name': p!['name'] ?? '',
      'id_proof_type': p!['id_proof_type'] ?? '',
      'id_proof_number': p!['id_proof_number'] ?? '',
      'emergency_contact_phone': p!['emergency_contact_phone'] ?? '',
      'trip_start': p!['trip_start'] ?? '',
      'trip_end': p!['trip_end'] ?? ''
    };
    final json = jsonEncode(payload);
    final hash = sha256.convert(utf8.encode(json)).toString();
    final display = hash.substring(0,10) + hash.substring(hash.length-2);
    return Scaffold(
      appBar: AppBar(title: const Text('Digital Tourist ID')),
      body: Center(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(p!['name'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              Text('${p!['id_proof_type']}: ${p!['id_proof_number']}'),
              Text('Emergency: ${p!['emergency_contact_phone']}'),
              Text('Trip: ${p!['trip_start']} → ${p!['trip_end']}'),
              const SizedBox(height: 8),
              Text('Hash: $display', style: const TextStyle(fontSize: 12)),
              const SizedBox(height: 8),
              QrImageView(data: json, size: 160),
            ]),
          ),
        ),
      ),
    );
  }
}
