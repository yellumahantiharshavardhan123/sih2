class MapTilerConfig {
  static const key = String.fromEnvironment('MAPTILER_KEY', defaultValue: 'GgOZjiIxfo4NTtzvhpud');
  static const styleUrl = 'https://api.maptiler.com/maps/streets/style.json?key=' + key;
}
