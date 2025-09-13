import 'package:supabase_flutter/supabase_flutter.dart';

class SupaConfig {
  static const url = String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://hiotrcucswvhwukbbywc.supabase.co');
  static const anonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3RyY3Vjc3d2aHd1a2JieXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODcxMjYsImV4cCI6MjA3MzI2MzEyNn0.L2DyQlHbwHfTw0KYLS9zDnfmvhYLxM3vRRRhJUJDN1I');
}

Future<void> initSupabase() async {
  await Supabase.initialize(url: SupaConfig.url, anonKey: SupaConfig.anonKey);
}

SupabaseClient get sb => Supabase.instance.client;
