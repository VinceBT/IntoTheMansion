import { Howl } from 'howler';

const MUTE = false;

const soundMap = new Map();

const load = (key, src, volume = 1, loop = false) => {
  const sound = new Howl({
    src: [src],
    volume: MUTE ? 0 : volume,
    loop,
    preload: true,
  });
  soundMap.set(key, sound);
};

load('bgm', 'assets/sounds/bgm.mp3', 0.5, true);
load('door_close', 'assets/sounds/door_close.wav');
load('door_open', 'assets/sounds/door_open.wav');
load('ghost_lose', 'assets/sounds/ghost_lose.wav');
load('ghost_win', 'assets/sounds/ghost_win.wav');
load('player_move', 'assets/sounds/player_move.wav', 0, true);
load('radio', 'assets/sounds/radio.wav');
load('reveal', 'assets/sounds/reveal.wav');
load('screamer_setup', 'assets/sounds/screamer_setup.wav');
load('screamer_trigger', 'assets/sounds/screamer_trigger.mp3');
load('switch_off', 'assets/sounds/switch_off.wav', 0.7);
load('switch_on', 'assets/sounds/switch_on.wav');
load('trap_trigger', 'assets/sounds/trap_trigger.mp3', 0.8);
load('trap_setup', 'assets/sounds/trap_setup.m4a', 0.5);
load('trap_destroy', 'assets/sounds/trap_destroy.wav', 0.5);

export default class SoundManager {

  static sound(key) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    return soundMap.get(key);
  }

  static play(key) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    console.log(`[SOUND] Playing ${key}`);
    soundMap.get(key).play();
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

