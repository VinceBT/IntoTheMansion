/**
 * IntoTheMansion Restify backend
 */

import status from '../assets/status.json';
import protocol from '../assets/protocol.json';

const io = require('socket.io')();

io.on('connection', (client) => {
  console.log(`New connection from ${client.handshake.address}`);

  client.on(protocol.HI, (callback) => {
    callback();
  });

  client.on(protocol.TEST, (x, y, z, callback) => {
    console.log('TEST');
    console.log(`${x},${y},${z}`);
    console.log(callback);
    callback('ok test');
  });

  client.on(protocol.PLAYER_POSITION_UPDATE, (content, callback) => {
    console.log('PLAYER POSITION');
    console.log(content);
    console.log(callback);
    callback('ok position');
  });
});

io.listen(status.port);
console.log(`${status.name} server listening at ${status.devRemote}:${status.port}`);
