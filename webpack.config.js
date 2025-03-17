const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};
const PORT = parseInt(env.PORT || process.env.PORT || '3000', 10);

module.exports = {
  entry: './src/frontend/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.wasm'],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
      // Add special handling for WASM JS bindings
      {
        test: /vibelife_sim\.js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/frontend/index.html',
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: PORT,
    hot: true,
    allowedHosts: [env.APP_HOST || 'localhost'],
    host: '0.0.0.0',
    historyApiFallback: true,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: true,
      },
    },
    client: {
      overlay: true,
      progress: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    devMiddleware: {
      mimeTypes: { 
        'wasm': 'application/wasm'
      }
    },
  },
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  ignoreWarnings: [/Failed to parse source map/],
}; 