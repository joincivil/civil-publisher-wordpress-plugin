const path = require( "path" );

module.exports = env => {
  return {
    mode: env.production ? "production" : "development",

    entry: {
      "post-panel": path.join(__dirname, "/assets/post-panel/index.tsx"),
      "newsroom-management": path.join(__dirname, "/assets/newsroom-management/index.tsx"),
      "content-viewer": path.join(__dirname, "/assets/content-viewer/index.tsx"),
      "users-page": path.join(__dirname, "/assets/users-page.tsx"),
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      alias: {
        // Make Webpack always resolve styled-components to the version of module required by us, to resolve problem caused by linked @joincivil/components including its own copy of the module (https://www.styled-components.com/docs/faqs#why-am-i-getting-a-warning-about-several-instances-of-module-on-the-page):
        'styled-components': path.resolve(__dirname, 'node_modules', 'styled-components'),
      },
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
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: "[name].[ext]",
                publicPath: "/wp-content/plugins/civil-newsroom/images/",
                outputPath: 'images/'
              }
            }
          ]
        }
      ],
    },
    externals: {
      // Reuse libraries exposed by Gutenberg:
      lodash: "lodash",
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
