const STORAGE_FRESHNESS_STAGE_TABLE = Object.freeze({
  default: Object.freeze([
    { untilDay: 30, loss: 0.16 },
    { untilDay: 60, loss: 0.24 },
    { untilDay: 90, loss: 0.38 },
    { untilDay: 120, loss: 0.7 },
    { untilDay: 150, loss: 1.05 },
    { untilDay: Infinity, loss: 1.45 }
  ]),
  fuji: Object.freeze([
    { untilDay: 30, loss: 0.12 },
    { untilDay: 60, loss: 0.18 },
    { untilDay: 90, loss: 0.28 },
    { untilDay: 120, loss: 0.55 },
    { untilDay: 150, loss: 0.9 },
    { untilDay: Infinity, loss: 1.3 }
  ]),
  hongro: Object.freeze([
    { untilDay: 20, loss: 0.28 },
    { untilDay: 40, loss: 0.45 },
    { untilDay: 60, loss: 0.78 },
    { untilDay: 90, loss: 1.28 },
    { untilDay: 120, loss: 1.9 },
    { untilDay: Infinity, loss: 2.5 }
  ]),
  gamhong: Object.freeze([
    { untilDay: 30, loss: 0.18 },
    { untilDay: 60, loss: 0.3 },
    { untilDay: 90, loss: 0.48 },
    { untilDay: 120, loss: 0.82 },
    { untilDay: 150, loss: 1.2 },
    { untilDay: Infinity, loss: 1.6 }
  ]),
  sinano: Object.freeze([
    { untilDay: 30, loss: 0.16 },
    { untilDay: 60, loss: 0.24 },
    { untilDay: 90, loss: 0.38 },
    { untilDay: 120, loss: 0.68 },
    { untilDay: 150, loss: 1.05 },
    { untilDay: Infinity, loss: 1.45 }
  ])
});

const storageTemperatureMultiplierOf = (temperatureRaw) => {
  const tempC = Number(temperatureRaw);
  if (!Number.isFinite(tempC)) return 6;
  if (tempC < -1) return 1.35;
  if (tempC <= 0) return 1;
  if (tempC <= 1) return 1.08;
  if (tempC <= 3) return 1.45;
  if (tempC <= 6) return 2.2;
  if (tempC <= 10) return 3.4;
  if (tempC <= 15) return 4.8;
  if (tempC <= 20) return 6.6;
  if (tempC <= 25) return 8.8;
  return 11;
};

const baseLossByCropAndDaysOf = (cropIdRaw, daysStoredRaw) => {
  const cropId = String(cropIdRaw || '').trim();
  const daysStored = Math.max(1, Math.floor(Number(daysStoredRaw) || 1));
  const stages = STORAGE_FRESHNESS_STAGE_TABLE[cropId] || STORAGE_FRESHNESS_STAGE_TABLE.default;
  const matchedStage = stages.find((stage) => daysStored <= stage.untilDay) || stages[stages.length - 1];
  return Number(matchedStage?.loss) || 0;
};

export const storageFreshnessLossPerDayOf = ({
  cropId = '',
  temperatureC = 0,
  daysStored = 1,
  oneMcpTreated = false
} = {}) => {
  const baseLoss = baseLossByCropAndDaysOf(cropId, daysStored);
  const multiplier = storageTemperatureMultiplierOf(temperatureC);
  const treatedMultiplier = oneMcpTreated ? 0.7 : 1;
  return Math.round((baseLoss * multiplier * treatedMultiplier) * 100) / 100;
};
