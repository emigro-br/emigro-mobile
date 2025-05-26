const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

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
  axios: path.resolve(__dirname, "shims", "axios.js"), // 👈 Force browser version
};

module.exports = withNativeWind(config, { input: "./global.css" });
