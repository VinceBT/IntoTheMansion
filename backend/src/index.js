/**
 * IntoTheMansion Restify backend
 */

import status from '../assets/status.json';
import protocol from '../assets/protocol.json';
import mansionSample from '../assets/mansion_sample.json';

const io = require('socket.io')();

const tablets = new Set();
const tables = new Set();
const vrs = new Set();

// https://www.npmjs.com/package/dungeon-generator

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.handshake.address}`);

  // HI
  socket.on(protocol.HI, (callback) => {
    console.log(`Received verb ${protocol.HI}`);
    callback();
  });

  // TEST
  socket.on(protocol.TEST, (...args) => {
    console.log(`Received verb ${protocol.TEST}`);
    console.log(args);
  });

  // REGISTER
  socket.on(protocol.REGISTER, (type) => {
    console.log(`Received verb ${protocol.REGISTER} with type ${type}`);
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    if (type === 'TABLET')
      tablets.add(socket);
    else if (type === 'TABLE')
      tables.add(socket);
    else if (type === 'VR')
      vrs.add(socket);
    else console.error(`Received incorrect type ${type}`);
  });

  // GET_MAP
  socket.on(protocol.GET_MAP, (callback) => {
    console.log(`Received verb ${protocol.GET_MAP}`);
    callback(mansionSample);
  });

  // PLAYER_POSITION_UPDATE
  socket.on(protocol.PLAYER_POSITION_UPDATE, (position) => {
    console.log(`Received verb ${protocol.PLAYER_POSITION_UPDATE}`);
    Array.from(tables.values()).forEach(table => {
      table.emit(protocol.PLAYER_POSITION_UPDATE, position);
    });
  });

  // DISCONNECTION
  socket.once('disconnect', () => {
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    console.log(`Disconnection from ${socket.handshake.address}`);
  });
});

io.listen(status.port);
console.log(`${status.name} server listening at ${status.devRemote}:${status.port}`);
