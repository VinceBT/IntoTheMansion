/* eslint-disable import/no-extraneous-dependencies */
/**
 * IntoHeMansion backend tests
 */

import assert from 'assert';
import status from '../assets/status.json';
import Protocol from '../src/Protocol';

const fullRemote = `http://${status.devRemote}:${status.port}`;

console.log(`Connecting to ${fullRemote}`);
const socket = require('socket.io-client')(fullRemote);

socket.on('disconnect', () => {
  console.log('Disconnected');
});

before((done) => {
  console.log('Before block initializing');
  socket.on('connect', () => {
    console.log(`Connnected to ${fullRemote}`);
    done();
  });
});

describe(`${status.name} server testing`, () => {
  describe('Noop verify', () => {
    it('should compute a simple problem', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
  describe('Basic communication', () => {
    it('should answer Hi back', (done) => {
      socket.emit(Protocol.HI, () => {
        done();
      });
    });
    it('should log [ 1, \'a\', {} ] in the server console', () => {
      socket.emit(Protocol.TEST, 1, 'a', {});
    });
  });
  describe('Map communication', () => {
    it('should register as a TABLE', () => {
      socket.emit(Protocol.REGISTER, 'TABLE');
    });
    it('should get a player position update request when sending player position', (done) => {
      socket.once(Protocol.PLAYER_POSITION_UPDATE, () => {
        done();
      });
      // Utilisation d'un angle par défaut pour l'instant
      socket.emit(Protocol.PLAYER_POSITION_UPDATE, { x: 3, y: 3, z: 3 }, { x: 0, y: 0, z: 0 });
    });
    it('should get the sample map back', (done) => {
      socket.emit(Protocol.GET_MAP, (map) => {
        if (map)
          done();
        else
          throw new Error('Map was not returned by the backend');
      });
    });
  });
});
