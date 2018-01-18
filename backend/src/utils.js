export const generateProgress = (steps = 1, callback) => {
  let currentStep = 0;
  return () => {
    if (++currentStep >= steps)
      callback();
  };
};
