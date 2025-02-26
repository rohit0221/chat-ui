const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    process: require.resolve("process/browser.js"),
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),  // Added fallback for stream
    vm: require.resolve("vm-browserify"),            // Added fallback for vm
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    })
  );

  return config;
};
