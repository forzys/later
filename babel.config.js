module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
          '@': ['./src']
        }
      }
    ],
    ['react-native-worklets-core/plugin'],
    'react-native-reanimated/plugin'
  ], 
};
