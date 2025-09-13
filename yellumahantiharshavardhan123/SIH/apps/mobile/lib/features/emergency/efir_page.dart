import 'package:flutter/material.dart';
import '../../config/supabase.dart';

class EFIRPage extends StatefulWidget {
  const EFIRPage({super.key});
  @override
  State<EFIRPage> createState() => _EFIRPageState();
}

class _EFIRPageState extends State<EFIRPage> {
  final category = TextEditingController();
  final description = TextEditingController();
  String? refId;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('e-FIR')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextField(controller: category, decoration: const InputDecoration(labelText: 'Category')),
          TextField(controller: description, decoration: const InputDecoration(labelText: 'Description')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () async {
            final res = await sb.from('incidents').insert({ 'user_id': sb.auth.currentUser?.id, 'category': category.text, 'description': description.text }).select().single();
            setState(()=>refId = res.data['id']);
          }, child: const Text('Submit')),
          if (refId != null) Padding(padding: const EdgeInsets.only(top:16), child: Text('Submitted: $refId')),
          const SizedBox(height: 12),
          const Text('Simulated: Alerts sent to police and contacts')
        ]),
      ),
    );
  }
}
