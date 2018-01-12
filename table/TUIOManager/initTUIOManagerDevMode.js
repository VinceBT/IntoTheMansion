const exec = require('child_process').exec;

const puts = function (error, stdout, stderr) {
  if (error) {
    console.error(error);
  }
}

const isWin = /^win/.test(process.platform);

const sudo = isWin? '' : 'sudo ';

exec(sudo + 'npm link', puts);
