/* eslint-disable no-nested-ternary,no-mixed-operators */
export function getRand(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value);
}

export function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

export function clerp(v0, v1, t) {
  return clamp(lerp(v0, v1, t), v0, v1);
}

export function unlerp(min, max, value) {
  return (value - min) / (max - min);
}

export function cunlerp(min, max, value) {
  return clamp(unlerp(min, max, value), 0, 1);
}

export function randomHash() {
  return Math.random().toString(36).substring(7);
}

export function generateProgress(steps = 1, callback) {
  let currentStep = 0;
  return () => {
    if (++currentStep >= steps)
      callback();
  };
}

export function shuffleArray(ogArray) {
  const array = ogArray.slice(0);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
