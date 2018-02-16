/**
 * IntoTheMansion Restify backend
 */

import fs from 'fs';
import invariant from 'invariant';
import serverStatus from '../assets/status.json';
import mansionSample from '../assets/mansion_sample.json';
import Protocol from './Protocol';
import Dungeon from 'dungeon-generator';
import {shuffleArray} from "./utils";

const io = require('socket.io')();
const middleware = require('socketio-wildcard')();

const tablets = new Set();
const tables = new Set();
const vrs = new Set();
const externals = new Set();

const DEBUG = process.env.NODE_ENV !== 'production';
const SAVE_MAPS = true;

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

const generateMap = (nbrooms = 10, maxWidth = 50, maxHeight = 50, seed) => {
  const dungeon = new Dungeon({
    size: [maxWidth, maxHeight],
    rooms: {
      initial: {
        min_size: [3, 3],
        max_size: [10, 10],
        max_exits: 2,
      },
      exit: {
        min_size: [3, 3],
        max_size: [10, 10],
        max_exits: 2,
      },
      any: {
        min_size: [3, 3],
        max_size: [10, 10],
        max_exits: 3,
      },
    },
    max_corridor_length: 0,
    min_corridor_length: 0,
    corridor_density: 0,
    symmetric_rooms: false,
    interconnects: 10,
    max_interconnect_length: 1000,
    room_count: nbrooms,
  });
  try {
    dungeon.generate();
    // floorDungeon.print();
    const floorData = [];
    const floorSize = {
      width: dungeon.size[0],
      height: dungeon.size[1],
    };
    for (let y = 0; y < floorSize.height; y++) {
      for (let x = 0; x < floorSize.width; x++) {
        if (dungeon.walls.get([x, y]))
          floorData.push('W');
        else
          floorData.push('F');
      }
    }
    const floorObjects = {
      doors: [],
      lights: [],
    };
    const ghostSpawns = [];
    for (const piece of dungeon.children) {
      let centerOfPiece = [
        piece.position[0] + piece.size[0] / 2 - 0.5,
        piece.position[1] + piece.size[1] / 2 - 0.5,
      ];
      if (piece.tag !== 'initial') {
        ghostSpawns.push({
          spawn: centerOfPiece,
        });
      }
      floorObjects.lights.push({
        id: `${piece.tag}_light_${Math.floor(Math.random() * 1000000)}`,
        position: centerOfPiece,
        on: true,
      });
      // piece.position; //[x, y] position of top left corner of the piece within dungeon
      // piece.tag; // 'any', 'initial' or any other key of 'rooms' options property
      // piece.size; //[width, height]
      for (const exit of piece.exits) {
        const [[piece_exit_x, piece_exit_y], angle, dest_piece] = exit; // local position of exit and piece it exits to
        const [exit_x, exit_y] = piece.global_pos([piece_exit_x, piece_exit_y]); // [x, y] global pos of the exit
        const doorExists = floorObjects.doors.some((door) => {
          return (door.position[0] === exit_x && door.position[1] === exit_y);
        });
        if (doorExists) continue;
        floorData[exit_y * floorSize.width + exit_x] = 'D';
        const doorId = `${piece.tag}_door_${Math.floor(Math.random() * 1000000)}`;
        let door = {
          id: doorId,
          position: [exit_x, exit_y],
          align: angle % 180 === 0 ? 'h' : 'v',
        };
        console.log(piece.tag, dest_piece.tag);
        if (piece.tag === 'exit' || dest_piece.tag === 'exit') {
          door.exit = true;
        }
        floorObjects.doors.push(door);
      }
      // piece.local_pos(floorDungeon.start_pos); // get local position within the piece of dungeon's global position
    }
    /*
    const randomExitIndex = Math.floor(Math.random() * floorObjects.doors.length);
    floorObjects.doors[randomExitIndex].exit = true;
    */
    return {
      name: 'Mansion',
      terrain: {
        ...floorSize,
        map: floorData,
      },
      player: {
        spawn: dungeon.start_pos,
      },
      ghosts: shuffleArray(ghostSpawns),
      objects: floorObjects,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

io.use(middleware);

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.handshake.address}`);

  // DISCONNECTION
  socket.once('disconnect', () => {
    tablets.delete(socket);
    tables.delete(socket);
    vrs.delete(socket);
    externals.delete(socket);
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
    externals.delete(socket);
    if (data.type === 'TABLET') {
      tablets.add(socket);
    } else if (data.type === 'TABLE') {
      tables.add(socket);
    } else if (data.type === 'VR') {
      vrs.add(socket);
    } else if (data.type === 'EXTERNAL') {
      externals.add(socket);
    } else {
      if (done) done({success: false, error: `Received incorrect type ${data.type}`});
      return;
    }
    if (done) done({success: true});
  });

  // GET_MAP_DEBUG
  socket.on(Protocol.GET_MAP_DEBUG, (callback) => {
    invariant(typeof callback === 'function', 'First parameter of GET_MAP_DEBUG must be a callback function to pass the map');
    callback(mansionSample);
  });

  // GET_MAP
  socket.on(Protocol.GET_MAP, (seed, callback) => {
    invariant(typeof seed === 'string', 'First parameter of GET_MAP must be a seed string');
    invariant(typeof callback === 'function', 'Second parameter of GET_MAP must be a callback function to pass the map');
    const jsonPath = `./assets/maps/${seed}.json`;
    try {
      console.log(`Loading file: ${jsonPath}`);
      console.log('File exists, loading...');
      if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath);
        const obj = JSON.parse(data);
        callback(obj);
      } else {
        console.log('File does not exist, generating...');
        const obj = generateMap(40, 50, 30, seed);
        callback(obj);
        if (SAVE_MAPS) {
          console.log('Saving...');
          fs.writeFileSync(jsonPath, JSON.stringify(obj));
        } else console.log('Not saving');
      }
    } catch (primaryErr) {
      console.error(primaryErr);
      console.log('Corrupted file, deleting...');
      try {
        fs.unlinkSync(jsonPath);
      } catch (nestedErr) {
        // Nothing
      }
    }
  });

  const register = (message) => {
    socket.on(message, (data) => {
      invariant([vrs, tables, tablets, externals].some((sender) => sender.has(socket)), 'You are not allowed to send this message here');
      broadcastToSet(excludeFromSet(mergeSet(vrs, tables, tablets, externals), socket), message, data);
    });
  };

  // Standard Messages
  register(Protocol.CREATE_TRAP);
  register(Protocol.REMOVE_TRAP);
  register(Protocol.CREATE_WALL);
  register(Protocol.PLAYER_POSITION_UPDATE);
  register(Protocol.GHOST_POSITION_UPDATE);
  register(Protocol.REQUEST_GHOST_MOVEMENT);
  register(Protocol.DOOR_UPDATE);
  register(Protocol.LIGHT_UPDATE);
  register(Protocol.TRAP_TRIGGERED);
  register(Protocol.GAME_OVER);
  register(Protocol.RESTART);
  register(Protocol.PATH_CREATE);
  register(Protocol.REMOVE_PATH);
  register(Protocol.REQUEST_HELP);

});

io.listen(serverStatus.port);

console.log(`${serverStatus.name} server listening at ${serverStatus.devRemote}:${serverStatus.port}`);
