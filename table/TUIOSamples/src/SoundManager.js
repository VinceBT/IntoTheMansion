import { Howl } from 'howler';

const MUTE = false;

const soundMap = new Map();

const load = (key, src, loop = false) => {
  const sound = new Howl({
    src: [src],
    volume: MUTE ? 0 : 0.6,
    loop,
    preload: true,
  });
  soundMap.set(key, sound);
};

load('bgm', 'assets/sounds/bgm.mp3', true);
load('radio', 'assets/sounds/radio.mp3');
load('trap_trigger', 'assets/sounds/trap.m4a');

export default class SoundManager {

  static play(key) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    soundMap.get(key).play();
  }

  static volume(key, volume) {
    if (typeof key !== 'string') throw new Error('Must provide key string');
    if (typeof volume !== 'number') throw new Error('Must provide number volume');
    if (!soundMap.has(key)) throw new Error('Unknown key');
    soundMap.get(key).volume(volume);
  }

}

