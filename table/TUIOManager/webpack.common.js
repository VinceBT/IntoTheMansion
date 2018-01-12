const path = require('path');
const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const combineLoaders = require('webpack-combine-loaders/combineLoaders');
/* eslint-enable import/no-extraneous-dependencies */

const includePaths = [
  fs.realpathSync(`${__dirname}/src`),
  fs.realpathSync(`${__dirname}/core`),
];

const resolvePaths = [
  fs.realpathSync(`${__dirname}/node_modules/`),
];

module.exports = () => (
  {
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: 'tuiomanager.js',
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
          include: includePaths,
          exclude: /node_modules/,
        },
        {
          test: /\.json$/,
          loader: 'json',
        },
      ],
    },
    plugins: [],
  }
);
