import {Howl} from 'howler';

const MUTE = false;

const soundMap = new Map();

const loadSound = (key, src, volume = 1, loop = false) => {
  const sound = new Howl({
    src: [src],
    volume: MUTE ? 0 : volume,
    loop,
    preload: true,
  });
  soundMap.set(key, sound);
};

loadSound('bgm', 'assets/sounds/bgm.mp3', 0.5, true);
loadSound('door_close', 'assets/sounds/door_close.wav');
loadSound('door_open', 'assets/sounds/door_open.wav');
loadSound('ghost_lose', 'assets/sounds/ghost_lose.wav');
loadSound('ghost_win', 'assets/sounds/ghost_win.wav');
loadSound('ghost_move_1', 'assets/sounds/ghost_move_1.wav', 0.6);
loadSound('ghost_move_2', 'assets/sounds/ghost_move_2.wav', 0.6);
loadSound('ghost_move_3', 'assets/sounds/ghost_move_3.wav', 0.6);
loadSound('player_move', 'assets/sounds/player_move.wav', 0, true);
loadSound('radio', 'assets/sounds/radio.wav', 0.015);
loadSound('ghost_bg', 'assets/sounds/ghost_bg.wav', 0.03, true);
loadSound('reveal', 'assets/sounds/reveal.wav');
loadSound('spell', 'assets/sounds/spell.wav');
loadSound('screamer_setup', 'assets/sounds/screamer_setup.wav', 0.7);
loadSound('screamer_trigger', 'assets/sounds/screamer_trigger.mp3');
loadSound('switch_off', 'assets/sounds/switch_off.wav', 0.7);
loadSound('switch_on', 'assets/sounds/switch_on.wav');
loadSound('trap_trigger', 'assets/sounds/trap_trigger.mp3', 0.8);
loadSound('trap_setup', 'assets/sounds/trap_setup.m4a', 0.5);
loadSound('trap_destroy', 'assets/sounds/trap_destroy.wav', 0.5);

let ghostMoveIt = 1;

export default class SoundService {

  static sound(key) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    return soundMap.get(key);
  }

  static play(key) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    console.log(`[SOUND] Playing ${key}`);
    if (key === 'ghost_move') {
      soundMap.get('ghost_move_' + ghostMoveIt++).play();
      if (ghostMoveIt > 3) ghostMoveIt = 1;
    } else {
      if (!soundMap.has(key)) throw new Error('Unknown key');
      soundMap.get(key).play();
    }
    return this;
  }

  static volume(key, volume) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (typeof volume !== 'number') throw new Error('Must provide number volume');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    soundMap.get(key).volume(volume);
    return this;
  }

  static rate(key, rate) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (typeof rate !== 'number') throw new Error('Must provide number rate');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    soundMap.get(key).rate(rate);
    return this;
  }

}

