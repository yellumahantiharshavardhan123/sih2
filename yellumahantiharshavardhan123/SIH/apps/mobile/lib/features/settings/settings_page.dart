import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/supabase.dart';
import '../../main.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});
  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  bool share = false;
  String? code;
  String lang = 'en';
  @override
  void initState() {
    super.initState();
    () async {
      final u = sb.auth.currentUser; if (u==null) return;
      final p = await sb.from('profiles').select('*').eq('id', u.id).single();
      setState(()=>share = (p.data['share_location_opt_in'] ?? false) as bool);
      final fl = await sb.from('family_links').select('*').eq('user_id', u.id).maybeSingle();
      if (fl.data != null) setState(()=>code = fl.data['code']);
    }();
  }
  @override
  Widget build(BuildContext context) {
    final url = code != null ? '/family/$code' : '';
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Text('Language'), const SizedBox(width: 12),
            DropdownButton<String>(value: lang, items: const [DropdownMenuItem(value:'en',child:Text('English')), DropdownMenuItem(value:'hi',child:Text('Hindi'))], onChanged: (v) { if (v!=null) { setState(()=>lang=v); ref.read(localeProvider.notifier).state = Locale(v); } })
          ]),
          const SizedBox(height: 12),
          SwitchListTile(value: share, title: const Text('Share location with family'), onChanged: (v) async {
            setState(()=>share=v);
            await sb.from('profiles').update({'share_location_opt_in': v}).eq('id', sb.auth.currentUser?.id ?? '');
          }),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () async {
            final u = sb.auth.currentUser!;
            code ??= _randomCode();
            await sb.from('family_links').upsert({'user_id': u.id, 'code': code, 'active': true}).select();
            setState((){});
          }, child: const Text('Generate family link')),
          if (code != null) Padding(padding: const EdgeInsets.only(top:8), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            SelectableText('Code: $code'),
            const SizedBox(height: 8),
            QrImageView(data: url, size: 120),
          ])),
        ]),
      ),
    );
  }

  String _randomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final r = Random();
    return List.generate(8, (_) => chars[r.nextInt(chars.length)]).join();
  }
}
