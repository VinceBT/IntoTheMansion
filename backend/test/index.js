/* eslint-disable import/no-extraneous-dependencies */
/**
 * IntoHeMansion backend tests
 */

import assert from 'assert';
import io from 'socket.io-client';
import serverStatus from '../assets/status.json';
import Protocol from '../src/Protocol';
import { generateProgress } from '../src/utils';

const fullRemote = `http://${serverStatus.devRemote}:${serverStatus.port}`;

console.log(`Connecting to ${fullRemote}`);
const table = io(fullRemote);
const tablet = io(fullRemote);
const vr = io(fullRemote);

before((done) => {
  console.log('Before block initializing');
  const progress = generateProgress(3, () => {
    done();
  });
  table.on('connect', () => {
    console.log(`Fake table connected to ${fullRemote}`);
    progress();
  });
  tablet.on('connect', () => {
    console.log(`Fake tablet connected to ${fullRemote}`);
    progress();
  });
  vr.on('connect', () => {
    console.log(`Fake VR connected to ${fullRemote}`);
    progress();
  });
});

describe(`${serverStatus.name} backend server`, () => {
  describe('Noop verify', () => {
    it('should compute a simple problem', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
  describe('Basic communication', () => {
    it('should answer Hi back when sending Hi', (done) => {
      table.once(Protocol.HI, () => {
        done();
      });
      table.emit(Protocol.HI);
    });
    it('should log [ 1, \'a\', {}, Function ] in the server console and execute callback', (done) => {
      table.emit(Protocol.TEST, 1, 'a', {}, () => {
        done();
      });
    });
  });
  describe('Component registration', () => {
    it('should successfully register as a table', (done) => {
      table.emit(Protocol.REGISTER, 'TABLE', (status) => {
        if (status.success)
          done();
        else throw new Error(status.error);
      });
    });
    it('should successfully register as a tablet', (done) => {
      tablet.emit(Protocol.REGISTER, 'TABLET', (status) => {
        if (status.success)
          done();
        else throw new Error(status.error);
      });
    });
    it('should successfully register as a VR headset', (done) => {
      vr.emit(Protocol.REGISTER, { type: 'VR' }, (status) => {
        if (status.success)
          done();
        else throw new Error(status.error);
      });
    });
  });
  describe('Map communication', () => {
    it('should get the sample map back', (done) => {
      table.emit(Protocol.GET_MAP_DEBUG, (map) => {
        if (map)
          done();
        else throw new Error('Map was not returned by the backend');
      });
    });
    it('should get the generated map back', (done) => {
      table.emit(Protocol.GET_MAP, (map) => {
        if (map)
          done();
        else throw new Error('Map was not returned by the backend');
      });
    });
    it('should send the table and the tablet a player position update when receiving one from the VR', (done) => {
      const progress = generateProgress(2, () => {
        done();
      });
      table.once(Protocol.PLAYER_POSITION_UPDATE, () => {
        progress();
      });
      tablet.once(Protocol.PLAYER_POSITION_UPDATE, () => {
        progress();
      });
      vr.emit(Protocol.PLAYER_POSITION_UPDATE, { position: { x: 7, y: 3, z: 7 }, rotation: { x: 0, y: 1.3, z: 0 } });
    });
    it('should send the table and the tablet a ghost position update when receiving one from the VR', (done) => {
      const progress = generateProgress(2, () => {
        done();
      });
      table.once(Protocol.GHOST_POSITION_UPDATE, () => {
        progress();
      });
      tablet.once(Protocol.GHOST_POSITION_UPDATE, () => {
        progress();
      });
      vr.emit(Protocol.GHOST_POSITION_UPDATE, { player: 0, position: { x: 7, y: 3, z: 3 }, rotation: { x: 0, y: 0.5, z: 0 } });
    });
    it('should update the second player too', (done) => {
      const progress = generateProgress(2, () => {
        done();
      });
      table.once(Protocol.GHOST_POSITION_UPDATE, () => {
        progress();
      });
      tablet.once(Protocol.GHOST_POSITION_UPDATE, () => {
        progress();
      });
      vr.emit(Protocol.GHOST_POSITION_UPDATE, { player: 1, position: { x: 3, y: 7, z: 3 }, rotation: { x: 0, y: 1, z: 0 } });
    });
  });
  describe('Doors management', () => {
    it('should update a door as open', () => {
      vr.emit(Protocol.DOOR_UPDATE, {
        open: true,
        name: 'door1',
      });
    });
  });
});
