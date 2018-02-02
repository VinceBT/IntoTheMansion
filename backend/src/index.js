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

  // Special messages
  socket.on(Protocol.TEST, (...args) => {
    // console.log(args);
    args.forEach((arg) => {
      if (typeof arg === 'function') arg();
    });
  });

  // REGISTER
  socket.on(Protocol.REGISTER, (data, done) => {
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    if (data.type === 'TABLET') {
      tablets.add(socket);
    } else if (data.type === 'TABLE') {
      tables.add(socket);
    } else if (data.type === 'VR') {
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

  const register = (message) => {
    socket.on(message, (data) => {
      invariant([vrs, tables, tablets].some((sender) => sender.has(socket)), 'You are not allowed to send this message here');
      broadcastToSet(excludeFromSet(mergeSet(vrs, tables, tablets), socket), message, data);
    });
  };

  // Standard Messages
  register(Protocol.CREATE_TRAP);
  register(Protocol.CREATE_WALL);
  register(Protocol.PLAYER_POSITION_UPDATE);
  register(Protocol.GHOST_POSITION_UPDATE);
  register(Protocol.REQUEST_GHOST_MOVEMENT);
  register(Protocol.DOOR_UPDATE);
  register(Protocol.LIGHT_UPDATE);
  register(Protocol.TRAP_TRIGGERED);
  register(Protocol.REMOVE_TRAP);
  register(Protocol.GAME_OVER);
  register(Protocol.RESTART);

});

io.listen(serverStatus.port);
console.log(`${serverStatus.name} server listening at ${serverStatus.devRemote}:${serverStatus.port}`);
