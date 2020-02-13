const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = function(env, argv) {
  ////////////////////////////////////////////////////
  //  BACKEND CONFIGURATION

  backendConfig = {
    mode: 'development',

    entry: {
      main: './ts/index.ts'
    },

    target: 'web',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
    },

    devtool: 'source-map',

    externals: [
      nodeExternals(),
      nodeExternals({
        modulesDir: path.resolve(__dirname, 'path/to/root/node_modules'),
      }),
    ],
    
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          include: [
            __dirname,
            path.join(__dirname, '..', 'shared')
          ],
          exclude: [/node_modules/]
        },
        {
          test: /\.js$/,
          exclude: [/node_modules/]
        }
      ]
    },

    plugins: [new webpack.ProgressPlugin()],

    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            priority: -10,
            test: /[\\/]node_modules[\\/]/
          }
        },

        chunks: 'async',
        minChunks: 1,
        minSize: 30000,
        name: true
      }
    },
    resolve: {
      extensions: ['.js', '.ts'],
      modules: ['node_modules', '../node_modules']
    }
  };

  return [backendConfig];
};
