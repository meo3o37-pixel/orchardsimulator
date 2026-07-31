export const IRRIGATION_MIN_L_PER_TREE = 0;
export const IRRIGATION_MAX_L_PER_TREE = 15;
export const FRUIT_LOAD_MAX = 2000;
export const FRUIT_LOAD_METER_MAX = 500;
export const FRUIT_LOAD_PROFILE_BY_AGE = {
  1: { unmanaged: [1, 5], optimal: [0, 5] },
  2: { unmanaged: [20, 60], optimal: [10, 20] },
  3: { unmanaged: [130, 312], optimal: [30, 50] },
  4: { unmanaged: [304, 608], optimal: [60, 100] },
  5: { unmanaged: [406, 744], optimal: [100, 150] },
  6: { unmanaged: [541, 946], optimal: [150, 200] },
  7: { unmanaged: [608, 1082], optimal: [150, 200] },
  8: { unmanaged: [744, 1284], optimal: [150, 200] },
  9: { unmanaged: [811, 1420], optimal: [150, 200] },
  10: { unmanaged: [879, 1521], optimal: [150, 200] }
};
export const FRUIT_LOAD_RISE_START_MONTH = 4;
export const FRUIT_LOAD_RISE_START_DAY = 1;
export const FRUIT_LOAD_RISE_END_MONTH = 5;
export const FRUIT_LOAD_RISE_END_DAY = 25;
export const IRRIGATION_MAX_L_PER_TREE_BY_FACILITY = {
  dripIrrigation: 5,
  sprinklerIrrigation: 15
};
export const IRRIGATION_MAX_DAYS = 30;
export const IRRIGATION_WATER_GAIN_MAX_PER_DAY = 9.0;
export const IRRIGATION_RESPONSE_CURVE = 0.9;
export const IRRIGATION_FACILITY_EFFICIENCY = {
  dripIrrigation: 0.92,
  sprinklerIrrigation: 0.74
};
export const IRRIGATION_WATER_LOSS_RATE = {
  dripIrrigation: 0.08,
  sprinklerIrrigation: 0.35
};
export const irrigationMaxLitersPerTree = (facilityKey) =>
  IRRIGATION_MAX_L_PER_TREE_BY_FACILITY[facilityKey] || IRRIGATION_MAX_L_PER_TREE;
