/**
 * IntoTheMansion Restify backend
 */

import invariant from 'invariant';
import serverStatus from '../assets/status.json';
import mansionSample from '../assets/mansion_sample.json';
import Mansion from './Mansion';
import Protocol from './Protocol';

const io = require('socket.io')();
const middleware = require('socketio-wildcard')();

const tablets = new Set();
const tables = new Set();
const vrs = new Set();

const DEBUG = process.env.NODE_ENV !== 'production';

const mergeSet = (...sets) => {
  invariant(Array.isArray(sets), 'You must indicate an array of sets');
  const newSet = new Set();
  sets.forEach(set => {
    Array.from(set.values()).forEach(val => {
      newSet.add(val);
    });
  });
  return newSet;
};

const excludeFromSet = (set, ...elements) => {
  const setClone = new Set(set);
  elements.forEach(element => {
    setClone.delete(element);
  });
  return setClone;
};

const broadcastToSet = (set, ...args) => {
  Array.from(set.values()).forEach(socket => {
    socket.emit(...args);
  });
};

const mansion = new Mansion();

io.use(middleware);

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.handshake.address}`);

  // DISCONNECTION
  socket.once('disconnect', () => {
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    console.log(`Disconnection from ${socket.handshake.address}`);
  });

  // LOG
  socket.on('*', (event) => {
    const eventData = event.data.slice();
    const message = eventData.shift();
    console.log(`Received message: ${message}`);
    if (DEBUG) {
      if (eventData.length === 0) console.log('Empty body');
      else console.log(eventData);
    }
  });

  // HI
  socket.on(Protocol.HI, (callback) => {
    socket.emit(Protocol.HI);
    if (callback) callback();
  });

  // TEST
  socket.on(Protocol.TEST, (...args) => {
    // console.log(args);
    args.forEach((arg) => {
      if (typeof arg === 'function') arg();
    });
  });

  // REGISTER
  socket.on(Protocol.REGISTER, (type, done) => {
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
    callback(mansionSample);
  });

  // GET_MAP
  socket.on(Protocol.GET_MAP, (callback) => {
    callback(mansion.rawData);
  });

  // CREATE_TRAP
  socket.on(Protocol.CREATE_TRAP, (data) => {
    invariant([tables].some((sender) => sender.has(socket)), 'Only tables can send this message');
    broadcastToSet(excludeFromSet(mergeSet(vrs, tablets), socket), Protocol.CREATE_TRAP, data);
  });

  // CREATE_WALL
  socket.on(Protocol.CREATE_WALL, (data) => {
    invariant([tables].some((sender) => sender.has(socket)), 'Only tables can send this message');
    broadcastToSet(excludeFromSet(mergeSet(vrs, tablets), socket), Protocol.CREATE_WALL, data);
  });

  // PLAYER_POSITION_UPDATE
  socket.on(Protocol.PLAYER_POSITION_UPDATE, (data) => {
    invariant([vrs].some((sender) => sender.has(socket)), 'Only VRs can send this message');
    broadcastToSet(excludeFromSet(mergeSet(tables, tablets), socket), Protocol.PLAYER_POSITION_UPDATE, data);
  });

  // GHOST_POSITION_UPDATE
  socket.on(Protocol.GHOST_POSITION_UPDATE, (data) => {
    invariant([vrs].some((sender) => sender.has(socket)), 'Only VRs can send this message');
    broadcastToSet(excludeFromSet(mergeSet(tables, tablets), socket), Protocol.GHOST_POSITION_UPDATE, data);
  });

  // REQUEST GHOST MOVEMENT
  socket.on(Protocol.REQUEST_GHOST_MOVEMENT, (data) => {
    invariant([tables].some((sender) => sender.has(socket)), 'Only tables can send this message');
    broadcastToSet(excludeFromSet(mergeSet(vrs), socket), Protocol.REQUEST_GHOST_MOVEMENT, data);
  });

  // DOOR_UPDATE
  socket.on(Protocol.DOOR_UPDATE, (data) => {
    invariant([vrs].some((sender) => sender.has(socket)), 'Only VRs can send this message');
    broadcastToSet(excludeFromSet(mergeSet(tables, tablets), socket), Protocol.DOOR_UPDATE, data);
  });

  // DOOR_UPDATE
  socket.on(Protocol.LIGHT_UPDATE, (data) => {
    invariant([tables, vrs].some((sender) => sender.has(socket)), 'Only VRs and tables can send this message');
    broadcastToSet(excludeFromSet(mergeSet(vrs, tablets), socket), Protocol.LIGHT_UPDATE, data);
  });

  // TRAP_TRIGGERED
  socket.on(Protocol.TRAP_TRIGGERED, (data) => {
    invariant([tables, tablets, vrs].some((sender) => sender.has(socket)), 'Only tables and tablets can send this message');
    broadcastToSet(excludeFromSet(mergeSet(vrs, tablets, vrs), socket), Protocol.TRAP_TRIGGERED, data);
  });

  // REMOVE_TRAP
  socket.on(Protocol.REMOVE_TRAP, (data) => {
    invariant([tables, tablets, vrs].some((sender) => sender.has(socket)), 'OK');
    broadcastToSet(excludeFromSet(mergeSet(vrs, tablets, tables), socket), Protocol.REMOVE_TRAP, data);
  });

  // GAME_OVER
  socket.on(Protocol.GAME_OVER, (data) => {
    invariant([vrs].some((sender) => sender.has(socket)), 'Only VRs can send this message');
    broadcastToSet(excludeFromSet(mergeSet(tablets, tables), socket), Protocol.GAME_OVER, data);
  });

  // RESTART
  socket.on(Protocol.RESTART, (data) => {
    invariant([vrs].some((sender) => sender.has(socket)), 'Only VRs can send this message');
    broadcastToSet(excludeFromSet(mergeSet(tablets, tables), socket), Protocol.RESTART, data);
  });
});

io.listen(serverStatus.port);
console.log(`${serverStatus.name} server listening at ${serverStatus.devRemote}:${serverStatus.port}`);
