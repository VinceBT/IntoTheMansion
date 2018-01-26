import io from 'socket.io-client';

import serverStatus from '../assets/status.json';
import Protocol from '../src/Protocol';

const fullRemote = `http://${serverStatus.devRemote}:${serverStatus.port}`;

console.log(`Connecting to ${fullRemote}`);
const table = io(fullRemote);

const connect = () => new Promise((resolve, reject) => {
  table.on('connect', () => {
    resolve();
  });
});

const register = () => new Promise((resolve, reject) => {
  table.emit(Protocol.REGISTER, 'TABLE', (status) => {
    if (status.success)
      resolve();
    else
      throw new Error(status.error);
  });
});

const init = async () => {
  await connect();
  await register();
  table.emit(Protocol.CREATE_TRAP, {
    name: '3F',
    player: 0,
    position: {
      x: 3,
      y: 3,
      z: 3,
    },
    type: 'DeathTrap',
  });
};

init();
