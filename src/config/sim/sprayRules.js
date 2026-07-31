import { SHOP_ITEMS } from './catalog.js';

const PESTICIDE_WEIGHT_KG_BY_KEY = Object.fromEntries(
  (SHOP_ITEMS.pesticide || [])
    .filter((item) => String(item?.key || '').startsWith('pesticide'))
    .map((item) => [String(item.key), Math.max(0, Number(item.weightKg) || 0)])
);

export const SPRAY_TASK_KEYS = ['overwinterPestCleanup', 'pestEarly', 'bloomPestControl', 'herbicideSpray', 'pestSeason', 'foliarFertilization'];
export const WATER_USE_TASK_KEYS = ['waterNutrition'];
export const POLLEN_GRAMS_PER_UNIT = 50;
export const POLLEN_GRAMS_PER_TREE = 0.2;
export const POLLINATION_FRUIT_LOAD_BONUS_BY_POLLEN = {
  pollinationPollenGeneral: 0.24,
  pollinationPollenPremium: 0.42,
  pollinationPollenTop: 0.6
};
export const POLLINATION_ALLOWED_STAGES = new Set(['개화 진행', '수분 진행', '수정진행(만개)']);
export const FLOWER_THINNING_ALLOWED_STAGES = new Set(['화뢰 형성', '화뢰 발달', '풍선기', '개화 시작', '개화 진행', '수분 진행', '수정진행(만개)', '낙화']);
export const POLLINATION_FRUIT_LOAD_BONUS_MAX = 0.6;
export const SPRAY_MIX_ALLOWED_PESTICIDES = [
  'pesticideMachineOil',
  'pesticideBordeaux',
  'limeSulfur',
  'pesticideCaptan',
  'pesticideMancozeb',
  'pesticideChlorothalonil',
  'pesticideCopperHydroxide',
  'pesticideAzoxystrobin',
  'pesticideDifenoconazole',
  'pesticideTebuconazole',
  'pesticideStrobilurin1L',
  'pesticideAcetamiprid',
  'pesticideImidacloprid',
  'pesticideChlorantraniliprole',
  'pesticideFlubendiamide',
  'pesticideEmamectin',
  'pesticideSpirodiclofen',
  'pesticideEtoxazole',
  'pesticideSpinosad',
  'pesticideGlyphosate',
  'pesticideGlufosinate',
  'pesticideStomp',
  'nutriCalciumPlus',
  'nutriCalMag',
  'nutriHighCal',
  'nutriCalPower',
  'nutriBoraxLiquid',
  'nutriBoronStar',
  'nutriUniBoron',
  'nutriFruitSizingBasic',
  'nutriFruitSizingPremium',
  'nutriColorBoostBasic',
  'nutriColorBoostPremium'
];
export const PESTICIDE_DILUTION_RATIO_BY_KEY = {
  pesticideMachineOil: 20,
  pesticideBordeaux: 300,
  limeSulfur: 200,
  pesticideCaptan: 500,
  pesticideMancozeb: 500,
  pesticideChlorothalonil: 600,
  pesticideCopperHydroxide: 500,
  pesticideAzoxystrobin: 1000,
  pesticideDifenoconazole: 2000,
  pesticideTebuconazole: 2000,
  pesticideStrobilurin1L: 3000,
  pesticideAcetamiprid: 2000,
  pesticideImidacloprid: 2000,
  pesticideChlorantraniliprole: 2000,
  pesticideFlubendiamide: 4000,
  pesticideEmamectin: 2000,
  pesticideSpirodiclofen: 2000,
  pesticideEtoxazole: 4000,
  pesticideSpinosad: 4000,
  pesticideGlyphosate: 150,
  pesticideGlufosinate: 120,
  pesticideStomp: 300,
  nutriCalciumPlus: 1000,
  nutriCalMag: 1000,
  nutriHighCal: 1500,
  nutriCalPower: 1200,
  nutriBoraxLiquid: 1200,
  nutriBoronStar: 1500,
  nutriUniBoron: 1800,
  nutriFruitSizingBasic: 1200,
  nutriFruitSizingPremium: 1500,
  nutriColorBoostBasic: 1200,
  nutriColorBoostPremium: 1500
};
const PESTICIDE_SOL_PER_UNIT_SPECIAL_CASE = {
  pesticideBordeaux: 166.6666667
};
const resolvePesticideSolutionPerUnit = (key, dilutionRatio) => {
  if (Object.prototype.hasOwnProperty.call(PESTICIDE_SOL_PER_UNIT_SPECIAL_CASE, key)) {
    return PESTICIDE_SOL_PER_UNIT_SPECIAL_CASE[key];
  }
  const weightKg = Math.max(0, Number(PESTICIDE_WEIGHT_KG_BY_KEY[key]) || 0);
  const ratio = Math.max(0, Number(dilutionRatio) || 0);
  if (weightKg <= 0) return ratio;
  return weightKg * ratio;
};
export const PESTICIDE_SOLUTION_PER_UNIT_LITER_BY_KEY = Object.fromEntries(
  Object.entries(PESTICIDE_DILUTION_RATIO_BY_KEY).map(([key, dilutionRatio]) => [
    key,
    resolvePesticideSolutionPerUnit(key, dilutionRatio)
  ])
);
export const BORDEAUX_MIX_RECIPE = {
  pesticideKey: 'pesticideBordeaux',
  copperSulfateKey: 'copperSulfate',
  hydratedLimeKey: 'hydratedLime',
  ratioText: '8-8식'
};
export const BORDEAUX_MATERIAL_PACK_KG_BY_KEY = {
  copperSulfate: 2,
  hydratedLime: 10
};
export const EARLY_SPRAY_MIX_BLOCK_REASON = '응애방제는 배합 완료된 SS기가 필요합니다. 창고에서 물받기 후 기계유/정제유를 배합해 주세요.';
export const SPRAY_LITERS_PER_TREE_BY_PESTICIDE = {
  pesticideMachineOil: 1.0,
  pesticideBordeaux: 1.0,
  limeSulfur: 1.0,
  pesticideCaptan: 1.0,
  pesticideMancozeb: 1.0,
  pesticideChlorothalonil: 1.0,
  pesticideCopperHydroxide: 1.0,
  pesticideAzoxystrobin: 1.0,
  pesticideDifenoconazole: 1.0,
  pesticideTebuconazole: 1.0,
  pesticideStrobilurin1L: 1.0,
  pesticideAcetamiprid: 1.0,
  pesticideImidacloprid: 1.0,
  pesticideChlorantraniliprole: 1.0,
  pesticideFlubendiamide: 1.0,
  pesticideEmamectin: 1.0,
  pesticideSpirodiclofen: 1.0,
  pesticideEtoxazole: 1.0,
  pesticideSpinosad: 1.0,
  pesticideGlyphosate: 0.05,
  pesticideGlufosinate: 0.05,
  pesticideStomp: 0.05,
  nutriCalciumPlus: 1.0,
  nutriCalMag: 1.0,
  nutriHighCal: 1.0,
  nutriCalPower: 1.0,
  nutriBoraxLiquid: 1.0,
  nutriBoronStar: 1.0,
  nutriUniBoron: 1.0,
  nutriFruitSizingBasic: 1.0,
  nutriFruitSizingPremium: 1.0,
  nutriColorBoostBasic: 1.0,
  nutriColorBoostPremium: 1.0
};
export const DEFAULT_SPRAY_LITERS_PER_TREE = SPRAY_LITERS_PER_TREE_BY_PESTICIDE.pesticideMachineOil;
export const SPRAY_MACHINE_TANK_LITERS = {
  hanaHa1000Wms6: 1000,
  hanaHa1000Sca3: 1100,
  hanaHa1000Wsd: 1000,
  hanaHa600Wms5: 600,
  hanaHa500Cm3: 500,
  asiaAss6: 500,
  asiaAss5: 500,
  asiaAts6: 500,
  asiaAss1016Tld2: 1000,
  asiaAcs1000: 1000,
  asiaAss400C: 400,
  backpackSprayer20LManual: 20,
  backpackSprayer20LElectric: 20,
  asia500G: 500,
  powerSprayer: 30
};
export const SPRAY_MACHINE_KEYS = (SHOP_ITEMS.machine || [])
  .filter((item) => item.type === 'spray')
  .map((item) => item.key);
export const TRACTOR_MACHINE_KEYS = (SHOP_ITEMS.machine || [])
  .filter((item) => item.type === 'tractor')
  .map((item) => item.key);
export const EQUIPMENT_ITEMS = [...(SHOP_ITEMS.tool || []), ...(SHOP_ITEMS.machine || [])].filter((item) => item.durable);
export const EQUIPMENT_ITEM_MAP = EQUIPMENT_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});
