const { withNativeWind } = require("nativewind/metro");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const path = require("path");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// ✅ Completely block react-native-svg from being loaded on web
if (process.argv.includes('--web')) {
  console.log("✅ Blocking react-native-svg for web");
  config.resolver.blockList = exclusionList([
    /node_modules\/react-native-svg\/.*/,
  ]);
}

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
  assert: require.resolve("assert"),
  buffer: require.resolve("buffer"),
  process: require.resolve("process/browser"),
  util: require.resolve("util"),
  "react-dom": path.resolve(__dirname, "emptyModule.js"),
  url: path.resolve(__dirname, "emptyModule.js"),
  axios: path.resolve(__dirname, "shims", "axios.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });