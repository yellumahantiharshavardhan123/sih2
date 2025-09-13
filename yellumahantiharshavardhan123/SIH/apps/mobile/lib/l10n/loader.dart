import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter/widgets.dart';

class AppLocalizations {
  final Locale locale;
  final Map<String, dynamic> _map;
  AppLocalizations(this.locale, this._map);
  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();
  static const supportedLocales = [Locale('en'), Locale('hi')];
  static Future<AppLocalizations> load(Locale locale) async {
    final data = await rootBundle.loadString('assets/i18n/${locale.languageCode}.json');
    return AppLocalizations(locale, jsonDecode(data));
  }
  String t(String key) {
    final parts = key.split('.');
    dynamic cur = _map;
    for (final p in parts) { if (cur is Map<String, dynamic>) cur = cur[p]; }
    return cur is String ? cur : key;
  }
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();
  @override
  bool isSupported(Locale locale) => ['en','hi'].contains(locale.languageCode);
  @override
  Future<AppLocalizations> load(Locale locale) => AppLocalizations.load(locale);
  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) => false;
}
