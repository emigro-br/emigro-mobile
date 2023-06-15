var tsconfig = require('./tsconfig.json');
var rawAlias = tsconfig.compilerOptions.paths;
var alias = {};

for (let x in rawAlias) {
  alias[x.replace('/*', '')] = rawAlias[x].map((p) => p.replace('/*', ''));
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias,
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
    ],
  };
};
