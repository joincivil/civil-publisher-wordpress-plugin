const path = require( "path" );

module.exports = env => {
  return {
    mode: env.production ? "production" : "development",

    entry: {
      "post-panel": path.join(__dirname, "/assets/post-panel/index.tsx"),
      "newsroom-management": path.join(__dirname, "/assets/newsroom-management/index.tsx"),
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
      path: __dirname,
      filename: "build/[name].build.js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader",
          options: {
              configFileName: path.join(__dirname, "/tsconfig.json"),
          }
        },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader"
        }
      ],
    },
    externals: {
      // Reuse libraries exposed by Gutenberg:
      underscore: "_",
      moment: "moment",
      jquery: "jQuery",
      react: "React",
      "react-dom": "ReactDOM",
    },

    devtool: env.production ? undefined : "source-map",
    watch: env.watch,
    watchOptions: {
      // VMs don't support file watch so we can use polling instead
      poll: env.vm ? 250 : undefined,
    },
  };
};
