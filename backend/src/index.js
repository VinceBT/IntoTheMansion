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

const broadcast = (set, ...args) => {
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

  // CREATE_TRAP
  socket.on(Protocol.CREATE_TRAP, (data) => {
    console.log(`Received verb ${Protocol.CREATE_TRAP}`);
    broadcast(vrs, Protocol.CREATE_TRAP, data);
    broadcast(tablets, Protocol.CREATE_TRAP, data);
  });

  // CREATE_WALL
  socket.on(Protocol.CREATE_WALL, (data) => {
    console.log(`Received verb ${Protocol.CREATE_WALL}`);
    broadcast(vrs, Protocol.CREATE_WALL, data);
    broadcast(tablets, Protocol.CREATE_WALL, data);
  });

  // PLAYER_POSITION_UPDATE
  socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.PLAYER_POSITION_UPDATE}`);
    broadcast(tables, Protocol.PLAYER_POSITION_UPDATE, data);
    broadcast(tablets, Protocol.PLAYER_POSITION_UPDATE, data);
  });

  // GHOST_POSITION_UPDATE
  socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.GHOST_POSITION_UPDATE}`);
    broadcast(tables, Protocol.GHOST_POSITION_UPDATE, data);
    broadcast(tablets, Protocol.GHOST_POSITION_UPDATE, data);
  });

  // DOOR_UPDATE
  socket.on(Protocol.DOOR_UPDATE, (data) => {
    console.log(`Received verb ${Protocol.DOOR_UPDATE}`);
    broadcast(tables, Protocol.DOOR_UPDATE, data);
  });

  // TRAP_TRIGGERED
  socket.on(Protocol.TRAP_TRIGGERED, (data) => {
    console.log(`Received verb ${Protocol.TRAP_TRIGGERED}`);
    console.log(data);
    broadcast(tables, Protocol.TRAP_TRIGGERED, data);
    broadcast(tablets, Protocol.TRAP_TRIGGERED, data);
  });

  // REMOVE_TRAP
  socket.on(Protocol.REMOVE_TRAP, (data) => {
    console.log(`Received verb ${Protocol.REMOVE_TRAP}`);
    console.log(data);
    broadcast(tables, Protocol.REMOVE_TRAP, data);
    broadcast(vrs, Protocol.REMOVE_TRAP, data);
  });

  // GAME_OVER
  socket.on(Protocol.GAME_OVER, (data) => {
    console.log(`Received verb ${Protocol.GAME_OVER}`);
    console.log(data);
    broadcast(tables, Protocol.GAME_OVER, data);
    broadcast(tablets, Protocol.GAME_OVER, data);
  });

  // RESTART
  socket.on(Protocol.RESTART, () => {
    console.log(`Received verb ${Protocol.RESTART}`);
    broadcast(tables, Protocol.RESTART);
    broadcast(tablets, Protocol.RESTART);
  });

  // REQUEST GHOST MOVEMENT
  socket.on(Protocol.REQUEST_GHOST_MOVEMENT, (data) => {
    console.log(`Received verb ${Protocol.REQUEST_GHOST_MOVEMENT}`);
    console.log(data);
    broadcast(vrs, Protocol.REQUEST_GHOST_MOVEMENT, data);
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
