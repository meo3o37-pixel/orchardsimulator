import { TOOL_ITEMS } from './tool.js';
import { MACHINE_ITEMS } from './machine.js';
import { SEEDLING_ITEMS } from './seedling.js';
import { PESTICIDE_ITEMS } from './pesticide.js';
import { POLLEN_ITEMS } from './pollen.js';
import { FERTILIZER_ITEMS } from './fertilizer.js';
import { FUEL_ITEMS } from './fuel.js';
import { CONTAINER_ITEMS } from './container.js';
import { CONSUMABLE_MATERIAL_ITEMS } from './consumableMaterial.js';
import { FOOD_MART_ITEMS } from './foodMart.js';
import { APPLIANCE_ITEMS } from './appliance.js';
import { FURNITURE_ITEMS } from './furniture.js';
import { CLOTHING_ITEMS } from './clothing.js';

const CATEGORY_DEFAULT_WEIGHT_KG = {
  tool: 1.2,
  machine: 300,
  seedling: 0.3,
  pesticide: 1.0,
  pollen: 0.05,
  fertilizer: 20,
  fuel: 1.0,
  container: 0.8,
  consumableMaterial: 1.0,
  foodMart: 1.0,
  appliance: 45,
  furniture: 18,
  clothing: 0.6
};

const PESTICIDE_WEIGHT_KG_BY_KEY = {
  pesticideAcetamiprid: 0.25,
  pesticideImidacloprid: 0.25,
  pesticideChlorantraniliprole: 0.25,
  pesticideFlubendiamide: 0.25,
  pesticideSpinosad: 0.25,
  pesticideEmamectin: 0.25,
  pesticideSpirodiclofen: 0.25,
  pesticideEtoxazole: 0.125,
  pesticideMancozeb: 1,
  pesticideCaptan: 0.5,
  pesticideChlorothalonil: 0.5,
  pesticideCopperHydroxide: 0.5,
  pesticideAzoxystrobin: 0.25,
  pesticideDifenoconazole: 0.25,
  pesticideTebuconazole: 0.25,
  pesticideStrobilurin1L: 0.167,
  pesticideThiophanateMethyl: 1,
  pesticideFluquinconazoleProchloraz: 1,
  pesticideStomp: 1,
  pesticideGlufosinate: 1,
  pesticideGlyphosate: 1,
  treeProtectantBasic18L: 18,
  treeProtectantWiltPruf10L: 10,
  pesticideMachineOil: 18,
  nutriCalciumPlus: 0.5,
  nutriCalMag: 1,
  nutriHighCal: 0.5,
  nutriCalPower: 1,
  nutriBoraxLiquid: 0.5,
  nutriBoronStar: 0.5,
  nutriUniBoron: 0.5,
  nutriGrowthBooster: 1,
  nutriGiantBig: 1,
  nutriKalamin: 1,
  nutriPremiumColor: 1,
  copperSulfate: 2,
  hydratedLime: 10,
  limeSulfur: 5
};

const MACHINE_BASE_WEIGHT_KG_BY_TYPE = {
  spray: 820,
  tractor: 1850,
  rotary: 420,
  work: 95,
  aerial: 2400,
  transport: 2800,
  passenger: 1650
};

const round1 = (value) => Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 10) / 10;

const parseUnitWeightFromText = (text) => {
  const raw = String(text || '');
  const kg = raw.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kg) return Number(kg[1]);
  const liters = raw.match(/(\d+(?:\.\d+)?)\s*L/i);
  if (liters) return Number(liters[1]);
  const grams = raw.match(/(\d+(?:\.\d+)?)\s*g/i);
  if (grams) return Number(grams[1]) / 1000;
  return 0;
};

const inferWeightKg = (category, item) => {
  const explicit = Number(item?.weightKg);
  if (explicit > 0) return round1(explicit);

  const key = String(item?.key || '');
  const name = String(item?.name || '');
  const desc = String(item?.desc || '');
  const unitWeightFromText = parseUnitWeightFromText(`${name} ${desc}`);

  if (category === 'tool') {
    return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG.tool);
  }

  if (category === 'machine') {
    const type = String(item?.type || '');
    const typeBase = Number(MACHINE_BASE_WEIGHT_KG_BY_TYPE[type]) || CATEGORY_DEFAULT_WEIGHT_KG.machine;
    if ((type === 'transport' || type === 'passenger') && Number(item?.payloadKg) > 0) {
      return round1(Math.max(typeBase, 900 + (Number(item.payloadKg) * 1.55)));
    }
    return round1(typeBase);
  }

  if (category === 'container') {
    const liters = parseUnitWeightFromText(name) || parseUnitWeightFromText(desc);
    if (liters > 0) return round1(Math.max(0.3, (liters * 0.055)));
    return round1(CATEGORY_DEFAULT_WEIGHT_KG.container);
  }

  if (category === 'fuel') {
    if (/fuelCan|can|tong|말통|기름통/i.test(`${key} ${name}`)) return 2.5;
    return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG.fuel);
  }

  if (category === 'seedling') return round1(CATEGORY_DEFAULT_WEIGHT_KG.seedling);
  if (category === 'pollen') return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG.pollen);
  if (category === 'fertilizer') return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG.fertilizer);
  if (category === 'pesticide') {
    const fixedPesticideWeight = Number(PESTICIDE_WEIGHT_KG_BY_KEY[key]);
    if (fixedPesticideWeight > 0) return round1(fixedPesticideWeight);
    return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG.pesticide);
  }

  return round1(unitWeightFromText || CATEGORY_DEFAULT_WEIGHT_KG[category] || 1);
};

const attachWeight = (category, items = []) =>
  (items || []).map((item) => ({
    ...item,
    weightKg: inferWeightKg(category, item)
  }));

export const SHOP_ITEMS = {
  tool: attachWeight('tool', TOOL_ITEMS),
  machine: attachWeight('machine', MACHINE_ITEMS),
  seedling: attachWeight('seedling', SEEDLING_ITEMS),
  pesticide: attachWeight('pesticide', PESTICIDE_ITEMS),
  pollen: attachWeight('pollen', POLLEN_ITEMS),
  fertilizer: attachWeight('fertilizer', FERTILIZER_ITEMS),
  fuel: attachWeight('fuel', FUEL_ITEMS),
  container: attachWeight('container', CONTAINER_ITEMS),
  consumableMaterial: attachWeight('consumableMaterial', CONSUMABLE_MATERIAL_ITEMS),
  foodMart: attachWeight('foodMart', FOOD_MART_ITEMS),
  appliance: attachWeight('appliance', APPLIANCE_ITEMS),
  furniture: attachWeight('furniture', FURNITURE_ITEMS),
  clothing: attachWeight('clothing', CLOTHING_ITEMS)
};
