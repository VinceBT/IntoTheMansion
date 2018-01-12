/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const fse = require('fs-extra');
/* eslint-enable import/no-extraneous-dependencies */
const getConfig = require('./webpack.common.js');

const webpackConfig = getConfig();

const buildPath = webpackConfig.output.path;

if (buildPath !== __dirname) {
  fse.removeSync(buildPath);
}

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err) {
    console.error('Webpack compiler encountered a fatal error.', err);
    return;
  }

  console.info('Webpack compile completed.');
  console.log(stats.toString({
    chunks: false,
    colors: true,
  }));
  console.info(`Webpack Compiler : Compilation duration -> ${stats.endTime - stats.startTime} ms.`);
});
