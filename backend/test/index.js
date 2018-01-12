/* eslint-disable import/no-extraneous-dependencies */
/**
 * IntoHeMansion backend tests
 */

import assert from 'assert';
import status from '../assets/status.json';
import protocol from '../assets/protocol.json';

const fullRemote = `http://${status.devRemote}:${status.port}`;

console.log(`Connnecting to ${fullRemote}`);
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
      socket.once(protocol.HI, () => {
        done();
      });
      socket.emit(protocol.HI);
    });
  });
});
