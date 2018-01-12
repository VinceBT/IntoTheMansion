const path = require('path');
const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const combineLoaders = require('webpack-combine-loaders/combineLoaders');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/* eslint-enable import/no-extraneous-dependencies */

const includePaths = [
  fs.realpathSync(`${__dirname}/src`),
  fs.realpathSync(`${__dirname}/node_modules/tuiomanager/`),
];

const resolvePaths = [
  fs.realpathSync(`${__dirname}/node_modules/`),
];

const htmlWebpackPluginInstance = new HtmlWebpackPlugin({
  template: './index.ejs',
  filename: './index.html',
  showErrors: true,
});
const copyWebpackPluginInstance = new CopyWebpackPlugin(
  [
    { from: './assets', to: './assets' },
  ],
  {
    copyUnmodified: false,
    debug: 'debug',
  }
);

module.exports = () => (
  {
    devServer: {
      inline: true,
      historyApiFallback: true,
      port: 3000,
    },
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: 'index.js',
    },
    resolve: {
      extensions: ['', '.js'],
      root: resolvePaths,
      fallback: resolvePaths,
    },
    resolveLoader: {
      root: resolvePaths,
      fallback: resolvePaths,
    },
    eslint: {
      configFile: './.eslintrc',
    },
    module: {
      loaders: [
        {
          test: /\.js?$/,
          loader: combineLoaders([
            {
              loader: 'babel-loader',
              query: {
                babelrc: false,
                presets: [
                  'es2015',
                ].map(dep => require.resolve(`babel-preset-${dep}`)),
                plugins: [
                  'transform-object-rest-spread',
                ].map(dep => require.resolve(`babel-plugin-${dep}`)),
              },
            },
            {
              loader: 'eslint-loader',
            },
          ]),
          include: includePaths
        },
        {
          test: /\.json$/,
          loader: 'json',
        },
      ],
    },
    plugins: [
      htmlWebpackPluginInstance,
      copyWebpackPluginInstance
    ]
  }
);
