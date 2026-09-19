const path = require("path");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "bundle.js",
      publicPath: "/build/",
      clean: true,
    },
    devtool: isProduction ? false : "eval-source-map",
    devServer: {
      static: {
        directory: __dirname,
      },
      port: 8080,
      open: true,
      hot: true,
    },
  };
};
