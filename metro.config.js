const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 🛠️ Add this block to fake "react-dom"
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "react-dom": path.resolve(__dirname, "emptyModule.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });