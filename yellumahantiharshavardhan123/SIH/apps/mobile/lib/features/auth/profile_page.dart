import 'package:flutter/material.dart';
import '../../config/supabase.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final name = TextEditingController();
  final phone = TextEditingController();
  final idType = TextEditingController();
  final idNumber = TextEditingController();
  final emName = TextEditingController();
  final emPhone = TextEditingController();
  final start = TextEditingController();
  final end = TextEditingController();

  @override
  void initState() {
    super.initState();
    () async {
      final u = sb.auth.currentUser; if (u==null) return;
      final p = await sb.from('profiles').select('*').eq('id', u.id).single();
      name.text = p.data['name'] ?? '';
      phone.text = p.data['phone'] ?? '';
      idType.text = p.data['id_proof_type'] ?? '';
      idNumber.text = p.data['id_proof_number'] ?? '';
      emName.text = p.data['emergency_contact_name'] ?? '';
      emPhone.text = p.data['emergency_contact_phone'] ?? '';
      start.text = p.data['trip_start'] ?? '';
      end.text = p.data['trip_end'] ?? '';
    }();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Name')),
          TextField(controller: phone, decoration: const InputDecoration(labelText: 'Phone')),
          TextField(controller: idType, decoration: const InputDecoration(labelText: 'ID Type')),
          TextField(controller: idNumber, decoration: const InputDecoration(labelText: 'ID Number')),
          TextField(controller: emName, decoration: const InputDecoration(labelText: 'Emergency Contact Name')),
          TextField(controller: emPhone, decoration: const InputDecoration(labelText: 'Emergency Contact Phone')),
          TextField(controller: start, decoration: const InputDecoration(labelText: 'Trip Start (YYYY-MM-DD)')),
          TextField(controller: end, decoration: const InputDecoration(labelText: 'Trip End (YYYY-MM-DD)')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () async {
            await sb.from('profiles').update({
              'name': name.text,
              'phone': phone.text,
              'id_proof_type': idType.text,
              'id_proof_number': idNumber.text,
              'emergency_contact_name': emName.text,
              'emergency_contact_phone': emPhone.text,
              'trip_start': start.text,
              'trip_end': end.text
            }).eq('id', sb.auth.currentUser?.id ?? '');
            if (mounted) Navigator.pop(context);
          }, child: const Text('Save'))
        ])
      ),
    );
  }
}
