export const generateProgress = (steps = 1, callback) => {
  let currentStep = 0;
  return () => {
    if (++currentStep >= steps)
      callback();
  };
};

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
