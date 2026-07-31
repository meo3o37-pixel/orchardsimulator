const ageBandFor = (ageYear) => {
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  if (age === 1) return { min: 0, max: 5, over: 1, severe: null, label: '1년생' };
  if (age === 2) return { min: 10, max: 20, over: 10, severe: null, label: '2년생' };
  if (age === 3) return { min: 30, max: 50, over: 100, severe: 150, label: '3년생' };
  if (age === 4) return { min: 60, max: 100, over: 180, severe: 220, label: '4년생' };
  if (age === 5) return { min: 100, max: 150, over: 300, severe: 350, label: '5년생' };
  return { min: 150, max: 200, over: 400, severe: 500, label: '6년생 이상' };
};

export const fruitOverloadStatusByAge = (ageYear, fruitLoadPerTree) => {
  const band = ageBandFor(ageYear);
  const load = Math.max(0, Number(fruitLoadPerTree) || 0);
  if (typeof band.severe === 'number' && load >= band.severe) {
    return { level: 'severe', label: '심한 과다', band };
  }
  if (load >= band.over) {
    return { level: 'over', label: '과다', band };
  }
  return { level: 'normal', label: '적정', band };
};
