import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/auth/auth_pages.dart';
import 'features/auth/profile_page.dart';
import 'features/map/map_page.dart';
import 'features/id/digital_id_page.dart';
import 'features/chatbot/chat_page.dart';
import 'features/emergency/efir_page.dart';
import 'features/settings/settings_page.dart';

final appRouter = GoRouter(
  initialLocation: '/auth',
  routes: [
    GoRoute(path: '/auth', builder: (c,s)=>const AuthPage()),
    GoRoute(path: '/profile', builder: (c,s)=>const ProfilePage()),
    GoRoute(path: '/map', builder: (c,s)=>const MapPage()),
    GoRoute(path: '/id', builder: (c,s)=>const DigitalIdPage()),
    GoRoute(path: '/chat', builder: (c,s)=>const ChatPage()),
    GoRoute(path: '/efir', builder: (c,s)=>const EFIRPage()),
    GoRoute(path: '/settings', builder: (c,s)=>const SettingsPage()),
  ],
);
