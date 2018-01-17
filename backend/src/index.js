/**
 * IntoTheMansion Restify backend
 */

import serverStatus from '../assets/status.json';
import mansionSample from '../assets/mansion_sample.json';
import Mansion from './Mansion';
import Protocol from './Protocol';

const io = require('socket.io')();

const tablets = new Set();
const tables = new Set();
const vrs = new Set();

const emitTo = (set, ...args) => {
  Array.from(set.values()).forEach(socket => {
    socket.emit(...args);
  });
};

const mansion = new Mansion();

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.handshake.address}`);

  // HI
  socket.on(Protocol.HI, (callback) => {
    console.log(`Received verb ${Protocol.HI}`);
    socket.emit(Protocol.HI);
    if (callback) callback();
  });

  // TEST
  socket.on(Protocol.TEST, (...args) => {
    console.log(`Received verb ${Protocol.TEST}`);
    console.log(args);
    args.forEach((arg) => {
      if (typeof arg === 'function') arg();
    });
  });

  // REGISTER
  socket.on(Protocol.REGISTER, (type, done) => {
    console.log(`Received verb ${Protocol.REGISTER} with type ${JSON.stringify(type)}`);
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    if (type === 'TABLET') {
      tablets.add(socket);
    } else if (type === 'TABLE') {
      tables.add(socket);
    } else if (type.type === 'VR') {
      vrs.add(socket);
    } else {
      if (done) done({ success: false, error: `Received incorrect type ${type}` });
      return;
    }
    if (done) done({ success: true });
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
  socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.PLAYER_POSITION_UPDATE}`);
    emitTo(tables, Protocol.PLAYER_POSITION_UPDATE, data);
    emitTo(tablets, Protocol.PLAYER_POSITION_UPDATE, data);
  });

  // GHOST_POSITION_UPDATE
  socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.GHOST_POSITION_UPDATE}`);
    emitTo(tables, Protocol.GHOST_POSITION_UPDATE, data);
    emitTo(tablets, Protocol.GHOST_POSITION_UPDATE, data);
  });

  // DOOR_UPDATE
  socket.on(Protocol.DOOR_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.DOOR_UPDATE}`);
    emitTo(tables, Protocol.DOOR_UPDATE, data);
  });

  // DISCONNECTION
  socket.once('disconnect', () => {
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    console.log(`Disconnection from ${socket.handshake.address}`);
  });
});

io.listen(serverStatus.port);
console.log(`${serverStatus.name} server listening at ${serverStatus.devRemote}:${serverStatus.port}`);
