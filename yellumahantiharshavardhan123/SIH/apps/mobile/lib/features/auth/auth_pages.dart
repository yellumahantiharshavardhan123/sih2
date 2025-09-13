import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/supabase.dart';

final profileProvider = FutureProvider((ref) async {
  final user = sb.auth.currentUser;
  if (user == null) return null;
  final res = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return res.data;
});

class AuthPage extends ConsumerStatefulWidget {
  const AuthPage({super.key});
  @override
  ConsumerState<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends ConsumerState<AuthPage> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool isSignup = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(isSignup ? 'Sign up' : 'Sign in')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
          TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () async {
              if (isSignup) {
                final res = await sb.auth.signUp(email: email.text, password: password.text);
                await sb.from('profiles').upsert({ 'id': res.user?.id, 'email': email.text });
              } else {
                await sb.auth.signInWithPassword(email: email.text, password: password.text);
              }
              final prof = await sb.from('profiles').select('*').eq('id', sb.auth.currentUser?.id ?? '').single();
              if ((prof.data['name'] ?? '') == '') {
                if (mounted) context.go('/profile');
              } else {
                if (mounted) context.go('/map');
              }
            },
            child: Text(isSignup ? 'Sign up' : 'Sign in')
          ),
          TextButton(onPressed: ()=>setState(()=>isSignup=!isSignup), child: Text(isSignup? 'Have an account? Sign in':'No account? Sign up')),
        ]),
      ),
    );
  }
}
