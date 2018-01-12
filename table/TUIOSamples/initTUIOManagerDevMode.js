const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.join(__dirname, 'node_modules');
const tuiomanagerNodeModuleDir = path.join(nodeModulesDir, 'tuiomanager');
const tuiomanagerDevDir = path.join(__dirname, 'tuiomanager');

const isWin = /^win/.test(process.platform);
const sudo = isWin? '' : 'sudo ';

if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir);
}

const puts = function(error, stdout, stderr) {
    if (error) {
        console.error(error);
    }
};

exec(sudo + 'npm link tuiomanager', puts);

fs.symlinkSync(tuiomanagerNodeModuleDir, tuiomanagerDevDir, 'dir');
