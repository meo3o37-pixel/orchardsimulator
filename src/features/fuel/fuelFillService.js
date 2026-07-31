import { computeFillLiters } from './fuelKioskActionUtils';

const floorLiterNonNeg = (value) => (
  Math.max(0, Math.floor(((Number(value) || 0) * 100) + 1e-9) / 100)
);

export const applyFuelFillToGame = (prev, options) => {
  const {
    containerKey,
    receiptFuelKey,
    fillLiters,
    storableRemainLiters,
    canLabel,
    receiptFuelName,
    pushDiary,
    targetCarrierId = ''
  } = options;
  const carrierId = String(targetCarrierId || '');
  const currentGlobalFuelStorage = prev.fuelStorageByContainer || {};
  const currentVehicleFuelByInstance = prev.vehicleFuelStorageByInstance || {};
  const currentTargetFuelStorage = carrierId
    ? (currentVehicleFuelByInstance?.[carrierId] || {})
    : currentGlobalFuelStorage;
  const containerFuelMap = currentTargetFuelStorage[containerKey] || {};
  const safeFillLiters = computeFillLiters({
    requestedLiters: fillLiters,
    receiptLiters: fillLiters,
    storableRemainLiters
  });
  if (safeFillLiters <= 0) {
    return { nextState: prev, appliedFillLiters: 0 };
  }
  const currentStoredLiters = floorLiterNonNeg(containerFuelMap?.[receiptFuelKey]);
  const nextStoredLiters = floorLiterNonNeg(currentStoredLiters + safeFillLiters);
  const nextTargetFuelStorage = {
    ...currentTargetFuelStorage,
    [containerKey]: {
      ...containerFuelMap,
      [receiptFuelKey]: nextStoredLiters
    }
  };
  return {
    appliedFillLiters: safeFillLiters,
    nextState: {
      ...prev,
      fuelStorageByContainer: carrierId ? currentGlobalFuelStorage : nextTargetFuelStorage,
      vehicleFuelStorageByInstance: carrierId
        ? {
          ...currentVehicleFuelByInstance,
          [carrierId]: nextTargetFuelStorage
        }
        : currentVehicleFuelByInstance,
      logs: pushDiary(
        prev,
        `주유 완료: ${canLabel}에 ${receiptFuelName} ${safeFillLiters}L 충전`
      )
    }
  };
};

export const computeCanDisplayAfterFill = ({
  selectedCan,
  receiptFuelName,
  appliedFillLiters,
  containerKey,
  receiptLiters,
  storableRemainLiters
}) => {
  const cap = Math.max(0, Number(selectedCan?.capacityPerUnit) || 0);
  const baseLabel = String(selectedCan?.displayLabel || selectedCan?.label || '');
  const prevFillMatch = baseLabel.match(/(\d+(?:\.\d+)?)L\/(\d+(?:\.\d+)?)L/);
  const prevFilled = prevFillMatch ? floorLiterNonNeg(prevFillMatch[1]) : 0;
  const nextFilled = cap > 0
    ? floorLiterNonNeg(Math.min(cap, prevFilled + appliedFillLiters))
    : floorLiterNonNeg(appliedFillLiters);
  const fuelShortName = String(receiptFuelName || '연료').replace(/\s*\([^)]*\)\s*/g, '').trim();
  const labelOverride = cap > 0 ? `${fuelShortName}말통 ${nextFilled}L/${cap}L` : '';
  const nextCanKey = cap > 0 ? `${containerKey}__${nextFilled >= cap ? 'full' : 'partial'}` : '';
  const nextSuggestedFill = floorLiterNonNeg(
    Math.max(0, Math.min(receiptLiters - appliedFillLiters, storableRemainLiters - appliedFillLiters))
  );
  return {
    labelOverride,
    nextCanKey,
    nextSuggestedFill,
    nextFilled
  };
};
