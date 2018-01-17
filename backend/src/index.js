/**
 * IntoTheMansion Restify backend
 */

import status from '../assets/status.json';
import mansionSample from '../assets/mansion_sample.json';
import Mansion from './Mansion';
import Protocol from './Protocol';

const io = require('socket.io')();

const tablets = new Set();
const tables = new Set();
const vrs = new Set();

const mansion = new Mansion();

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.handshake.address}`);

  // HI
  socket.on(Protocol.HI, (callback) => {
    console.log(`Received verb ${Protocol.HI}`);
    callback();
  });

  // TEST
  socket.on(Protocol.TEST, (...args) => {
    console.log(`Received verb ${Protocol.TEST}`);
    console.log(args);
  });

  // REGISTER
  socket.on(Protocol.REGISTER, (type) => {
    console.log(`Received verb ${Protocol.REGISTER} with type ${JSON.stringify(type)}`);
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    if (type === 'TABLET')
      tablets.add(socket);
    else if (type === 'TABLE')
      tables.add(socket);
    else if (type.type === 'VR')
      vrs.add(socket);
    else console.error(`Received incorrect type ${type}`);
  });

  // GET_MAP_DEBUG
  socket.on(Protocol.GET_MAP_DEBUG, (callback) => {
    console.log(`Received verb ${Protocol.GET_MAP_DEBUG}`);
    callback(mansionSample);
  });

  // GET_MAP
  socket.on(Protocol.GET_MAP, (callback) => {
    console.log(`Received verb ${Protocol.GET_MAP}`);
    callback(mansion.rawData);
  });

  // PLAYER_POSITION_UPDATE
  socket.on(Protocol.PLAYER_POSITION_UPDATE, (position, angle) => {
    console.log(`Received verb ${Protocol.PLAYER_POSITION_UPDATE}`);
    console.log(position);
    Array.from(tables.values()).forEach(table => {
      table.emit(Protocol.PLAYER_POSITION_UPDATE, position, angle);
    });
  });

  socket.on(Protocol.GHOST_POSITION_UPDATE, (position) => {
    console.log(`Received verb ${Protocol.GHOST_POSITION_UPDATE}`);
    console.log(position);

    Array.from(tables.values()).forEach(table => {
      table.emit(Protocol.GHOST_POSITION_UPDATE, position);
    })
  })

  socket.on(Protocol.DOOR_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.DOOR_UPDATE}`);
    console.log(data);

    Array.from(tables.values()).forEach(table => {
      table.emit(Protocol.DOOR_UPDATE, data);
    })
  })

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
