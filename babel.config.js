module.exports = function (api) {
  api.cache(true);
  const plugins = [
    // Required for expo-router - Removed as it's included in babel-preset-expo >= SDK 50
    // 'expo-router/babel',
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
