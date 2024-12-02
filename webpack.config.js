const path = require("path");
const glob = require("glob");

module.exports = {
  entry: glob.sync("./src/components/*.tsx").reduce((entries, file) => {
    const entry = path.basename(file, path.extname(file));
    entries[entry] = file;
    return entries;
  }, {}),
  output: {
    path: path.resolve(__dirname, "dist/components"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
  },
  mode: "production",
};
