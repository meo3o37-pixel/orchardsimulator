import { selfLaborAvailable } from '../../utils/overwork.js';
const HARVEST_CONTAINER_KEY_MIGRATION = {
  appleContainerYellow18kg: 'appleContainerYellow20kg',
  appleContainerGreen18kg: 'appleContainerGreen20kg'
};

const normalizeTransportLaborAmount = (value) => (
  Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 10) / 10
);

const normalizedHarvestLoadBoxKey = (loadBoxKey = '', containerKeyMigration = HARVEST_CONTAINER_KEY_MIGRATION) => {
  const rawKey = String(loadBoxKey || '');
  return String(containerKeyMigration?.[rawKey] || rawKey);
};

const isHarvestTransportFloorTargetSlot = (selectedDestination, slot) => {
  if (!slot) return false;
  if (Boolean(slot?.isFloorStored)) return true;
  if (Boolean(slot?.isVehicleFloorTarget)) return true;
  if (
    String(selectedDestination?.type || '') === 'storage'
    && !Boolean(slot?.occupied)
  ) {
    return true;
  }
  if (String(selectedDestination?.type || '') !== 'carrier') return false;
  return (
    !Boolean(slot?.occupied)
    && String(slot?.slotType || '') === 'empty'
  );
};

export function buildHarvestPlanningSnapshot({
  game,
  selectedField,
  selectedFieldFacilityInventoryState,
  activeCrew,
  itemNameByKey,
  harvestPlanCropId,
  harvestPlanAgeYear,
  harvestPlanEquipmentInstanceIds,
  harvestPlanLoadBoxSelections,
  harvestPlanLoadBoxKey,
  harvestPlanLoadBoxSourceType,
  harvestWorkerRosterByType,
  harvestPlanSelectedWorkerIdsByType,
  harvestPlanUseSelfLabor,
  harvestPlanWorkerEquipmentByWorkerId,
  harvestLockedWorkerEquipmentByWorkerId = {},
  CROPS,
  SHOP_ITEMS,
  MACHINE_ITEM_MAP,
  EQUIPMENT_ITEM_MAP,
  CONTAINER_KEY_MIGRATION,
  ORCHARD_LADDER_KEY,
  HARVEST_SELF_WORKER_ID,
  HARVEST_CREW_TYPE_KEYS,
  cropRowsByVarietyAndAge,
  harvestQtyKgOfAgeRow,
  fruitLoadPerTreeForAgeRow,
  treeAccessEquipmentOptionsOfGame,
  machineParkingInstanceId,
  equipmentDurabilityOfUnit,
  cargoItemStockOf,
  appleContainerAppliedUnitsOfField,
  toolImageSrcOf,
  resolveMachineInstanceById,
  isCombustionMachineItem,
  isElectricMachineItem,
  electricBatteryCapacityKwhOfItem,
  machineTankCapacityLitersOfItem,
  electricBatteryKwhOfInstance,
  machineFuelLitersOfInstance,
  machineFuelTypeLabelOf,
  harvestWorkerEquipmentShortLabelOf,
  clamp
}) {
  const harvestTargetOptions = cropRowsByVarietyAndAge(selectedField, game.day)
    .filter((row) => (Number(row?.aliveTrees) || 0) > 0)
    .map((row) => {
      const ageYear = Math.max(1, Math.floor(Number(row?.ageYear) || 1));
      const cropId = String(row?.cropId || selectedField?.cropId || '');
      const remainingQtyKg = harvestQtyKgOfAgeRow(selectedField, row, game.day);
      const isCompleted = Math.max(0, Number(remainingQtyKg) || 0) <= 0;
      return {
        ...row,
        cropId,
        ageYear,
        remainingQtyKg,
        isCompleted,
        avgFruitLoadPerTree: fruitLoadPerTreeForAgeRow(selectedField, row, game.day),
        label: `${CROPS?.[cropId]?.name || cropId || '미식재'} · ${ageYear}년생`
      };
    });

  const harvestFirstActiveTargetOption = harvestTargetOptions.find((row) => !row?.isCompleted) || null;
  const harvestSelectedTargetOption = harvestTargetOptions.find((row) => (
    String(row?.cropId || '') === String(harvestPlanCropId || '')
    && Math.max(1, Math.floor(Number(row?.ageYear) || 1)) === Math.max(0, Math.floor(Number(harvestPlanAgeYear) || 0))
  )) || harvestFirstActiveTargetOption || harvestTargetOptions[0] || null;

  const harvestAvailableWorkerMix = {
    beginner: Math.max(0, Number(activeCrew.beginner) || 0),
    worker: Math.max(0, Number(activeCrew.worker) || 0),
    skilledWorker: Math.max(0, Number(activeCrew.skilledWorker) || 0)
  };

  const harvestEquipmentOptions = treeAccessEquipmentOptionsOfGame(game).flatMap((item) => {
    const qty = Math.max(0, Math.floor(Number(game?.inventory?.[item.key]) || 0));
    return Array.from({ length: qty }, (_, index) => {
      const unitNo = index + 1;
      return {
        id: machineParkingInstanceId(item.key, unitNo),
        key: item.key,
        item,
        unitNo,
        label: `${item.name} #${unitNo}`,
        durability: equipmentDurabilityOfUnit(game, item.key, unitNo)
      };
    });
  });

  const harvestCurrentFieldWarehouseInventory = Object.values(selectedFieldFacilityInventoryState?.byFacility || {}).reduce((acc, facilityMap) => {
    Object.entries(facilityMap || {}).forEach(([itemKey, qtyRaw]) => {
      const safeKey = String(itemKey || '');
      const safeQty = Math.max(0, Math.floor(Number(qtyRaw) || 0));
      if (!safeKey || safeQty <= 0) return;
      acc[safeKey] = Math.max(0, Math.floor(Number(acc[safeKey]) || 0)) + safeQty;
    });
    return acc;
  }, {});

  const harvestLoadBoxSourceKeysByKey = Object.entries(CONTAINER_KEY_MIGRATION).reduce((acc, [legacyKey, nextKey]) => {
    const canonicalKey = String(nextKey || '');
    if (!canonicalKey) return acc;
    if (!acc[canonicalKey]) acc[canonicalKey] = new Set([canonicalKey]);
    acc[canonicalKey].add(String(legacyKey || ''));
    return acc;
  }, {});

  const harvestLoadBoxOptions = ([...(SHOP_ITEMS?.container || []), ...(SHOP_ITEMS?.tool || [])])
    .filter((item) => /appleContainer/i.test(String(item?.key || '')))
    .map((item) => {
      const key = String(item?.key || '');
      const sourceKeys = Array.from(harvestLoadBoxSourceKeysByKey[key] || new Set([key])).filter(Boolean);
      const warehouseQty = sourceKeys.reduce(
        (sum, sourceKey) => sum + Math.max(0, Math.floor(Number(harvestCurrentFieldWarehouseInventory?.[sourceKey]) || 0)),
        0
      );
      const parkedCargoQty = sourceKeys.reduce(
        (sum, sourceKey) => sum + cargoItemStockOf(game, sourceKey, selectedField),
        0
      );
      const appliedQty = sourceKeys.reduce(
        (sum, sourceKey) => sum + Math.max(0, Math.floor(Number(appleContainerAppliedUnitsOfField(selectedField, sourceKey)) || 0)),
        0
      );
      const stockQty = warehouseQty + parkedCargoQty;
      const label = String(item?.name || itemNameByKey?.[key] || key);
      const rows = [];
      if (stockQty > 0) {
        rows.push({
          key,
          sourceKeys,
          sourceType: 'stock',
          qty: stockQty,
          label,
          sourceLabel: '창고/차량',
          warehouseQty,
          parkedCargoQty,
          appliedQty: 0
        });
      }
      if (appliedQty > 0) {
        rows.push({
          key,
          sourceKeys,
          sourceType: 'applied',
          qty: appliedQty,
          label,
          sourceLabel: '토지 도포',
          warehouseQty: 0,
          parkedCargoQty: 0,
          appliedQty
        });
      }
      return rows;
    })
    .flat()
    .filter((row) => row.key && row.qty > 0);

  const harvestLoadBoxStockOptions = harvestLoadBoxOptions.filter((option) => option.sourceType === 'stock');
  const harvestLoadBoxAppliedOptions = harvestLoadBoxOptions.filter((option) => option.sourceType === 'applied');
  const harvestLoadBoxSelectionIdOf = (optionOrKey, sourceTypeRaw = 'stock') => {
    if (optionOrKey && typeof optionOrKey === 'object') {
      return `${String(optionOrKey?.key || '')}::${String(optionOrKey?.sourceType || 'stock')}`;
    }
    return `${String(optionOrKey || '')}::${String(sourceTypeRaw || 'stock')}`;
  };

  const harvestBasketOptions = ([...(SHOP_ITEMS?.tool || []), ...(SHOP_ITEMS?.container || [])])
    .filter((item) => /^orchardHarvestBasket/i.test(String(item?.key || '')))
    .map((item) => {
      const key = String(item?.key || '');
      const warehouseQty = Math.max(0, Math.floor(Number(harvestCurrentFieldWarehouseInventory?.[key]) || 0));
      const parkedCargoQty = Math.max(0, cargoItemStockOf(game, key, selectedField));
      const qty = warehouseQty + parkedCargoQty;
      return {
        key,
        qty,
        label: String(item?.name || itemNameByKey?.[key] || key),
        warehouseQty,
        parkedCargoQty
      };
    })
    .filter((row) => row.key && row.qty > 0);

  const harvestSelectedCropLabel = String(
    CROPS?.[harvestSelectedTargetOption?.cropId]?.name
    || CROPS?.[harvestPlanCropId]?.name
    || CROPS?.[selectedField?.cropId]?.name
    || harvestPlanCropId
    || selectedField?.cropId
    || '미식재'
  );

  const harvestSelectedTargetLabel = harvestSelectedTargetOption
    ? `${harvestSelectedCropLabel} · ${harvestSelectedTargetOption.ageYear}년생`
    : '품종/년생 선택';

  const harvestSelectedEquipmentInstances = harvestPlanEquipmentInstanceIds
    .map((id) => {
      const option = harvestEquipmentOptions.find((candidate) => candidate.id === id);
      if (!option) return null;
      return resolveMachineInstanceById(option.id);
    })
    .filter(Boolean);

  const harvestSelectedEquipmentLabel = (() => {
    const selectedOptions = harvestPlanEquipmentInstanceIds
      .map((id) => harvestEquipmentOptions.find((option) => option.id === id))
      .filter(Boolean);
    if (!selectedOptions.length) return '미선택';
    if (selectedOptions.length <= 2) return selectedOptions.map((option) => option.label).join(', ');
    return `${selectedOptions[0].label} 외 ${selectedOptions.length - 1}대`;
  })();

  const harvestEquipmentModalCards = harvestEquipmentOptions.map((option) => {
    const optionInstance = resolveMachineInstanceById(option.id);
    const optionItem = optionInstance?.item || option?.item || MACHINE_ITEM_MAP?.[option.key] || EQUIPMENT_ITEM_MAP?.[option.key] || null;
    const optionIsCombustion = isCombustionMachineItem(optionItem);
    const optionIsElectric = isElectricMachineItem(optionItem);
    const optionFuelCap = optionIsElectric
      ? Math.max(0, electricBatteryCapacityKwhOfItem(optionItem))
      : Math.max(0, machineTankCapacityLitersOfItem(optionItem));
    const optionFuelCurrent = optionFuelCap > 0
      ? clamp(
        optionIsElectric
          ? electricBatteryKwhOfInstance(game, String(option.id || ''), optionItem)
          : machineFuelLitersOfInstance(game, String(option.id || ''), optionItem),
        0,
        optionFuelCap
      )
      : 0;
    const optionFuelRatio = optionFuelCap > 0
      ? clamp((optionFuelCurrent / optionFuelCap) * 100, 0, 100)
      : 0;
    const optionFuelTypeLabel = optionIsElectric ? '전기' : (machineFuelTypeLabelOf(optionItem?.fuelType) || '연료');
    const optionFuelToneClass = optionIsElectric
      ? 'is-electric'
      : String(optionItem?.fuelType || '').toLowerCase() === 'gasoline'
        ? 'is-gasoline'
        : String(optionItem?.fuelType || '').toLowerCase() === 'kerosene'
          ? 'is-kerosene'
          : 'is-diesel';
    const optionCanOpenFuelGauge = optionFuelCap > 0 && (optionIsCombustion || optionIsElectric);
    return {
      ...option,
      imageSrc: toolImageSrcOf(option.key),
      isLadder: option.key === ORCHARD_LADDER_KEY,
      durabilityText: `${Number(option.durability || 0).toFixed(1)}%`,
      seatText: option.key === ORCHARD_LADDER_KEY
        ? '1인 배정'
        : `${Math.max(1, Number(option?.item?.seatCount) || Number(MACHINE_ITEM_MAP?.[option.key]?.seatCount) || 1)}인 배정`,
      fuelGauge: optionCanOpenFuelGauge ? {
        isElectric: optionIsElectric,
        ratio: optionFuelRatio,
        toneClass: optionFuelToneClass,
        text: optionIsElectric
          ? `${optionFuelTypeLabel} ${optionFuelCurrent.toFixed(1)}kWh / ${optionFuelCap.toFixed(1)}kWh`
          : `${optionFuelTypeLabel} ${optionFuelCurrent.toFixed(1)}L / ${optionFuelCap.toFixed(1)}L`
      } : null,
      onOpenFuelGauge: () => {
        if (optionIsElectric) {
          return { type: 'electric', machineId: String(option.id || '') };
        }
        if (optionInstance && optionIsCombustion) {
          return { type: 'fuel', machineInstance: optionInstance };
        }
        return null;
      }
    };
  });

  const harvestSelectedLoadBoxSelectionIds = (
    Array.isArray(harvestPlanLoadBoxSelections) && harvestPlanLoadBoxSelections.length
      ? harvestPlanLoadBoxSelections
      : ((harvestPlanLoadBoxKey && harvestPlanLoadBoxSourceType)
        ? [harvestLoadBoxSelectionIdOf(harvestPlanLoadBoxKey, harvestPlanLoadBoxSourceType)]
        : [])
  ).map((id) => String(id || '')).filter(Boolean);

  const harvestSelectedLoadBoxOptionList = harvestLoadBoxOptions.filter((option) =>
    harvestSelectedLoadBoxSelectionIds.includes(harvestLoadBoxSelectionIdOf(option))
  );
  const harvestSelectedLoadBoxOption = harvestSelectedLoadBoxOptionList[0] || null;

  const harvestSelectedLoadBoxSourceTypeSet = new Set(
    harvestSelectedLoadBoxSelectionIds
      .map((selectionId) => String(selectionId || '').split('::')[1] || '')
      .filter(Boolean)
  );
  if (String(harvestPlanLoadBoxSourceType || '')) {
    harvestSelectedLoadBoxSourceTypeSet.add(String(harvestPlanLoadBoxSourceType || ''));
  }

  const harvestSelectedLoadBoxFromCurrentField = harvestSelectedLoadBoxOptionList.some((option) =>
    String(option?.sourceType || 'stock') === 'applied'
  ) || harvestSelectedLoadBoxSourceTypeSet.has('applied');

  const harvestSelectedLoadBoxFallbackQty = (() => {
    const fallbackKey = String(harvestPlanLoadBoxKey || harvestSelectedLoadBoxOption?.key || '');
    if (!fallbackKey || harvestSelectedLoadBoxOptionList.length <= 0) return 0;
    const sourceKeys = Array.from(harvestLoadBoxSourceKeysByKey[fallbackKey] || new Set([fallbackKey])).filter(Boolean);
    if (harvestSelectedLoadBoxFromCurrentField) {
      return sourceKeys.reduce(
        (sum, sourceKey) => sum + Math.max(0, Math.floor(Number(appleContainerAppliedUnitsOfField(selectedField, sourceKey)) || 0)),
        0
      );
    }
    return sourceKeys.reduce((sum, sourceKey) => (
      sum
      + Math.max(0, Math.floor(Number(harvestCurrentFieldWarehouseInventory?.[sourceKey]) || 0))
      + cargoItemStockOf(game, sourceKey, selectedField)
    ), 0);
  })();

  const harvestSelectedLoadBoxTotalQty = harvestSelectedLoadBoxOptionList.length
    ? harvestSelectedLoadBoxOptionList.reduce((sum, option) => sum + Math.max(0, Number(option?.qty) || 0), 0)
    : harvestSelectedLoadBoxFallbackQty;

  const harvestSelectedLoadBoxLabel = harvestSelectedLoadBoxOptionList.length
    ? (harvestSelectedLoadBoxOptionList.length === 1
      ? `${harvestSelectedLoadBoxOptionList[0].label} (${harvestSelectedLoadBoxOptionList[0].sourceLabel}, 보유 ${harvestSelectedLoadBoxOptionList[0].qty}개)`
      : `${harvestSelectedLoadBoxOptionList[0].label} 외 ${harvestSelectedLoadBoxOptionList.length - 1}종 (${harvestSelectedLoadBoxFromCurrentField ? '토지 도포' : '창고/차량'}, 합계 ${harvestSelectedLoadBoxTotalQty}개)`)
    : '미선택';

  const harvestHasSelectedLoadBox = harvestSelectedLoadBoxOptionList.length > 0;

  const harvestSelectedWorkerIdsByType = HARVEST_CREW_TYPE_KEYS.reduce((acc, key) => {
    const rosterIds = new Set((harvestWorkerRosterByType?.[key] || []).map((worker) => String(worker?.id || '')).filter(Boolean));
    acc[key] = (Array.isArray(harvestPlanSelectedWorkerIdsByType?.[key]) ? harvestPlanSelectedWorkerIdsByType[key] : [])
      .map((workerId) => String(workerId || ''))
      .filter((workerId) => rosterIds.has(workerId));
    return acc;
  }, {});

  const harvestSelectedWorkerMix = HARVEST_CREW_TYPE_KEYS.reduce((acc, key) => {
    acc[key] = harvestSelectedWorkerIdsByType?.[key]?.length || 0;
    return acc;
  }, { beginner: 0, worker: 0, skilledWorker: 0 });

  const harvestSelfWorkerSelected = Boolean(harvestPlanUseSelfLabor);

  const harvestWorkerEquipmentCards = (() => {
    const equipmentCards = harvestEquipmentOptions.flatMap((option) => {
      const seatCount = Math.max(1, Number(option?.item?.seatCount) || Number(MACHINE_ITEM_MAP?.[option.key]?.seatCount) || 1);
      const optionInstance = resolveMachineInstanceById(option.id);
      const optionItem = optionInstance?.item || option?.item || MACHINE_ITEM_MAP?.[option.key] || EQUIPMENT_ITEM_MAP?.[option.key] || null;
      const optionIsCombustion = isCombustionMachineItem(optionItem);
      const optionIsElectric = isElectricMachineItem(optionItem);
      const optionFuelCap = optionIsElectric
        ? Math.max(0, electricBatteryCapacityKwhOfItem(optionItem))
        : Math.max(0, machineTankCapacityLitersOfItem(optionItem));
      const optionFuelCurrent = optionFuelCap > 0
        ? clamp(
          optionIsElectric
            ? electricBatteryKwhOfInstance(game, String(option.id || ''), optionItem)
            : machineFuelLitersOfInstance(game, String(option.id || ''), optionItem),
          0,
          optionFuelCap
        )
        : 0;
      const optionFuelRatio = optionFuelCap > 0
        ? clamp((optionFuelCurrent / optionFuelCap) * 100, 0, 100)
        : 0;
      const optionFuelTypeLabel = optionIsElectric ? '전기' : (machineFuelTypeLabelOf(optionItem?.fuelType) || '연료');
      const optionFuelToneClass = optionIsElectric
        ? 'is-electric'
        : String(optionItem?.fuelType || '').toLowerCase() === 'gasoline'
          ? 'is-gasoline'
          : String(optionItem?.fuelType || '').toLowerCase() === 'kerosene'
            ? 'is-kerosene'
            : 'is-diesel';
      const optionCanOpenFuelGauge = optionFuelCap > 0 && (optionIsCombustion || optionIsElectric);
      return Array.from({ length: seatCount }, (_, seatIndex) => ({
        tokenId: `equipment:${option.id}:${seatIndex + 1}`,
        itemKey: option.key,
        equipmentInstanceId: option.id,
        imageSrc: toolImageSrcOf(option.key),
        displayLabel: harvestWorkerEquipmentShortLabelOf({ key: option.key, label: option.item?.name || option.label }),
        cardTitle: seatCount > 1 ? `${option.label} (${seatIndex + 1}/${seatCount})` : option.label,
        metaText: option.key === ORCHARD_LADDER_KEY
          ? '1인 배정 장비'
          : seatCount > 1
            ? `${seatCount}인 장비 좌석 ${seatIndex + 1}`
            : '1인 배정 장비',
        type: 'equipment',
        fuelGauge: optionCanOpenFuelGauge ? {
          isElectric: optionIsElectric,
          ratio: optionFuelRatio,
          current: optionFuelCurrent,
          capacity: optionFuelCap,
          toneClass: optionFuelToneClass,
          typeLabel: optionFuelTypeLabel
        } : null
      }));
    });

    const basketCards = harvestBasketOptions.flatMap((option) => {
      const basketCardCount = Math.max(1, Math.floor(Number(option.qty) || 0));
      return Array.from({ length: basketCardCount }, (_, index) => ({
        tokenId: `loadBox:${option.key}:${index + 1}`,
        itemKey: option.key,
        imageSrc: toolImageSrcOf(option.key),
        displayLabel: harvestWorkerEquipmentShortLabelOf({ key: option.key, label: option.label }),
        cardTitle: basketCardCount > 1 ? `${option.label} #${index + 1}` : option.label,
        metaText: `창고 ${option.warehouseQty}개 / 차량 ${option.parkedCargoQty}개`,
        type: 'loadBox'
      }));
    });

    return [...equipmentCards, ...basketCards];
  })();

  const harvestWorkerEquipmentCardMap = Object.fromEntries(
    harvestWorkerEquipmentCards.map((card) => [card.tokenId, card])
  );

  const harvestEffectiveWorkerEquipmentByWorkerId = (() => {
    const next = {};
    const mergeEntries = (source) => {
      Object.entries(source || {}).forEach(([workerId, tokenIds]) => {
        const safeWorkerId = String(workerId || '');
        if (!safeWorkerId) return;
        const mergedTokenIds = Array.from(new Set(
          (Array.isArray(next[safeWorkerId]) ? next[safeWorkerId] : [])
            .concat((Array.isArray(tokenIds) ? tokenIds : []).map((tokenId) => String(tokenId || '')).filter(Boolean))
        ));
        if (mergedTokenIds.length) next[safeWorkerId] = mergedTokenIds;
      });
    };
    mergeEntries(harvestPlanWorkerEquipmentByWorkerId);
    mergeEntries(harvestLockedWorkerEquipmentByWorkerId);
    return next;
  })();

  const harvestWorkerEquipmentOwnerByTokenId = Object.entries(harvestEffectiveWorkerEquipmentByWorkerId || {}).reduce((acc, [workerId, tokenIds]) => {
    (Array.isArray(tokenIds) ? tokenIds : []).forEach((tokenId) => {
      const safeTokenId = String(tokenId || '');
      if (safeTokenId) acc[safeTokenId] = String(workerId || '');
    });
    return acc;
  }, {});

  const harvestSelfWorkerAssignedCards = (harvestEffectiveWorkerEquipmentByWorkerId?.[HARVEST_SELF_WORKER_ID] || [])
    .map((tokenId) => harvestWorkerEquipmentCardMap?.[tokenId] || null)
    .filter(Boolean);

  return {
    harvestTargetOptions,
    harvestFirstActiveTargetOption,
    harvestSelectedTargetOption,
    harvestAvailableWorkerMix,
    harvestEquipmentOptions,
    harvestLoadBoxOptions,
    harvestLoadBoxStockOptions,
    harvestLoadBoxAppliedOptions,
    harvestLoadBoxSelectionIdOf,
    harvestBasketOptions,
    harvestSelectedCropLabel,
    harvestSelectedTargetLabel,
    harvestSelectedEquipmentInstances,
    harvestSelectedEquipmentLabel,
    harvestEquipmentModalCards,
    harvestSelectedLoadBoxSelectionIds,
    harvestSelectedLoadBoxOptionList,
    harvestSelectedLoadBoxFromCurrentField,
    harvestSelectedLoadBoxTotalQty,
    harvestSelectedLoadBoxLabel,
    harvestHasSelectedLoadBox,
    harvestSelectedWorkerIdsByType,
    harvestSelectedWorkerMix,
    harvestSelfWorkerSelected,
    harvestWorkerEquipmentCards,
    harvestWorkerEquipmentCardMap,
    harvestEffectiveWorkerEquipmentByWorkerId,
    harvestWorkerEquipmentOwnerByTokenId,
    harvestSelfWorkerAssignedCards
  };
}

export function sumHarvestExternalLaborFromSelectedIds({
  selectedIdsByType = {},
  crewTypeKeys = [],
  workerRosterByType = {}
}) {
  return crewTypeKeys.reduce((sum, key) => {
    const selectedIdSet = new Set((selectedIdsByType?.[key] || []).map((workerId) => String(workerId || '')).filter(Boolean));
    const selectedWorkerLabor = (workerRosterByType?.[key] || [])
      .filter((worker) => selectedIdSet.has(String(worker?.id || '')))
      .reduce((acc, worker) => acc + Math.max(0, Math.floor(Number(worker?.labor) || 0)), 0);
    return sum + selectedWorkerLabor;
  }, 0);
}

export function buildHarvestWorkerSelectionState({
  selectedIdsByType = {},
  crewTypeKeys = [],
  useSelfLabor = false,
  availableSelfLabor = 0,
  availableWorkerMix = {},
  selfWorkerId,
  workerEquipmentByWorkerId = {},
  normalizeHarvestLaborPair,
  buildHarvestPlanLaborState,
  externalLaborFromSelectedIds
}) {
  const workerMix = crewTypeKeys.reduce((acc, key) => {
    acc[key] = Array.isArray(selectedIdsByType?.[key]) ? selectedIdsByType[key].length : 0;
    return acc;
  }, { beginner: 0, worker: 0, skilledWorker: 0 });

  const nextPlan = buildHarvestPlanLaborState({
    workerMix,
    useSelfLabor,
    availableSelfLabor: Math.max(0, Number(availableSelfLabor) || 0),
    availableByType: availableWorkerMix
  });
  const nextSelectedWorkerIds = new Set(crewTypeKeys.flatMap((key) => selectedIdsByType?.[key] || []));
  const nextWorkerEquipmentByWorkerId = Object.entries(workerEquipmentByWorkerId || {}).reduce((acc, [workerId, tokenIds]) => {
    const safeWorkerId = String(workerId || '');
    if (safeWorkerId === String(selfWorkerId || '')) {
      if (!nextPlan.useSelfLabor) return acc;
    } else if (!nextSelectedWorkerIds.has(safeWorkerId)) {
      return acc;
    }
    const filtered = (Array.isArray(tokenIds) ? tokenIds : []).filter(Boolean);
    if (filtered.length) acc[safeWorkerId] = filtered;
    return acc;
  }, {});

  const selectedExternalLabor = externalLaborFromSelectedIds(selectedIdsByType);
  const normalizedLabor = normalizeHarvestLaborPair({
    selfLabor: selectedExternalLabor > 0 ? 0 : nextPlan.selfLabor,
    externalLabor: selectedExternalLabor,
    useSelfLabor: nextPlan.useSelfLabor,
    preserve: 'external'
  });
  const nextExternalLabor = Math.max(
    0,
    Math.min(
      Math.floor(Number(selectedExternalLabor) || 0),
      selectedExternalLabor
    )
  );

  return {
    selectedWorkerIdsByType: selectedIdsByType,
    workerMix: nextPlan.workerMix,
    useSelfLabor: nextPlan.useSelfLabor,
    simpleWorkers: nextPlan.simpleWorkers,
    targetWorkPoints: normalizedLabor.selfLabor + nextExternalLabor,
    selfLabor: normalizedLabor.selfLabor,
    externalLabor: nextExternalLabor,
    pressedEquipmentTokenId: '',
    draggingEquipmentTokenId: '',
    workerEquipmentByWorkerId: nextWorkerEquipmentByWorkerId
  };
}

export function buildToggledHarvestWorkerSelectionIds({
  typeKey,
  workerId,
  selectedIdsByType = {}
}) {
  const safeWorkerId = String(workerId || '');
  if (!safeWorkerId) return null;
  const nextSelectedIdsByType = {
    beginner: [...(selectedIdsByType?.beginner || [])],
    worker: [...(selectedIdsByType?.worker || [])],
    skilledWorker: [...(selectedIdsByType?.skilledWorker || [])]
  };
  const currentIds = new Set(nextSelectedIdsByType[typeKey] || []);
  if (currentIds.has(safeWorkerId)) {
    nextSelectedIdsByType[typeKey] = nextSelectedIdsByType[typeKey].filter((id) => id !== safeWorkerId);
  } else {
    nextSelectedIdsByType[typeKey] = [...nextSelectedIdsByType[typeKey], safeWorkerId];
  }
  return nextSelectedIdsByType;
}

export function buildToggledHarvestSelfWorkerLaborState({
  selfWorkerSelected = false,
  gameLabor = 0,
  externalLabor = 0
}) {
  const nextUseSelfLabor = !selfWorkerSelected;
  return {
    selfLabor: selfWorkerSelected
      ? 0
      : Math.max(0, Math.floor(Number(gameLabor) || 0)),
    externalLabor,
    useSelfLabor: nextUseSelfLabor
  };
}

export function buildHarvestTransportWorkerSelectionState({
  selectedIdsByType = {},
  harvestWorkerRosterByType = {},
  crewTypeKeys = [],
  useSelfLabor = false,
  gameLabor = 0
}) {
  const selectedWorkerIdsByType = crewTypeKeys.reduce((acc, key) => {
    const rosterIds = new Set((harvestWorkerRosterByType?.[key] || []).map((worker) => String(worker?.id || '')).filter(Boolean));
    acc[key] = (Array.isArray(selectedIdsByType?.[key]) ? selectedIdsByType[key] : [])
      .map((workerId) => String(workerId || ''))
      .filter((workerId) => rosterIds.has(workerId));
    return acc;
  }, {});

  const selectedWorkerMix = crewTypeKeys.reduce((acc, key) => {
    acc[key] = selectedWorkerIdsByType?.[key]?.length || 0;
    return acc;
  }, { beginner: 0, worker: 0, skilledWorker: 0 });

  const selectedExternalWorkerIds = crewTypeKeys.flatMap((key) => selectedWorkerIdsByType?.[key] || []);
  const selectedExternalLaborCap = sumHarvestExternalLaborFromSelectedIds({
    selectedIdsByType: selectedWorkerIdsByType,
    crewTypeKeys,
    workerRosterByType: harvestWorkerRosterByType
  });
  const selectedSelfLaborCap = useSelfLabor
    ? Math.max(0, Number(gameLabor) || 0)
    : 0;

  return {
    selectedWorkerIdsByType,
    selectedWorkerMix,
    selectedExternalWorkerIds,
    selectedExternalLaborCap,
    selectedSelfLaborCap,
    selectedLaborCap: selectedSelfLaborCap + selectedExternalLaborCap
  };
}

export function buildHarvestSelectionContext({
  options,
  game,
  selectedField,
  crewTypeKeys,
  activeWorkersByType,
  totalCrewCountOfTypes,
  externalLaborRemaining,
  findHarvestTargetRow,
  treeAgeYear,
  resolveMachineInstanceById,
  harvestSelfWorkerId,
  harvestPlanLoadBoxKey,
  harvestPlanLoadBoxSourceType,
  harvestPlanLoadBoxConfirmed,
  harvestPlanLaborConfirmed,
  harvestLoadBoxOptions,
  harvestLoadBoxSelectionIdOf,
  itemNameByKey,
  isUnderRepair,
  aerialMachineKeys,
  isCombustionMachineItem
}) {
  const harvestStage = String(options?.stage || 'auto');
  const selectedSelfLabor = Math.max(0, Math.floor(Number(options?.selfLabor) || 0));
  const selectedSimpleWorkers = Math.max(0, Math.floor(Number(options?.simpleWorkers) || 0));
  const selectedExternalLabor = Math.max(0, Math.floor(Number(options?.externalLabor) || 0));
  const availableSimpleWorkers = totalCrewCountOfTypes(activeWorkersByType(game, game.day), crewTypeKeys);

  if (selectedSimpleWorkers > availableSimpleWorkers) {
    return { ok: false, reason: `수확 가능한 외부인력이 부족합니다. (선택 ${selectedSimpleWorkers}명 / 보유 ${availableSimpleWorkers}명)` };
  }
  if (externalLaborRemaining < selectedExternalLabor) {
    return { ok: false, reason: `외부노동력이 부족합니다. (필요 ${selectedExternalLabor})` };
  }

  const suppliedWorkPoints = selectedSelfLabor + selectedExternalLabor;
  if (suppliedWorkPoints <= 0) return { ok: false, reason: '투입 인력이 없습니다.' };
  if (selfLaborAvailable(game) < selectedSelfLabor) return { ok: false, reason: `자가노동력이 부족합니다. (필요 ${selectedSelfLabor})` };
  if (!selectedField.cropId) return { ok: false, reason: '식재된 작물이 없습니다.' };

  const availableCropIds = Array.from(
    new Set(
      (Array.isArray(selectedField?.plantLots) ? selectedField.plantLots : [])
        .map((lot) => String(lot?.cropId || ''))
        .filter(Boolean)
    )
  );
  if (!availableCropIds.length && selectedField?.cropId) {
    availableCropIds.push(String(selectedField.cropId));
  }

  const selectedCropId = String(options?.cropId || selectedField.cropId || '');
  if (selectedCropId && !availableCropIds.includes(selectedCropId)) {
    return { ok: false, reason: '현재 토지에서 수확 가능한 품종이 아닙니다.' };
  }

  const selectedAgeYear = Math.max(0, Math.floor(Number(options?.ageYear) || 0));
  const selectedHarvestRow = findHarvestTargetRow(selectedField, game.day, selectedCropId, selectedAgeYear);
  if (!selectedHarvestRow) return { ok: false, reason: '수확할 품종/년생을 선택해 주세요.' };

  const ageYear = Math.max(1, Math.floor(Number(selectedHarvestRow?.ageYear) || treeAgeYear(selectedField, game.day)));
  if (selectedField.growth < 90) {
    return { ok: false, reason: '아직 수확 가능한 상태가 아닙니다. 결실 90% 이상이 필요합니다.' };
  }

  const selectedEquipmentInstanceIds = Array.from(
    new Set(
      (Array.isArray(options?.equipmentInstanceIds) ? options.equipmentInstanceIds : [options?.equipmentInstanceId])
        .map((value) => String(value || ''))
        .filter(Boolean)
    )
  );
  const selectedEquipmentInstances = selectedEquipmentInstanceIds
    .map((instanceId) => resolveMachineInstanceById(instanceId))
    .filter(Boolean);

  const selectedExternalWorkerIdsForSpend = Array.from(
    new Set(
      (Array.isArray(options?.workerAssignmentEntries) ? options.workerAssignmentEntries : [])
        .filter((entry) => String(entry?.id || '') !== harvestSelfWorkerId)
        .filter((entry) => Math.max(0, Math.floor(Number(entry?.labor) || 0)) > 0)
        .map((entry) => String(entry?.id || ''))
        .filter(Boolean)
    )
  );

  const activeAssignedEquipmentInstanceIdSet = new Set(
    (Array.isArray(options?.workerAssignmentEntries) ? options.workerAssignmentEntries : [])
      .flatMap((entry) => Array.isArray(entry?.assignedEquipmentInstanceIds) ? entry.assignedEquipmentInstanceIds : [])
      .map((value) => String(value || ''))
      .filter(Boolean)
  );
  const activeAssignedEquipmentInstances = selectedEquipmentInstances.filter((equipment) =>
    activeAssignedEquipmentInstanceIdSet.has(String(equipment?.id || ''))
  );

  const selectedLoadBoxSelectionIds = Array.from(new Set(
    (
      Array.isArray(options?.loadBoxSelectionIds) && options.loadBoxSelectionIds.length
        ? options.loadBoxSelectionIds
        : ((options?.loadBoxKey || harvestPlanLoadBoxKey)
          ? [harvestLoadBoxSelectionIdOf(options?.loadBoxKey || harvestPlanLoadBoxKey, options?.loadBoxSourceType || harvestPlanLoadBoxSourceType || 'stock')]
          : [])
    ).map((value) => String(value || '')).filter(Boolean)
  ));
  if (!selectedLoadBoxSelectionIds.length) {
    return { ok: false, reason: '적재박스를 선택하고 확인하세요.' };
  }

  const selectedLoadBoxOptions = harvestLoadBoxOptions.filter((option) =>
    selectedLoadBoxSelectionIds.includes(harvestLoadBoxSelectionIdOf(option))
  );
  const selectedLoadBoxOption = selectedLoadBoxOptions[0] || null;
  const selectedLoadBoxKey = String(selectedLoadBoxOption?.key || '');
  const selectedLoadBoxSourceType = String(selectedLoadBoxOption?.sourceType || options?.loadBoxSourceType || harvestPlanLoadBoxSourceType || 'stock');
  const selectedLoadBoxQty = selectedLoadBoxOptions.reduce(
    (sum, option) => sum + Math.max(0, Math.floor(Number(option?.qty) || 0)),
    0
  );
  const selectedLoadBoxFromCurrentField = selectedLoadBoxOptions.some((option) =>
    String(option?.sourceType || 'stock') === 'applied'
  );
  if (selectedLoadBoxQty <= 0) return { ok: false, reason: '선택한 적재박스 재고가 부족합니다.' };
  if (!harvestPlanLaborConfirmed) return { ok: false, reason: '투입인력을 선택하고 확인하세요.' };

  const selectedLoadBoxLabel = selectedLoadBoxOptions.length
    ? (selectedLoadBoxOptions.length === 1
      ? `${String(itemNameByKey?.[selectedLoadBoxKey] || selectedLoadBoxKey)} (${selectedLoadBoxFromCurrentField ? '토지 도포' : '창고/차량'})`
      : `${String(itemNameByKey?.[selectedLoadBoxOptions[0]?.key] || selectedLoadBoxOptions[0]?.key || '적재박스')} 외 ${selectedLoadBoxOptions.length - 1}종 (${selectedLoadBoxFromCurrentField ? '토지 도포' : '창고/차량'})`)
    : '미선택';

  if (activeAssignedEquipmentInstances.some((equipment) => isUnderRepair(game, equipment.machineKey))) {
    return { ok: false, reason: '선택한 수확장비 중 수리 중인 장비가 있습니다.' };
  }

  const selectedEquipmentLabel = selectedEquipmentInstances.length
    ? selectedEquipmentInstances.map((equipment) => `${equipment.item?.name || equipment.machineKey} #${equipment.unitNo || 1}`).join(', ')
    : '미선택';

  const selectedHarvestAerialEquipment = activeAssignedEquipmentInstances.find((equipment) =>
    aerialMachineKeys.includes(String(equipment?.machineKey || ''))
    && isCombustionMachineItem(equipment?.item)
  ) || null;

  return {
    ok: true,
    harvestStage,
    selectedSelfLabor,
    selectedSimpleWorkers,
    selectedExternalLabor,
    suppliedWorkPoints,
    selectedCropId,
    selectedHarvestRow,
    ageYear,
    selectedEquipmentInstanceIds,
    selectedEquipmentInstances,
    selectedExternalWorkerIdsForSpend,
    activeAssignedEquipmentInstances,
    selectedLoadBoxSelectionIds,
    selectedLoadBoxOptions,
    selectedLoadBoxKey,
    selectedLoadBoxSourceType,
    selectedLoadBoxQty,
    selectedLoadBoxFromCurrentField,
    selectedLoadBoxLabel,
    selectedEquipmentLabel,
    selectedHarvestAerialEquipment
  };
}

export function buildHarvestExecutionAdjustedUsage({
  harvestExecutionPlan,
  selectedHarvestAerialEquipment,
  game,
  harvestAerialFuelLitersPerKg,
  selectedSelfLabor,
  selectedExternalLabor,
  harvestAerialFuelNeedLiters,
  machineFuelForWorkByKey,
  clamp
}) {
  let qty = Math.max(0, Number(harvestExecutionPlan?.qty) || 0);
  let partialHarvestFuelNotice = '';
  let partialHarvestByFuel = false;
  let partialHarvestFuelAvailableLiters = 0;
  const laborCapacityKg = Math.max(0, Number(harvestExecutionPlan?.laborCapacityKg) || 0);

  if (selectedHarvestAerialEquipment && harvestAerialFuelLitersPerKg > 0) {
    const aerialFuelState = machineFuelForWorkByKey(
      game,
      selectedHarvestAerialEquipment.machineKey,
      0
    );
    partialHarvestFuelAvailableLiters = Math.max(0, Number(aerialFuelState?.currentLiters) || 0);
    const maxQtyByFuel = Math.max(0, Math.floor(partialHarvestFuelAvailableLiters / harvestAerialFuelLitersPerKg));
    if (maxQtyByFuel <= 0) {
      return {
        ok: false,
        reason: '선택한 고소작업차 연료가 부족합니다.'
      };
    }
    if (maxQtyByFuel < qty) {
      qty = maxQtyByFuel;
      partialHarvestByFuel = true;
      partialHarvestFuelNotice = `고소작업차 연료가 부족해 연료 가능량만큼 부분 수확했습니다. (실제 수확 ${Math.round(qty)}kg)`;
    }
  }

  if (qty <= 0) {
    return {
      ok: false,
      reason: '현재 투입 조건으로 수확 가능한 물량이 없습니다.'
    };
  }

  const laborUseRatio = laborCapacityKg > 0
    ? clamp(qty / laborCapacityKg, 0, 1)
    : 1;
  const actualSelfLaborUsed = selectedSelfLabor > 0
    ? clamp(Math.ceil(selectedSelfLabor * laborUseRatio), 1, selectedSelfLabor)
    : 0;
  const actualExternalLaborUsed = selectedExternalLabor > 0
    ? clamp(Math.ceil(selectedExternalLabor * laborUseRatio), 1, selectedExternalLabor)
    : 0;
  const harvestAerialFuelNeed = selectedHarvestAerialEquipment
    ? Math.min(
      harvestAerialFuelNeedLiters(qty),
      partialHarvestFuelAvailableLiters > 0 ? partialHarvestFuelAvailableLiters : Infinity
    )
    : 0;

  return {
    ok: true,
    qty,
    laborCapacityKg,
    partialHarvestFuelNotice,
    partialHarvestByFuel,
    partialHarvestFuelAvailableLiters,
    actualSelfLaborUsed,
    actualExternalLaborUsed,
    harvestAerialFuelNeed
  };
}

export function buildHarvestExecutionState({
  selectedField,
  game,
  selectedCropId,
  ageYear,
  harvestStage,
  selectedSelfLabor,
  selectedSimpleWorkers,
  selectedExternalLabor,
  workerAssignmentEntries,
  selectedEquipmentInstances,
  selectedLoadBoxKey,
  selectedLoadBoxQty,
  selectedLoadBoxFromCurrentField,
  selectedLoadBoxOptions,
  selectedHarvestAerialEquipment,
  harvestAerialFuelLitersPerKg,
  harvestBoxCapacityKg,
  harvestAerialFuelNeedLiters,
  machineFuelForWorkByKey,
  harvestSeasonProgressOfTarget,
  harvestStageProgressOfSeasonState,
  harvestExecutionBreakdown,
  harvestWorkEfficiencyRatio,
  harvestLoadBoxSelectionIdOf,
  buildHarvestExecutionAdjustedUsage,
  buildHarvestLoadAllocationPlan,
  clamp,
  lowerStageKey,
  upperStageKey,
  nowTs
}) {
  const targetSeasonStateForStage = harvestSeasonProgressOfTarget(selectedField, game.day, selectedCropId, ageYear);
  const targetStageProgress = harvestStageProgressOfSeasonState(targetSeasonStateForStage);
  const stageRemainingQty = harvestStage === lowerStageKey
    ? targetStageProgress.lowerRemainingQty
    : (harvestStage === upperStageKey ? targetStageProgress.upperRemainingQty : null);
  const forceRequiresAccessEquipment = harvestStage === lowerStageKey
    ? false
    : (harvestStage === upperStageKey ? true : null);

  const harvestExecutionPlan = harvestExecutionBreakdown({
    field: selectedField,
    day: game.day,
    cropId: selectedCropId,
    ageYear,
    selfLabor: selectedSelfLabor,
    simpleWorkers: selectedSimpleWorkers,
    externalLabor: selectedExternalLabor,
    workerAssignmentEntries: Array.isArray(workerAssignmentEntries) ? workerAssignmentEntries : [],
    equipmentInstances: selectedEquipmentInstances,
    loadBoxKey: selectedLoadBoxKey,
    loadBoxAvailableQty: selectedLoadBoxQty,
    isCurrentFieldLoadBoxSelected: selectedLoadBoxFromCurrentField,
    inventory: game?.inventory || {},
    progressPct: clamp(Number(targetSeasonStateForStage.progressPct) || 0, 0, 100),
    stageRemainingQty,
    forceRequiresAccessEquipment,
    harvestStage,
    workEfficiencyRatio: harvestWorkEfficiencyRatio
  });

  const adjustedHarvestUsage = buildHarvestExecutionAdjustedUsage({
    harvestExecutionPlan,
    selectedHarvestAerialEquipment,
    game,
    harvestAerialFuelLitersPerKg,
    selectedSelfLabor,
    selectedExternalLabor,
    harvestAerialFuelNeedLiters,
    machineFuelForWorkByKey,
    clamp
  });
  if (!adjustedHarvestUsage.ok) return adjustedHarvestUsage;

  const {
    qty,
    partialHarvestFuelNotice,
    partialHarvestByFuel,
    actualSelfLaborUsed,
    actualExternalLaborUsed,
    harvestAerialFuelNeed
  } = adjustedHarvestUsage;

  const loadBoxUnitsUsed = Math.max(0, Math.ceil(Math.max(0, Number(qty) || 0) / Math.max(1, Number(harvestBoxCapacityKg) || 1)));
  const harvestLoadAllocationPlan = buildHarvestLoadAllocationPlan({
    selectedLoadBoxOptions,
    loadBoxUnitsUsed,
    qty,
    harvestBoxCapacityKg,
    harvestLoadBoxSelectionIdOf
  });
  if (!harvestLoadAllocationPlan.ok || !harvestLoadAllocationPlan.entries.length) {
    return {
      ok: false,
      reason: '선택한 적재박스로 수확 박스를 배정할 수 없습니다.'
    };
  }

  const safeNowTs = Math.max(0, Math.floor(Number(nowTs) || Date.now()));
  const harvestLoads = harvestLoadAllocationPlan.entries.map((entry, index) => ({
    id: `${selectedField.id}-${game.day}-${safeNowTs}-${index + 1}`,
    fieldName: selectedField.name,
    cropId: selectedCropId || selectedField.cropId,
    qty: Math.max(0, Number(entry?.qtyKg) || 0),
    quality: Math.round(selectedField.quality),
    loadBoxKey: normalizedHarvestLoadBoxKey(entry?.key),
    harvestedDay: game.day,
    stemRemoved: false
  }));

  return {
    ok: true,
    targetSeasonStateForStage,
    qty,
    partialHarvestFuelNotice,
    partialHarvestByFuel,
    actualSelfLaborUsed,
    actualExternalLaborUsed,
    harvestAerialFuelNeed,
    loadBoxUnitsUsed,
    harvestLoadAllocationPlan,
    harvestLoads
  };
}

export function buildHarvestLoadAllocationPlan({
  selectedLoadBoxOptions = [],
  loadBoxUnitsUsed = 0,
  qty = 0,
  harvestBoxCapacityKg,
  harvestLoadBoxSelectionIdOf
}) {
  const capacityKg = Math.max(1, Number(harvestBoxCapacityKg) || 1);
  const optionStates = selectedLoadBoxOptions.map((option, index) => ({
    selectionId: harvestLoadBoxSelectionIdOf(option),
    key: String(option?.key || ''),
    sourceType: String(option?.sourceType || 'stock'),
    sourceKeys: Array.isArray(option?.sourceKeys)
      ? option.sourceKeys.map((value) => String(value || '')).filter(Boolean)
      : [String(option?.key || '')].filter(Boolean),
    remainingUnits: Math.max(0, Math.floor(Number(option?.qty) || 0)),
    order: index
  })).filter((option) => option.key && option.remainingUnits > 0);

  if (!optionStates.length) return { ok: false, entries: [] };

  let remainUnits = Math.max(0, Math.floor(Number(loadBoxUnitsUsed) || 0));
  let cursor = 0;
  const perUnitAllocations = [];

  while (remainUnits > 0) {
    const nextIndex = optionStates.findIndex((option, index) =>
      index >= cursor && option.remainingUnits > 0
    );
    const fallbackIndex = optionStates.findIndex((option) => option.remainingUnits > 0);
    const selectedIndex = nextIndex >= 0 ? nextIndex : fallbackIndex;
    if (selectedIndex < 0) break;
    const selectedOption = optionStates[selectedIndex];
    selectedOption.remainingUnits = Math.max(0, selectedOption.remainingUnits - 1);
    perUnitAllocations.push({
      selectionId: selectedOption.selectionId,
      key: selectedOption.key,
      sourceType: selectedOption.sourceType,
      sourceKeys: selectedOption.sourceKeys
    });
    remainUnits -= 1;
    cursor = (selectedIndex + 1) % optionStates.length;
  }

  if (remainUnits > 0) return { ok: false, entries: [] };

  let remainQtyKg = Math.max(0, Number(qty) || 0);
  const allocationMap = new Map();
  perUnitAllocations.forEach((allocation, index) => {
    const allocatedKg = index === perUnitAllocations.length - 1
      ? remainQtyKg
      : Math.min(capacityKg, remainQtyKg);
    remainQtyKg = Math.max(0, remainQtyKg - allocatedKg);
    const allocationKey = `${allocation.selectionId}::${allocation.key}`;
    const current = allocationMap.get(allocationKey) || {
      selectionId: allocation.selectionId,
      key: allocation.key,
      sourceType: allocation.sourceType,
      sourceKeys: allocation.sourceKeys,
      unitsUsed: 0,
      qtyKg: 0
    };
    current.unitsUsed += 1;
    current.qtyKg += allocatedKg;
    allocationMap.set(allocationKey, current);
  });

  return {
    ok: remainQtyKg <= 0.001,
    entries: Array.from(allocationMap.values()).filter((entry) => entry.unitsUsed > 0 && entry.qtyKg > 0)
  };
}

export function buildHarvestFieldProgressState({
  field,
  prevDay,
  selectedCropId,
  ageYear,
  qty,
  harvestStage,
  selectedRowInState,
  nextAppliedLoadBoxMap,
  harvestAccessEquipmentProgressThreshold,
  fruitLoadMax,
  fruitLoadPerTreeForAgeRow,
  fieldFruitLoadPerTreeByRows,
  harvestQtyKgOfField,
  harvestQtyKgOfAgeRow,
  harvestSeasonProgressOfField,
  harvestSeasonProgressOfTarget,
  harvestTargetSeasonKey,
  normalizePestProfile,
  normalizeDiseaseProfile,
  pendingKgOfField,
  clamp,
  toDate
}) {
  const seasonState = harvestSeasonProgressOfField(field, prevDay);
  const targetSeasonState = harvestSeasonProgressOfTarget(field, prevDay, selectedCropId, ageYear);
  const targetRemainingQty = harvestQtyKgOfAgeRow(field, selectedRowInState, prevDay);
  if (targetRemainingQty <= 0) {
    return {
      ok: false
    };
  }

  const currentTargetLoad = clamp(Number(fruitLoadPerTreeForAgeRow(field, selectedRowInState, prevDay)) || 0, 0, fruitLoadMax);
  const nextTargetRemainingQty = Math.max(0, targetRemainingQty - qty);
  const nextTargetLoad = targetRemainingQty > 0
    ? clamp(currentTargetLoad * (nextTargetRemainingQty / targetRemainingQty), 0, fruitLoadMax)
    : 0;
  const nextFruitLoadReductionByAge = (() => {
    const ageKey = `${Math.max(1, Math.floor(Number(selectedRowInState?.ageYear) || 1))}`;
    const base = { ...(field?.fruitLoadReductionByAge || {}) };
    const harvestedLoadDelta = Math.max(0, currentTargetLoad - nextTargetLoad);
    if (harvestedLoadDelta <= 0) return base;
    return {
      ...base,
      [ageKey]: Math.max(0, Number(base?.[ageKey]) || 0) + harvestedLoadDelta
    };
  })();
  const nextFieldWithReduction = {
    ...field,
    fruitLoadReductionByAge: nextFruitLoadReductionByAge
  };
  const nextFruitLoadPerTree = fieldFruitLoadPerTreeByRows(nextFieldWithReduction, prevDay);
  const nextRemainingQty = harvestQtyKgOfField(
    {
      ...nextFieldWithReduction,
      fruitLoadPerTree: nextFruitLoadPerTree
    },
    prevDay
  );
  const nextSeasonInitialQtyKg = Math.max(seasonState.totalQty, seasonState.harvestedQty + seasonState.remainingQty);
  const nextSeasonHarvestedQtyKg = Math.max(0, nextSeasonInitialQtyKg - nextRemainingQty);
  const targetSeasonKey = harvestTargetSeasonKey(selectedCropId, ageYear);
  const nextTargetSeasonInitialQtyKg = Math.max(targetSeasonState.totalQty, targetSeasonState.harvestedQty + targetSeasonState.remainingQty);
  const nextTargetSeasonHarvestedQtyKg = Math.max(0, nextTargetSeasonInitialQtyKg - nextTargetRemainingQty);
  const nextTargetLowerHarvestedQtyKg = harvestStage === 'upper'
    ? Math.max(0, Number(field?.harvestSeasonLowerHarvestedQtyKgByTarget?.[targetSeasonKey]) || Number(targetSeasonState?.lowerHarvestedQty) || 0)
    : Math.min(
      Math.max(0, Math.round(nextTargetSeasonInitialQtyKg * (harvestAccessEquipmentProgressThreshold / 100))),
      Math.max(0, Number(field?.harvestSeasonLowerHarvestedQtyKgByTarget?.[targetSeasonKey]) || Number(targetSeasonState?.lowerHarvestedQty) || 0) + qty
    );
  const nextTargetUpperHarvestedQtyKg = harvestStage === 'upper'
    ? Math.min(
      Math.max(0, nextTargetSeasonInitialQtyKg - Math.max(0, Math.round(nextTargetSeasonInitialQtyKg * (harvestAccessEquipmentProgressThreshold / 100)))),
      Math.max(0, Number(field?.harvestSeasonUpperHarvestedQtyKgByTarget?.[targetSeasonKey]) || Number(targetSeasonState?.upperHarvestedQty) || 0) + qty
    )
    : Math.max(0, Number(field?.harvestSeasonUpperHarvestedQtyKgByTarget?.[targetSeasonKey]) || Number(targetSeasonState?.upperHarvestedQty) || 0);

  const harvestCompleted = nextRemainingQty <= 0.001 || nextFruitLoadPerTree <= 0.001;
  const updatedField = {
    ...field,
    growth: harvestCompleted ? 0 : field.growth,
    fruitLoadPerTree: harvestCompleted ? 0 : nextFruitLoadPerTree,
    fruitLoadReductionByAge: harvestCompleted ? {} : nextFruitLoadReductionByAge,
    pestOutbreak: harvestCompleted ? null : field.pestOutbreak,
    bloomInsecticidePenalty: harvestCompleted ? null : field.bloomInsecticidePenalty,
    ageTaskWorkedTreesByTask: harvestCompleted ? {} : (field.ageTaskWorkedTreesByTask || {}),
    pollinationFruitLoadBonusByAge: harvestCompleted ? {} : (field.pollinationFruitLoadBonusByAge || {}),
    pollinationFruitLoadBonus: harvestCompleted ? 0 : Math.max(0, Number(field.pollinationFruitLoadBonus) || 0),
    foliarQualityRecoveryMonthKey: harvestCompleted ? '' : String(field.foliarQualityRecoveryMonthKey || ''),
    foliarQualityRecoveryCountInMonth: harvestCompleted ? 0 : Math.max(0, Number(field.foliarQualityRecoveryCountInMonth) || 0),
    foliarQualityRecoveryPendingBonus: harvestCompleted ? 0 : Math.max(0, Number(field.foliarQualityRecoveryPendingBonus) || 0),
    appleContainerAppliedUnitsByItemKey: nextAppliedLoadBoxMap,
    lastHarvestYear: harvestCompleted ? toDate(prevDay).getFullYear() : field.lastHarvestYear,
    pestProfile: harvestCompleted ? normalizePestProfile(null, 10) : field.pestProfile,
    diseaseProfile: harvestCompleted ? normalizeDiseaseProfile(null, 10) : field.diseaseProfile,
    pest: harvestCompleted ? 10 : field.pest,
    quality: harvestCompleted ? 5 : field.quality,
    harvestSeasonInitialQtyKg: harvestCompleted ? 0 : nextSeasonInitialQtyKg,
    harvestSeasonHarvestedQtyKg: harvestCompleted ? 0 : nextSeasonHarvestedQtyKg,
    harvestSeasonInitialQtyKgByTarget: harvestCompleted
      ? {}
      : {
        ...(field?.harvestSeasonInitialQtyKgByTarget || {}),
        [targetSeasonKey]: nextTargetSeasonInitialQtyKg
      },
    harvestSeasonHarvestedQtyKgByTarget: harvestCompleted
      ? {}
      : {
        ...(field?.harvestSeasonHarvestedQtyKgByTarget || {}),
        [targetSeasonKey]: nextTargetSeasonHarvestedQtyKg
      },
    harvestSeasonLowerHarvestedQtyKgByTarget: harvestCompleted
      ? {}
      : {
        ...(field?.harvestSeasonLowerHarvestedQtyKgByTarget || {}),
        [targetSeasonKey]: nextTargetLowerHarvestedQtyKg
      },
    harvestSeasonUpperHarvestedQtyKgByTarget: harvestCompleted
      ? {}
      : {
        ...(field?.harvestSeasonUpperHarvestedQtyKgByTarget || {}),
        [targetSeasonKey]: nextTargetUpperHarvestedQtyKg
      },
    note: harvestCompleted
      ? `수확 완료(운반 대기 ${pendingKgOfField(field) + qty}kg)`
      : `수확 진행중 ${Math.round(nextSeasonHarvestedQtyKg).toLocaleString()} / ${Math.round(nextSeasonInitialQtyKg).toLocaleString()}kg (운반 대기 ${pendingKgOfField(field) + qty}kg)`,
    pendingLoads: [...(field.pendingLoads || [])]
  };

  return {
    ok: true,
    updatedField,
    harvestCompleted,
    nextRemainingQty,
    nextSeasonInitialQtyKg,
    nextSeasonHarvestedQtyKg
  };
}

export function buildHarvestLoadBoxConsumptionState({
  prev,
  field,
  selectedLoadBoxFromCurrentField,
  loadBoxUnitsUsed,
  harvestLoadAllocationPlan,
  nextInventoryForHarvest,
  nextVehicleCargoByInstanceForHarvest,
  nextFieldFacilityInventoryByFieldIdForHarvest,
  nextAppliedLoadBoxMap,
  totalItemStockWithCargoOf,
  consumeItemFromInventoryAndCargo
}) {
  if (selectedLoadBoxFromCurrentField) {
    let remainToConsume = Math.max(0, Math.floor(Number(loadBoxUnitsUsed) || 0));
    harvestLoadAllocationPlan.entries.forEach((entry) => {
      if (remainToConsume <= 0) return;
      let entryRemainUnits = Math.min(
        Math.max(0, Math.floor(Number(entry?.unitsUsed) || 0)),
        remainToConsume
      );
      const sourceKeys = Array.isArray(entry?.sourceKeys)
        ? entry.sourceKeys.map((value) => String(value || '')).filter(Boolean)
        : [String(entry?.key || '')].filter(Boolean);
      sourceKeys.forEach((sourceKey) => {
        if (entryRemainUnits <= 0) return;
        const appliedStock = Math.max(0, Math.floor(Number(nextAppliedLoadBoxMap?.[sourceKey]) || 0));
        if (appliedStock <= 0) return;
        const usedUnits = Math.min(appliedStock, entryRemainUnits);
        const remainApplied = Math.max(0, appliedStock - usedUnits);
        nextAppliedLoadBoxMap = {
          ...nextAppliedLoadBoxMap,
          [sourceKey]: remainApplied
        };
        if (remainApplied <= 0) delete nextAppliedLoadBoxMap[sourceKey];
        entryRemainUnits = Math.max(0, entryRemainUnits - usedUnits);
        remainToConsume = Math.max(0, remainToConsume - usedUnits);
      });
    });
    return {
      ok: remainToConsume <= 0,
      inventory: nextInventoryForHarvest,
      vehicleCargoByInstance: nextVehicleCargoByInstanceForHarvest,
      fieldFacilityInventoryByFieldId: nextFieldFacilityInventoryByFieldIdForHarvest,
      appliedLoadBoxMap: nextAppliedLoadBoxMap
    };
  }

  let remainToConsume = Math.max(0, Math.floor(Number(loadBoxUnitsUsed) || 0));
  for (const entry of harvestLoadAllocationPlan.entries) {
    if (remainToConsume <= 0) break;
    let needUnits = Math.min(
      Math.max(0, Math.floor(Number(entry?.unitsUsed) || 0)),
      remainToConsume
    );
    if (needUnits <= 0) continue;
    const sourceKeys = Array.isArray(entry?.sourceKeys)
      ? entry.sourceKeys.map((value) => String(value || '')).filter(Boolean)
      : [String(entry?.key || '')].filter(Boolean);
    for (const sourceKey of sourceKeys) {
      if (needUnits <= 0) break;
      const stockBySource = totalItemStockWithCargoOf(
        {
          ...prev,
          inventory: nextInventoryForHarvest,
          vehicleCargoByInstance: nextVehicleCargoByInstanceForHarvest
        },
        sourceKey,
        field
      );
      const consumeUnits = Math.min(needUnits, stockBySource);
      if (consumeUnits <= 0) continue;
      const consumedLoadBox = consumeItemFromInventoryAndCargo(
        prev,
        field,
        nextInventoryForHarvest,
        nextVehicleCargoByInstanceForHarvest,
        nextFieldFacilityInventoryByFieldIdForHarvest,
        sourceKey,
        consumeUnits
      );
      if (!consumedLoadBox.ok) {
        return {
          ok: false,
          inventory: nextInventoryForHarvest,
          vehicleCargoByInstance: nextVehicleCargoByInstanceForHarvest,
          fieldFacilityInventoryByFieldId: nextFieldFacilityInventoryByFieldIdForHarvest,
          appliedLoadBoxMap: nextAppliedLoadBoxMap
        };
      }
      nextInventoryForHarvest = consumedLoadBox.inventory;
      nextVehicleCargoByInstanceForHarvest = consumedLoadBox.vehicleCargoByInstance;
      nextFieldFacilityInventoryByFieldIdForHarvest = consumedLoadBox.fieldFacilityInventoryByFieldId;
      needUnits = Math.max(0, needUnits - consumeUnits);
      remainToConsume = Math.max(0, remainToConsume - consumeUnits);
    }
  }

  return {
    ok: remainToConsume <= 0,
    inventory: nextInventoryForHarvest,
    vehicleCargoByInstance: nextVehicleCargoByInstanceForHarvest,
    fieldFacilityInventoryByFieldId: nextFieldFacilityInventoryByFieldIdForHarvest,
    appliedLoadBoxMap: nextAppliedLoadBoxMap
  };
}

export function buildHarvestWearState({
  prev,
  selectedEquipmentInstances,
  machineParkingInstanceId,
  MACHINE_ITEM_MAP,
  EQUIPMENT_ITEM_MAP,
  ORCHARD_LADDER_KEY,
  applyEquipmentUseWear
}) {
  const harvestWearMap = selectedEquipmentInstances.reduce((acc, equipment) => {
    const machineKey = String(equipment?.machineKey || '');
    const unitNo = Math.max(1, Number(equipment?.unitNo) || 1);
    const instanceId = machineParkingInstanceId(machineKey, unitNo);
    const item = equipment?.item || MACHINE_ITEM_MAP?.[machineKey] || EQUIPMENT_ITEM_MAP?.[machineKey];
    acc[instanceId] = machineKey === ORCHARD_LADDER_KEY
      ? 0.08
      : Math.max(0.08, (Number(item?.usageWear) || 0.16) * 0.65);
    return acc;
  }, {});

  const wearApplied = Object.keys(harvestWearMap).length > 0
    ? applyEquipmentUseWear(prev, harvestWearMap)
    : {
        equipmentDurability: prev.equipmentDurability,
        equipmentDurabilityByInstance: prev.equipmentDurabilityByInstance
      };

  return {
    harvestWearMap,
    equipmentDurability: wearApplied.equipmentDurability,
    equipmentDurabilityByInstance: wearApplied.equipmentDurabilityByInstance
  };
}

export function buildHarvestMachineFuelState({
  prev,
  selectedHarvestAerialEquipment,
  harvestAerialFuelNeed,
  consumeMachineFuelForWorkByKey
}) {
  let nextMachineFuelByInstance = { ...(prev?.machineFuelByInstance || {}) };
  if (selectedHarvestAerialEquipment && harvestAerialFuelNeed > 0) {
    const consumed = consumeMachineFuelForWorkByKey(
      { ...prev, machineFuelByInstance: nextMachineFuelByInstance },
      selectedHarvestAerialEquipment.machineKey,
      harvestAerialFuelNeed
    );
    if (!consumed.ok) {
      return {
        ok: false,
        nextMachineFuelByInstance
      };
    }
    nextMachineFuelByInstance = consumed.nextMachineFuelByInstance;
  }
  return {
    ok: true,
    nextMachineFuelByInstance
  };
}

export function formatHarvestExecutionLogText({
  fieldName,
  cropName,
  selectedCropId,
  fallbackCropId,
  ageYear,
  qty,
  harvestCompleted,
  nextRemainingQty,
  partialHarvestByFuel,
  growth,
  selectedEquipmentLabel,
  selectedLoadBoxLabel,
  selectedSelfLabor,
  selectedExternalLabor,
  selectedSimpleWorkers,
  actualSelfLaborUsed,
  actualExternalLaborUsed,
  harvestAerialFuelNeed
}) {
  return `${fieldName} ${cropName || selectedCropId || fallbackCropId} ${ageYear}년생 수확 ${qty}kg${harvestCompleted ? ' (수확 완료)' : ` (잔여 ${Math.round(nextRemainingQty)}kg)`}${partialHarvestByFuel ? ' (연료 부족 부분 수확)' : ''} (${ageYear}년생 / 결실 ${Math.round(growth)}% / 수확장비 ${selectedEquipmentLabel} / 적재박스 ${selectedLoadBoxLabel} / 인력 자가 ${selectedSelfLabor} + 외부 ${selectedExternalLabor} (${selectedSimpleWorkers}명)) (실사용 자가 -${actualSelfLaborUsed}${actualExternalLaborUsed > 0 ? ` / 실사용 외부노동력 -${actualExternalLaborUsed}` : ''}${harvestAerialFuelNeed > 0 ? ` / 고소작업차 연료 -${harvestAerialFuelNeed.toFixed(2)}L` : ''})`;
}

export function buildHarvestResultState({
  prev,
  actualSelfLaborUsed,
  actualExternalLaborUsed,
  crewSpendState,
  nextInventoryForHarvest,
  nextVehicleCargoByInstanceForHarvest,
  nextFieldFacilityInventoryByFieldIdForHarvest,
  fields,
  harvestWearState,
  nextMachineFuelByInstance,
  logText,
  pushDiary
}) {
  return {
    ...prev,
    labor: (prev.labor - actualSelfLaborUsed),
    externalLaborRemaining: Math.max(0, (Number(prev.externalLaborRemaining) || 0) - actualExternalLaborUsed),
    crewRents: crewSpendState.crewRents,
    inventory: nextInventoryForHarvest,
    vehicleCargoByInstance: nextVehicleCargoByInstanceForHarvest,
    fieldFacilityInventoryByFieldId: nextFieldFacilityInventoryByFieldIdForHarvest,
    fields,
    equipmentDurability: harvestWearState.equipmentDurability,
    equipmentDurabilityByInstance: harvestWearState.equipmentDurabilityByInstance,
    machineFuelByInstance: nextMachineFuelByInstance,
    logs: pushDiary(prev, logText)
  };
}

export function buildHarvestApplyState({
  prev,
  selectedCropId,
  ageYear,
  qty,
  harvestStage,
  loadBoxUnitsUsed,
  harvestLoadAllocationPlan,
  harvestLoads,
  selectedLoadBoxFromCurrentField,
  selectedEquipmentInstances,
  selectedHarvestAerialEquipment,
  harvestAerialFuelNeed,
  selectedFieldName,
  cropName,
  selectedEquipmentLabel,
  selectedLoadBoxLabel,
  selectedSelfLabor,
  selectedExternalLabor,
  selectedSimpleWorkers,
  actualSelfLaborUsed,
  actualExternalLaborUsed,
  partialHarvestByFuel,
  crewSpendState,
  appleContainerAppliedUnitsByItemOfField,
  findHarvestTargetRow,
  buildHarvestLoadBoxConsumptionState,
  totalItemStockWithCargoOf,
  consumeItemFromInventoryAndCargo,
  buildHarvestFieldProgressState,
  harvestAccessEquipmentProgressThreshold,
  fruitLoadMax,
  fruitLoadPerTreeForAgeRow,
  fieldFruitLoadPerTreeByRows,
  harvestQtyKgOfField,
  harvestQtyKgOfAgeRow,
  harvestSeasonProgressOfField,
  harvestSeasonProgressOfTarget,
  harvestTargetSeasonKey,
  normalizePestProfile,
  normalizeDiseaseProfile,
  pendingKgOfField,
  clamp,
  toDate,
  buildHarvestWearState,
  machineParkingInstanceId,
  MACHINE_ITEM_MAP,
  EQUIPMENT_ITEM_MAP,
  ORCHARD_LADDER_KEY,
  applyEquipmentUseWear,
  buildHarvestMachineFuelState,
  consumeMachineFuelForWorkByKey,
  formatHarvestExecutionLogText,
  buildHarvestResultState,
  pushDiary
}) {
  const fields = [...prev.fields];
  const field = fields[prev.selectedField];
  let nextInventoryForHarvest = { ...(prev.inventory || {}) };
  let nextVehicleCargoByInstanceForHarvest = { ...(prev.vehicleCargoByInstance || {}) };
  let nextFieldFacilityInventoryByFieldIdForHarvest = { ...(prev.fieldFacilityInventoryByFieldId || {}) };
  let nextAppliedLoadBoxMap = appleContainerAppliedUnitsByItemOfField(field);
  const selectedRowInState = findHarvestTargetRow(field, prev.day, selectedCropId, ageYear);
  if (!selectedRowInState) {
    return { ok: false, reason: '수확 대상 정보를 다시 찾지 못했습니다. 품종/년생을 다시 선택해 주세요.' };
  }

  const harvestLoadBoxConsumptionState = buildHarvestLoadBoxConsumptionState({
    prev,
    field,
    selectedLoadBoxFromCurrentField,
    loadBoxUnitsUsed,
    harvestLoadAllocationPlan,
    nextInventoryForHarvest,
    nextVehicleCargoByInstanceForHarvest,
    nextFieldFacilityInventoryByFieldIdForHarvest,
    nextAppliedLoadBoxMap,
    totalItemStockWithCargoOf,
    consumeItemFromInventoryAndCargo
  });
  if (!harvestLoadBoxConsumptionState.ok) {
    return { ok: false, reason: '선택한 적재박스를 실제로 차감하지 못했습니다. 창고/차량 보유 수량을 다시 확인해 주세요.' };
  }

  nextInventoryForHarvest = harvestLoadBoxConsumptionState.inventory;
  nextVehicleCargoByInstanceForHarvest = harvestLoadBoxConsumptionState.vehicleCargoByInstance;
  nextFieldFacilityInventoryByFieldIdForHarvest = harvestLoadBoxConsumptionState.fieldFacilityInventoryByFieldId;
  nextAppliedLoadBoxMap = harvestLoadBoxConsumptionState.appliedLoadBoxMap;

  const harvestFieldProgressState = buildHarvestFieldProgressState({
    field,
    prevDay: prev.day,
    selectedCropId,
    ageYear,
    qty,
    harvestStage,
    selectedRowInState,
    nextAppliedLoadBoxMap,
    harvestAccessEquipmentProgressThreshold,
    fruitLoadMax,
    fruitLoadPerTreeForAgeRow,
    fieldFruitLoadPerTreeByRows,
    harvestQtyKgOfField,
    harvestQtyKgOfAgeRow,
    harvestSeasonProgressOfField,
    harvestSeasonProgressOfTarget,
    harvestTargetSeasonKey,
    normalizePestProfile,
    normalizeDiseaseProfile,
    pendingKgOfField,
    clamp,
    toDate
  });
  if (!harvestFieldProgressState.ok) {
    return { ok: false, reason: '현재 대상의 남은 수확량을 적용하지 못했습니다. 수확 대상이 이미 변경되었을 수 있습니다.' };
  }

  const {
    updatedField,
    harvestCompleted,
    nextRemainingQty
  } = harvestFieldProgressState;

  fields[prev.selectedField] = {
    ...updatedField,
    pendingLoads: [...(updatedField.pendingLoads || []), ...harvestLoads]
  };

  const harvestWearState = buildHarvestWearState({
    prev,
    selectedEquipmentInstances,
    machineParkingInstanceId,
    MACHINE_ITEM_MAP,
    EQUIPMENT_ITEM_MAP,
    ORCHARD_LADDER_KEY,
    applyEquipmentUseWear
  });

  const harvestMachineFuelState = buildHarvestMachineFuelState({
    prev,
    selectedHarvestAerialEquipment,
    harvestAerialFuelNeed,
    consumeMachineFuelForWorkByKey
  });
  if (!harvestMachineFuelState.ok) {
    return { ok: false, reason: '배정된 고소작업차 연료를 차감하지 못했습니다.' };
  }

  const harvestLogText = formatHarvestExecutionLogText({
    fieldName: selectedFieldName,
    cropName,
    selectedCropId,
    fallbackCropId: field.cropId,
    ageYear,
    qty,
    harvestCompleted,
    nextRemainingQty,
    partialHarvestByFuel,
    growth: field.growth,
    selectedEquipmentLabel,
    selectedLoadBoxLabel,
    selectedSelfLabor,
    selectedExternalLabor,
    selectedSimpleWorkers,
    actualSelfLaborUsed,
    actualExternalLaborUsed,
    harvestAerialFuelNeed
  });

  return {
    ok: true,
    nextState: buildHarvestResultState({
      prev,
      actualSelfLaborUsed,
      actualExternalLaborUsed,
      crewSpendState,
      nextInventoryForHarvest,
      nextVehicleCargoByInstanceForHarvest,
      nextFieldFacilityInventoryByFieldIdForHarvest,
      fields,
      harvestWearState,
      nextMachineFuelByInstance: harvestMachineFuelState.nextMachineFuelByInstance,
      logText: harvestLogText,
      pushDiary
    })
  };
}

export function buildHarvestTransportRequest({
  game,
  selectedField,
  selectedDestination,
  selectedDestinationRemainKg,
  selectedDestinationStorageMode = 'pallet',
  selectedPendingLoadKg,
  selectedPendingCardIds = [],
  pendingLoadBoxSummary = null,
  selectedDestinationPalletSlotNos = [],
  requiredPalletSlotCount = 0,
  harvestPalletCapacityKg = 720,
  harvestTransportSelectedEquipment,
  harvestTransportSelectedLaborCap,
  totalHarvestStorageCapacityKg,
  usedHarvestStorageKg,
  pendingKgOfField,
  harvestTransportLaborPerBox,
  harvestBoxCapacityKg,
  workEfficiencyRatio = 1,
  selectedDestinationPalletSlots = []
}) {
  const boxCapacityKg = Math.max(1, Number(harvestBoxCapacityKg) || 1);
  const selectedPendingCardIdList = (selectedPendingCardIds || []).map((id) => String(id || '')).filter(Boolean);
  const pendingCardById = new Map(
    (pendingLoadBoxSummary?.displayCards || []).map((card) => [String(card?.id || ''), card])
  );
  const cardUnitsOf = (card) => {
    const sourceUnits = Array.isArray(card?.sourceUnits) ? card.sourceUnits : [];
    if (sourceUnits.length) {
      return sourceUnits.map((unit) => ({
        sourceLoadToken: String(unit?.sourceLoadToken || unit?.sourceLoadId || ''),
        qtyKg: Math.max(0, Number(unit?.qtyKg) || 0)
      })).filter((unit) => unit.qtyKg > 0.0001 && unit.sourceLoadToken);
    }
    return [];
  };
  const selectedBoxUnits = selectedPendingCardIdList.flatMap((cardId) => {
    const card = pendingCardById.get(cardId) || null;
    return card ? cardUnitsOf(card) : [];
  }).filter((unit) => Math.max(0, Number(unit?.qtyKg) || 0) > 0.0001);
  if (!selectedBoxUnits.length) return { ok: false, reason: '옮길 박스를 다시 선택해 주세요.' };
  const pendingKg = Math.max(0, Number(selectedPendingLoadKg) || 0);
  if (pendingKg <= 0) return { ok: false, reason: '운반할 수확물이 없습니다.' };
  if (!selectedDestination) return { ok: false, reason: '운반 목적지를 선택해 주세요.' };
  if (selectedDestinationRemainKg <= 0) return { ok: false, reason: '선택한 목적지에 남은 적재 여유가 없습니다.' };
  const totalCapKg = totalHarvestStorageCapacityKg(game);
  const usedCapKg = usedHarvestStorageKg(game);
  const remainCapKg = Math.max(0, totalCapKg - usedCapKg);
  if (remainCapKg <= 0) {
    return { ok: false, reason: '저장 공간이 없습니다. 창고/보관소를 늘리거나 기존 저장 수확물을 판매해 주세요.' };
  }
  if (!harvestTransportSelectedEquipment) return { ok: false, reason: '운반 장비를 선택해 주세요.' };
  const selectedPalletSlotMap = new Map(
    (selectedDestinationPalletSlots || [])
      .map((slot) => [Math.max(1, Math.floor(Number(slot?.slotNo) || 0)), slot])
  );
  const chosenSlotNos = Array.from(new Set((selectedDestinationPalletSlotNos || [])
    .map((slotNo) => Math.max(1, Math.floor(Number(slotNo) || 0)))
    .filter(Boolean)));
  const selectedPalletSlotCount = chosenSlotNos.length;
  const isSelectablePalletSlot = (slot) => Boolean(
    slot
    && Math.max(0, Number(slot?.remainKg) || 0) > 0
  );
  const chosenTargetSlots = chosenSlotNos
    .map((slotNo) => selectedPalletSlotMap.get(slotNo) || null)
    .filter(Boolean);
  const floorTargetSlotCount = chosenTargetSlots.filter((slot) => (
    isHarvestTransportFloorTargetSlot(selectedDestination, slot)
  )).length;
  const targetUsesFloorStorage = floorTargetSlotCount > 0;
  if (floorTargetSlotCount > 0 && floorTargetSlotCount !== chosenTargetSlots.length) {
    return { ok: false, reason: '바닥 적재칸과 팔레트 적재칸은 함께 선택할 수 없습니다.' };
  }
  const usePalletStorage = Boolean(
    selectedDestination?.supportsPalletSlots
    && selectedDestinationStorageMode !== 'general'
    && !targetUsesFloorStorage
  );
  if (
    selectedDestination?.supportsPalletSlots
    && selectedDestinationStorageMode !== 'general'
    && Math.max(0, Number(requiredPalletSlotCount) || 0) > 0
    && selectedPalletSlotCount <= 0
  ) {
    return { ok: false, reason: '적재할 팔레트를 1칸 이상 선택해 주세요.' };
  }
  const selectedSlotCapKg = (
    selectedDestination?.supportsPalletSlots
    && selectedPalletSlotCount > 0
  )
    ? (selectedDestinationPalletSlots || [])
      .filter((slot) => chosenSlotNos.includes(Number(slot?.slotNo)) && isSelectablePalletSlot(slot))
      .reduce((sum, slot) => sum + Math.max(0, Number(slot?.remainKg) || 0), 0)
    : Number.POSITIVE_INFINITY;
  const selectedSlotAvailableBoxCount = (
    selectedDestination?.supportsPalletSlots
    && selectedPalletSlotCount > 0
  )
    ? (selectedDestinationPalletSlots || [])
      .filter((slot) => chosenSlotNos.includes(Number(slot?.slotNo)) && isSelectablePalletSlot(slot))
      .reduce((sum, slot) => {
        const maxBoxes = Math.max(1, Math.floor(Number(slot?.maxBoxes) || 36));
        const filledBoxCount = Math.max(0, Math.floor(Number(slot?.filledBoxCount) || 0));
        return sum + Math.max(0, maxBoxes - filledBoxCount);
      }, 0)
    : Number.POSITIVE_INFINITY;
  const plannedMoveKg = Math.min(pendingKg, remainCapKg, selectedDestinationRemainKg, selectedSlotCapKg);
  if (plannedMoveKg <= 0) {
    return { ok: false, reason: '선택한 팔레트에 적재할 수 있는 수확물이 없습니다.' };
  }
  const laborPerBox = Math.max(0.01, Number(harvestTransportLaborPerBox) || 0.01);
  const safeWorkEfficiencyRatio = Math.max(0.01, Number(workEfficiencyRatio) || 1);
  const movableBoxCountByLabor = Math.max(
    0,
    Math.floor((Math.max(0, Number(harvestTransportSelectedLaborCap) || 0) * safeWorkEfficiencyRatio) / laborPerBox)
  );
  if (movableBoxCountByLabor <= 0) {
    return { ok: false, reason: '선택한 운반 인력으로 옮길 수 있는 상자가 없습니다.' };
  }
  const slotLimitedMoveKg = Number.isFinite(selectedSlotAvailableBoxCount)
    ? selectedBoxUnits
      .slice(0, Math.max(0, Math.floor(Number(selectedSlotAvailableBoxCount) || 0)))
      .reduce((sum, unit) => sum + Math.max(0, Number(unit?.qtyKg) || 0), 0)
    : Number.POSITIVE_INFINITY;
  const laborLimitedMoveKg = movableBoxCountByLabor * boxCapacityKg;
  const finalPlannedMoveKg = Math.min(plannedMoveKg, laborLimitedMoveKg, slotLimitedMoveKg);
  const laborNeed = Math.max(
    0.1,
    normalizeTransportLaborAmount((Math.ceil(finalPlannedMoveKg / boxCapacityKg) * laborPerBox) / safeWorkEfficiencyRatio)
  );
  return {
    ok: true,
    pendingKg,
    remainCapKg,
    plannedMoveKg: finalPlannedMoveKg,
    laborNeed
  };
}

export function buildHarvestTransportApplyState({
  prev,
  selectedDestination,
  selectedDestinationLabel,
  selectedDestinationRemainKg,
  selectedDestinationStorageMode = 'pallet',
  selectedDestinationPalletSlotNos = [],
  selectedDestinationPalletSlots = [],
  selectedPendingCardIds,
  pendingLoadBoxSummary,
  harvestTransportUseSelfLabor,
  harvestTransportSelectedExternalWorkerIds,
  harvestTransportSelectedExternalLaborCap = 0,
  harvestTransportSelectedEquipment,
  harvestTransportSelectedLaborCap,
  harvestTransportLaborPerBox,
  harvestBoxCapacityKg,
  workEfficiencyRatio = 1,
  totalHarvestStorageCapacityKg,
  usedHarvestStorageKg,
  splitLoadsByCapacity,
  spendExternalCrewLaborInState,
  resolveMachineInstanceById,
  shopItemsTool = [],
  applyEquipmentUseWear,
  harvestPalletCapacityKg = 720,
  laborText,
  pushDiary
}) {
  const fields = [...prev.fields];
  const field = fields[prev.selectedField];
  const safeWorkEfficiencyRatio = Math.max(0.01, Number(workEfficiencyRatio) || 1);
  const loads = field.pendingLoads || [];
  if (!loads.length) return { ok: false, reason: '운반 대기 중인 수확물이 없습니다.' };
  const selectedPendingCardIdList = (selectedPendingCardIds || []).map((id) => String(id || '')).filter(Boolean);
  const pendingCardById = new Map(
    (pendingLoadBoxSummary?.displayCards || []).map((card) => [String(card?.id || ''), card])
  );
  const orderedSelectedCardRows = selectedPendingCardIdList
    .map((cardId) => pendingCardById.get(cardId) || null)
    .filter(Boolean);
  if (!orderedSelectedCardRows.length) return { ok: false, reason: '옮길 박스를 다시 선택해 주세요.' };
  const currentCapKg = totalHarvestStorageCapacityKg(prev);
  const currentUsedKg = usedHarvestStorageKg(prev);
  const fieldFacilityCount = (facilityKeyRaw) => {
    const facilityKey = String(facilityKeyRaw || '');
    if (!facilityKey || !field) return 0;
    return Math.max(
      0,
      Number(field?.landFacilityCounts?.[facilityKey]) || (field?.landFacilities?.[facilityKey] ? 1 : 0)
    );
  };
  const storageFacilityKey = selectedDestination?.type === 'storage'
    ? String(selectedDestination?.facilityKey || '')
    : '';
  const storageFieldId = selectedDestination?.type === 'storage'
    ? String(field?.id || '')
    : '';
  const explicitStorageFacilityUnitIndex = selectedDestination?.type === 'storage'
    ? Math.max(0, Math.floor(Number(selectedDestination?.facilityUnitIndex) || 0))
    : 0;
  const derivedStorageFacilityUnitIndex = selectedDestination?.type === 'storage'
    ? (
      explicitStorageFacilityUnitIndex > 0
        ? explicitStorageFacilityUnitIndex
        : (fieldFacilityCount(storageFacilityKey) === 1 ? 1 : 0)
    )
    : 0;
  const storageFacilityUnitIndex = derivedStorageFacilityUnitIndex;
  const storageFacilityUnitKey = storageFacilityKey && storageFacilityUnitIndex > 0
    ? `${storageFacilityKey}::${storageFacilityUnitIndex}`
    : '';
  const storageFacilityLabel = selectedDestination?.type === 'storage'
    ? String(selectedDestination?.label || selectedDestinationLabel || '')
    : '';
  const storageVehicleInstanceId = selectedDestination?.type === 'carrier'
    ? String(selectedDestination?.vehicleInstanceId || '')
    : '';
  const supportsDestinationSlots = Boolean(
    selectedDestination?.supportsPalletSlots
    && (
      (selectedDestination?.type === 'storage' && storageFacilityKey)
      || (selectedDestination?.type === 'carrier' && storageVehicleInstanceId)
    )
  );
  const safePalletCapacityKg = Math.max(1, Number(harvestPalletCapacityKg) || 720);
  const chosenPalletSlotNos = supportsDestinationSlots
    ? Array.from(new Set((selectedDestinationPalletSlotNos || [])
      .map((slotNo) => Math.max(1, Math.floor(Number(slotNo) || 0)))
      .filter(Boolean))).sort((a, b) => a - b)
    : [];
  const selectedPalletSlotMap = new Map(
    (selectedDestinationPalletSlots || [])
      .map((slot) => [Math.max(1, Math.floor(Number(slot?.slotNo) || 0)), slot])
  );
  const isSelectablePalletSlot = (slot) => Boolean(
    slot
    && Math.max(0, Number(slot?.remainKg) || 0) > 0
  );
  const chosenTargetSlots = chosenPalletSlotNos
    .map((slotNo) => selectedPalletSlotMap.get(slotNo) || null)
    .filter(Boolean);
  const floorTargetSlotCount = chosenTargetSlots.filter((slot) => (
    isHarvestTransportFloorTargetSlot(selectedDestination, slot)
  )).length;
  const targetUsesFloorStorage = floorTargetSlotCount > 0;
  if (floorTargetSlotCount > 0 && floorTargetSlotCount !== chosenTargetSlots.length) {
    return { ok: false, reason: '바닥 적재칸과 팔레트 적재칸은 함께 선택할 수 없습니다.' };
  }
  const usePalletStorage = Boolean(
    supportsDestinationSlots
    && selectedDestinationStorageMode !== 'general'
    && !targetUsesFloorStorage
  );
  if (usePalletStorage && chosenPalletSlotNos.length <= 0) {
    return { ok: false, reason: '적재할 적재칸을 먼저 선택해 주세요.' };
  }
  const selectedSlotAvailableBoxCount = supportsDestinationSlots && chosenPalletSlotNos.length > 0
    ? chosenPalletSlotNos.reduce((sum, slotNo) => {
      const slot = selectedPalletSlotMap.get(slotNo) || null;
      if (!isSelectablePalletSlot(slot)) return sum;
      const maxBoxes = Math.max(1, Math.floor(Number(slot?.maxBoxes) || 36));
      const filledBoxCount = Math.max(0, Math.floor(Number(slot?.filledBoxCount) || 0));
      return sum + Math.max(0, maxBoxes - filledBoxCount);
    }, 0)
    : Number.POSITIVE_INFINITY;
  const selectedSlotRemainKg = supportsDestinationSlots && chosenPalletSlotNos.length > 0
    ? chosenPalletSlotNos.reduce((sum, slotNo) => {
      const slot = selectedPalletSlotMap.get(slotNo) || null;
      return sum + (isSelectablePalletSlot(slot) ? Math.max(0, Number(slot?.remainKg) || 0) : 0);
    }, 0)
    : Number.POSITIVE_INFINITY;
  const availableKg = Math.min(
    Math.max(0, currentCapKg - currentUsedKg),
    selectedDestinationRemainKg,
    selectedSlotRemainKg
  );
  if (availableKg <= 0) return { ok: false, reason: '선택한 목적지에 실제로 적재할 수 있는 여유가 없습니다.' };
  const boxCapacityKg = Math.max(1, Number(harvestBoxCapacityKg) || 1);
  const sourceLoadByToken = new Map(
    loads.map((load, loadIndex) => [
      `${String(load?.id || `pending-load-${loadIndex + 1}`)}::row:${loadIndex + 1}`,
      load
    ])
  );
  const selectedBoxUnits = orderedSelectedCardRows.flatMap((card) => {
    const sourceUnits = Array.isArray(card?.sourceUnits) ? card.sourceUnits : [];
    if (sourceUnits.length) {
      return sourceUnits.map((unit, index) => {
        const unitQtyKg = Math.max(0, Number(unit?.qtyKg) || 0);
        const tone = String(unit?.tone || card?.tone || '').toLowerCase() === 'green' ? 'green' : 'yellow';
        const fillStep = Math.max(
          1,
          Math.min(
            3,
            Math.floor(
              Number(unit?.fillStep)
              || Number(card?.fillStep)
              || (unitQtyKg > 0 ? Math.ceil((unitQtyKg / boxCapacityKg) * 3) : 3)
            )
          )
        );
        return {
          sourceLoadToken: String(unit?.sourceLoadToken || unit?.sourceLoadId || ''),
          unitId: String(unit?.unitId || `${String(card?.id || 'selected-card')}:${index + 1}`),
          qtyKg: unitQtyKg,
          tone,
          fillStep,
          imageItemKey: String(unit?.imageItemKey || card?.imageItemKey || ''),
          part: String(unit?.part || card?.part || '') === 'partial' ? 'partial' : 'full'
        };
      });
    }
    return [];
  }).filter((unit) => Math.max(0, Number(unit?.qtyKg) || 0) > 0.0001);
  if (!selectedBoxUnits.length) return { ok: false, reason: '옮길 박스를 다시 선택해 주세요.' };
  const laborPerBox = Math.max(0.01, Number(harvestTransportLaborPerBox) || 0.01);
  const availableSelfLabor = harvestTransportUseSelfLabor ? selfLaborAvailable(prev) : 0;
  const externalLaborPreview = spendExternalCrewLaborInState(
    prev,
    Math.max(0, Number(harvestTransportSelectedExternalLaborCap) || 0),
    harvestTransportSelectedExternalWorkerIds
  );
  const actualAvailableExternalLaborCap = Math.max(0, Number(externalLaborPreview?.spent) || 0);
  const actualAvailableLaborCap = availableSelfLabor + actualAvailableExternalLaborCap;
  const movableBoxCountByLabor = Math.max(
    0,
    Math.floor((actualAvailableLaborCap * safeWorkEfficiencyRatio) / laborPerBox)
  );
  if (movableBoxCountByLabor <= 0) return { ok: false, reason: '선택한 운반 인력으로 옮길 수 있는 상자가 없습니다.' };
  const allowedSelectedBoxUnits = [];
  let allowedSelectedBoxKg = 0;
  for (const unit of selectedBoxUnits) {
    if (allowedSelectedBoxUnits.length >= movableBoxCountByLabor) break;
    if (allowedSelectedBoxUnits.length >= selectedSlotAvailableBoxCount) break;
    const unitQtyKg = Math.max(0, Number(unit?.qtyKg) || 0);
    if (unitQtyKg <= 0.0001) continue;
    if (allowedSelectedBoxKg + unitQtyKg > availableKg + 0.0001) break;
    allowedSelectedBoxUnits.push(unit);
    allowedSelectedBoxKg = Math.round(((allowedSelectedBoxKg + unitQtyKg) + Number.EPSILON) * 10) / 10;
  }
  if (!allowedSelectedBoxUnits.length) return { ok: false, reason: '선택한 목적지에 실제로 적재할 수 있는 상자 칸이 부족합니다.' };
  if (allowedSelectedBoxUnits.some((unit) => !String(unit?.sourceLoadToken || ''))) {
    return { ok: false, reason: '운반할 상자 원본을 찾지 못했습니다. 운반창을 다시 열어 주세요.' };
  }
  const selectedQtyByLoadToken = allowedSelectedBoxUnits.reduce((acc, unit) => {
    const sourceLoadToken = String(unit?.sourceLoadToken || '');
    if (!sourceLoadToken) return acc;
    acc[sourceLoadToken] = Math.round((((acc[sourceLoadToken] || 0) + Math.max(0, Number(unit?.qtyKg) || 0)) + Number.EPSILON) * 10) / 10;
    return acc;
  }, {});
  const moved = [];
  const left = [];
  loads.forEach((load, loadIndex) => {
    const qty = Math.max(0, Number(load?.qty) || 0);
    if (qty <= 0) return;
    const sourceLoadToken = `${String(load?.id || `pending-load-${loadIndex + 1}`)}::row:${loadIndex + 1}`;
    const selectedQty = Math.min(qty, Math.max(0, Number(selectedQtyByLoadToken[sourceLoadToken] || 0)));
    const unselectedQty = Math.max(0, qty - selectedQty);
    if (selectedQty > 0) moved.push({ ...load, qty: selectedQty });
    if (unselectedQty > 0) {
      left.push({ ...load, qty: unselectedQty });
    }
  });
  const orderedMoved = allowedSelectedBoxUnits.map((unit, index) => {
    const sourceLoad = sourceLoadByToken.get(String(unit?.sourceLoadToken || '')) || null;
    const normalizedLoadBoxKey = normalizedHarvestLoadBoxKey(sourceLoad?.loadBoxKey || unit?.imageItemKey || '');
    return {
      ...(sourceLoad || {}),
      id: String(sourceLoad?.id || `selected-unit-${index + 1}`),
      qty: Math.max(0, Number(unit?.qtyKg) || 0),
      loadBoxKey: String(normalizedLoadBoxKey || ''),
      stemRemoved: typeof sourceLoad?.stemRemoved === 'boolean' ? sourceLoad.stemRemoved : false
    };
  }).filter((load) => Math.max(0, Number(load?.qty) || 0) > 0.0001);
  const movedKg = orderedMoved.reduce((sum, load) => sum + (Number(load?.qty) || 0), 0);
  if (movedKg <= 0) return { ok: false, reason: '선택한 박스를 현재 목적지로 운반할 수 없습니다.' };

  const actualLaborNeed = Math.max(
    0.1,
    normalizeTransportLaborAmount((Math.ceil(movedKg / boxCapacityKg) * laborPerBox) / safeWorkEfficiencyRatio)
  );
  const actualSelfLaborUsed = normalizeTransportLaborAmount(Math.min(availableSelfLabor, actualLaborNeed));
  const remainingAfterSelf = normalizeTransportLaborAmount(actualLaborNeed - actualSelfLaborUsed);
  const externalSpendResult = spendExternalCrewLaborInState(prev, remainingAfterSelf, harvestTransportSelectedExternalWorkerIds);
  const actualExternalLaborUsed = normalizeTransportLaborAmount(
    Math.min(remainingAfterSelf, Math.max(0, Number(externalSpendResult?.spent) || 0))
  );
  const actualSpentLabor = normalizeTransportLaborAmount(actualSelfLaborUsed + actualExternalLaborUsed);
  if (actualSpentLabor + 0.0001 < actualLaborNeed) {
    return { ok: false, reason: `운반 실행 시점 기준 인력이 부족합니다. (필요 ${actualLaborNeed})` };
  }

  const floorTargetSlotNo = supportsDestinationSlots ? Math.max(0, Number(chosenPalletSlotNos[0]) || 0) : 0;
  const storagePalletGroupId = usePalletStorage
    ? `harvest-pallet-${String(field?.id || prev.selectedField || 'field')}-${String(prev.day || 0)}-${Date.now()}`
    : '';
  const existingHarvestPalletStateBySlotNo = usePalletStorage
    ? (prev.storage || []).reduce((acc, batch) => {
      if (!batch?.palletized) return acc;
      const batchMatchesDestination = selectedDestination?.type === 'carrier'
        ? String(batch?.storageVehicleInstanceId || '') === storageVehicleInstanceId
        : String(batch?.storageFacilityKey || '') === storageFacilityKey;
      if (!batchMatchesDestination) return acc;
      const slotNo = selectedDestination?.type === 'carrier'
        ? Math.max(1, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0))
        : Math.max(1, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
      if (!slotNo) return acc;
      const qtyKg = Math.max(0, Number(batch?.qty) || 0);
      if (!acc[slotNo]) {
        acc[slotNo] = {
          loadedKg: 0,
          groupId: String(batch?.storagePalletGroupId || ''),
          palletNo: Math.max(1, Math.floor(Number(batch?.storagePalletNo) || slotNo))
        };
      }
      acc[slotNo].loadedKg += qtyKg;
      if (!acc[slotNo].groupId && batch?.storagePalletGroupId) acc[slotNo].groupId = String(batch.storagePalletGroupId);
      return acc;
    }, {})
    : {};
  let movedBatchSeq = 0;
  let currentPalletIndex = 0;
  let currentPalletNo = chosenPalletSlotNos[0] || 1;
  let currentPalletLoadKg = usePalletStorage
    ? Math.max(0, Number(existingHarvestPalletStateBySlotNo?.[currentPalletNo]?.loadedKg) || 0)
    : 0;
  let usedPalletCount = 0;
  const movedBatches = [];
  orderedMoved.forEach((load) => {
    movedBatchSeq += 1;
    const baseQtyKg = Math.max(0, Number(load?.qty) || 0);
    const baseBoxCount = Math.floor(baseQtyKg / boxCapacityKg);
    const baseRemainderKg = Math.round(((baseQtyKg - (baseBoxCount * boxCapacityKg)) + Number.EPSILON) * 10) / 10;
    const baseBatch = {
      ...load,
      id: `${String(load?.id || 'harvest-batch')}-stored-${String(prev.day || 0)}-${movedBatchSeq}`,
      life: 100,
      storedDay: Math.max(1, Math.floor(Number(prev.day) || 1)),
      storageFieldId,
      storageFacilityKey,
      storageFacilityUnitIndex,
      storageFacilityUnitKey,
      storageFacilityLabel,
      storageVehicleInstanceId,
      palletized: usePalletStorage,
      storageBoxCapacityKg: boxCapacityKg,
      storageBoxCount: baseBoxCount,
      storageRemainderKg: baseRemainderKg
    };
    let remainQty = Math.max(0, Number(load?.qty) || 0);
    if (remainQty <= 0) return;
    const appendIndependentStoredBoxBatch = ({
      qtyKg,
      palletNo = 0,
      slotNo = 0,
      palletLoadedKg = 0,
      palletGroupId = '',
      palletLayer = 1
    }) => {
      const safeQtyKg = Math.max(0, Math.round((Number(qtyKg) + Number.EPSILON) * 10) / 10);
      if (safeQtyKg <= 0) return;
      movedBatchSeq += 1;
      const entryBoxCount = safeQtyKg >= boxCapacityKg - 0.0001 ? 1 : 0;
      const entryRemainderKg = entryBoxCount > 0
        ? 0
        : Math.round((safeQtyKg + Number.EPSILON) * 10) / 10;
      const palletBoxCount = Math.floor(palletLoadedKg / boxCapacityKg);
      const palletRemainderKg = Math.round(((palletLoadedKg - (palletBoxCount * boxCapacityKg)) + Number.EPSILON) * 10) / 10;
      movedBatches.push({
        ...baseBatch,
        id: `${String(load?.id || 'harvest-batch')}-stored-${String(prev.day || 0)}-${movedBatchSeq}`,
        qty: safeQtyKg,
        storageBoxUnitNo: movedBatchSeq,
        storageBoxCount: entryBoxCount,
        storageRemainderKg: entryRemainderKg,
        storagePalletGroupId: palletGroupId,
        storagePalletNo: palletNo,
        storagePalletSlotNo: slotNo || palletNo,
        storagePalletLayer: palletNo > 0 ? palletLayer : 0,
        storagePalletCapacityKg: palletNo > 0 ? safePalletCapacityKg : 0,
        storagePalletLoadedKg: palletLoadedKg,
        storagePalletRemainingKg: palletNo > 0 ? Math.max(0, safePalletCapacityKg - palletLoadedKg) : 0,
        storagePalletBoxCount: palletBoxCount,
        storagePalletRemainderKg: palletRemainderKg,
        storageVehiclePalletSlotNo: storageVehicleInstanceId ? (slotNo || palletNo) : 0,
        storageVehiclePalletLayer: storageVehicleInstanceId ? (palletNo > 0 ? palletLayer : 0) : 0
      });
    };
    if (!usePalletStorage) {
      while (remainQty > 0) {
        const boxQty = Math.min(remainQty, boxCapacityKg);
        appendIndependentStoredBoxBatch({ qtyKg: boxQty, slotNo: floorTargetSlotNo });
        remainQty = Math.max(0, Math.round(((remainQty - boxQty) + Number.EPSILON) * 10) / 10);
      }
      return;
    }
    while (remainQty > 0) {
      while (usePalletStorage && currentPalletIndex < chosenPalletSlotNos.length) {
        currentPalletNo = chosenPalletSlotNos[currentPalletIndex] || (currentPalletIndex + 1);
        currentPalletLoadKg = Math.max(0, Number(existingHarvestPalletStateBySlotNo?.[currentPalletNo]?.loadedKg) || 0);
        if (currentPalletLoadKg < safePalletCapacityKg - 0.0001) break;
        currentPalletIndex += 1;
      }
      const palletRemainKg = Math.max(0, safePalletCapacityKg - currentPalletLoadKg) || safePalletCapacityKg;
      const chunkQty = Math.min(remainQty, palletRemainKg);
      if (chunkQty <= 0) break;
      const nextPalletGroupId = String(existingHarvestPalletStateBySlotNo?.[currentPalletNo]?.groupId || `${storagePalletGroupId}-${currentPalletNo}`);
      let remainChunkQty = chunkQty;
      while (remainChunkQty > 0) {
        const boxQty = Math.min(remainChunkQty, boxCapacityKg);
        currentPalletLoadKg += boxQty;
        appendIndependentStoredBoxBatch({
          qtyKg: boxQty,
          palletNo: currentPalletNo,
          palletLoadedKg: currentPalletLoadKg,
          palletGroupId: nextPalletGroupId,
          palletLayer: 1
        });
        remainChunkQty = Math.max(0, Math.round(((remainChunkQty - boxQty) + Number.EPSILON) * 10) / 10);
      }
      existingHarvestPalletStateBySlotNo[currentPalletNo] = {
        loadedKg: currentPalletLoadKg,
        groupId: nextPalletGroupId,
        palletNo: currentPalletNo
      };
      usedPalletCount = Math.max(usedPalletCount, currentPalletIndex + 1);
      remainQty = Math.max(0, Math.round(((remainQty - chunkQty) + Number.EPSILON) * 10) / 10);
      if (currentPalletLoadKg >= safePalletCapacityKg - 0.0001) {
        currentPalletIndex += 1;
        currentPalletNo = chosenPalletSlotNos[currentPalletIndex] || (currentPalletIndex + 1);
        currentPalletLoadKg = Math.max(0, Number(existingHarvestPalletStateBySlotNo?.[currentPalletNo]?.loadedKg) || 0);
      }
    }
  });
  usedPalletCount = usePalletStorage ? usedPalletCount : 0;
  if (usePalletStorage && chosenPalletSlotNos.length < usedPalletCount) {
    return { ok: false, reason: `선택한 팔레트가 부족합니다. (${usedPalletCount}칸 필요)` };
  }
  const movedBoxCount = Math.max(1, allowedSelectedBoxUnits.length);
  const remainPendingKg = left.reduce((sum, load) => sum + (Number(load?.qty) || 0), 0);
  fields[prev.selectedField] = {
    ...field,
    pendingLoads: left,
    note: field.cropId
      ? (remainPendingKg > 0 ? `수확 완료(운반 대기 ${remainPendingKg}kg)` : '생육 진행')
      : field.note
  };

  const selectedEquipmentKey = String(harvestTransportSelectedEquipment?.key || '');
  const realTransportMachineInstanceId = selectedEquipmentKey.startsWith('machine:')
    ? selectedEquipmentKey.replace(/^machine:/, '')
    : '';
  const realTransportToolKey = String(harvestTransportSelectedEquipment?.toolKey || '')
    || (selectedEquipmentKey.startsWith('tool:')
      ? selectedEquipmentKey.replace(/^tool:/, '').split(':')[0]
      : '');
  const realTransportMachine = realTransportMachineInstanceId
    ? resolveMachineInstanceById(realTransportMachineInstanceId)
    : null;
  const realTransportItem = realTransportMachine?.item
    || (realTransportToolKey ? (shopItemsTool.find((entry) => String(entry?.key || '') === realTransportToolKey) || null) : null);
  const realTransportWearKey = realTransportMachineInstanceId || realTransportToolKey;
  const moveWear = Math.max(0.16, Number(realTransportItem?.usageWear) || 0.22);
  const moveWearApplied = realTransportWearKey
    ? applyEquipmentUseWear(prev, { [realTransportWearKey]: moveWear })
    : {
        equipmentDurability: prev.equipmentDurability,
        equipmentDurabilityByInstance: prev.equipmentDurabilityByInstance
      };

  return {
    ok: true,
    transportAnimationMeta: {
      movedKg,
      movedBoxCount,
      boxCapacityKg,
      animationCards: allowedSelectedBoxUnits.map((unit) => ({
        tone: String(unit?.tone || '').toLowerCase() === 'green' ? 'green' : 'yellow',
        fillStep: Math.max(1, Math.min(3, Math.floor(Number(unit?.fillStep) || 3))),
        imageItemKey: String(unit?.imageItemKey || ''),
        qtyKg: Math.max(0, Number(unit?.qtyKg) || 0),
        part: String(unit?.part || '') === 'partial' ? 'partial' : 'full'
      }))
    },
    nextState: {
      ...prev,
      labor: (prev.labor - actualSelfLaborUsed),
      crewRents: externalSpendResult.crewRents,
      externalLaborRemaining: Math.max(0, (Number(prev.externalLaborRemaining) || 0) - actualExternalLaborUsed),
      fields,
      storage: [...movedBatches, ...(prev.storage || [])],
      equipmentDurability: moveWearApplied.equipmentDurability,
      equipmentDurabilityByInstance: moveWearApplied.equipmentDurabilityByInstance,
      logs: pushDiary(
        prev,
        `${field.name} 수확물 ${movedKg}kg 운반 → ${selectedDestinationLabel}${usePalletStorage ? ` / 팔레트 적재 ${usedPalletCount}개` : (floorTargetSlotNo > 0 ? ` / 적재칸 ${floorTargetSlotNo} 바닥 적재` : '')}${realTransportItem ? ` (${realTransportItem.name})` : ''}${remainPendingKg > 0 ? ` / 목적지 여유 부족으로 ${remainPendingKg}kg 대기` : ''} (자가 -${laborText(actualSelfLaborUsed)}${actualExternalLaborUsed > 0 ? ` / 외부 -${laborText(actualExternalLaborUsed)}` : ''})`
      )
    }
  };
}

export function buildHarvestBreakdownSection({
  breakdownPlan,
  stageKey,
  stageLabel,
  selfLabor,
  externalLabor,
  harvestWorkerRosterByType,
  harvestCrewTypeKeys,
  harvestSelfWorkerId,
  harvestPlanLoadBoxKey,
  harvestSelectedEquipmentInstances,
  harvestBoxCapacityKg,
  orchardLadderKey,
  harvestKgPerWorkPoint,
  harvestAerialKgBonusPerWorkPoint,
  harvestLoadBoxKgBonusPerLadderWorker,
  harvestWorkerAssignmentEntriesForLabor,
  harvestHasAccessEquipmentItemKey,
  harvestHasAerialEquipmentItemKey,
  harvestHasBasketItemKey,
  harvestSkillKgBonusPerWorkPointOf,
  harvestEquipmentEfficiencyMultiplierForEntry
}) {
  if (!breakdownPlan) return null;

  const harvestWorkerNameById = {
    [harvestSelfWorkerId]: '나',
    ...harvestCrewTypeKeys.reduce((acc, typeKey) => {
      (harvestWorkerRosterByType?.[typeKey] || []).forEach((worker) => {
        const workerId = String(worker?.id || '');
        if (!workerId) return;
        acc[workerId] = String(worker?.name || workerId);
      });
      return acc;
    }, {})
  };
  const breakdownRequiresAccessEquipment = Boolean(breakdownPlan?.requiresAccessEquipment);
  const breakdownWorkerEntries = harvestWorkerAssignmentEntriesForLabor(
    selfLabor,
    externalLabor,
    breakdownRequiresAccessEquipment
  );
  const zeroQtyReason = (Number(breakdownPlan?.qty) || 0) <= 0
    ? String(breakdownPlan?.reason || '')
    : '';
  const remainingQty = Math.max(0, Number(breakdownPlan?.remainingQty) || 0);
  const laborCapacityKg = Math.max(0, Number(breakdownPlan?.laborCapacityKg) || 0);
  const boxCapacityKg = Number(breakdownPlan?.boxCapacityKg);
  const finiteBoxCapacityKg = Number.isFinite(boxCapacityKg) ? Math.max(0, boxCapacityKg) : null;
  const candidates = [
    { label: '남은 수확량', value: remainingQty },
    { label: '노동력 계산 상한', value: laborCapacityKg }
  ];
  if (finiteBoxCapacityKg != null) candidates.push({ label: '박스 용량 상한', value: finiteBoxCapacityKg });
  const minValue = candidates.reduce((min, row) => Math.min(min, row.value), Number.POSITIVE_INFINITY);
  const limiterLabels = candidates
    .filter((row) => Math.abs(row.value - minValue) < 1e-6)
    .map((row) => row.label);

  const workerBreakdowns = breakdownWorkerEntries.length
    ? breakdownWorkerEntries.map((entry, index) => {
      const workerId = String(entry?.id || '');
      const workerName = harvestWorkerNameById[workerId] || workerId || '미확인';
      const laborPoints = Math.max(0, Number(entry?.labor) || 0);
      const itemKeys = new Set((Array.isArray(entry?.assignedItemKeys) ? entry.assignedItemKeys : []).map((key) => String(key || '')).filter(Boolean));
      const hasAccessEquipment = Array.from(itemKeys).some((itemKey) => harvestHasAccessEquipmentItemKey(itemKey));
      const hasAerialLift = Array.from(itemKeys).some((itemKey) => harvestHasAerialEquipmentItemKey(itemKey));
      const hasLadder = itemKeys.has(orchardLadderKey);
      const hasBasket = Array.from(itemKeys).some((itemKey) => harvestHasBasketItemKey(itemKey));
      const skillBonusPerWorkPoint = harvestSkillKgBonusPerWorkPointOf(entry?.workerType);
      const blockedByAccess = breakdownRequiresAccessEquipment && !hasAccessEquipment;
      const perPointBeforeMul = blockedByAccess
        ? 0
        : (
          harvestKgPerWorkPoint
          + Math.max(0, Number(breakdownPlan?.lowerStageBonusPerWorkPoint) || 0)
          + skillBonusPerWorkPoint
          + Math.max(0, Number(breakdownPlan?.currentFieldBoxBonusPerWorkPoint) || 0)
          + (hasAerialLift ? harvestAerialKgBonusPerWorkPoint : 0)
        );
      const workEfficiencyRatio = Math.max(0.01, Number(breakdownPlan?.workEfficiencyRatio) || 1);
      const equipmentMul = blockedByAccess
        ? 0
        : harvestEquipmentEfficiencyMultiplierForEntry(entry, harvestSelectedEquipmentInstances);
      const perPointFinal = blockedByAccess ? 0 : (perPointBeforeMul * workEfficiencyRatio * equipmentMul);
      const fixedBonusKg = (String(harvestPlanLoadBoxKey || '') && hasLadder && hasBasket)
        ? harvestLoadBoxKgBonusPerLadderWorker
        : 0;
      const estimatedWorkerQtyKg = (laborPoints * perPointFinal) + fixedBonusKg;
      const reasonParts = blockedByAccess
        ? ['접근장비 없음(현재 단계에서 작업 불가)']
        : [
          `기본 ${harvestKgPerWorkPoint.toFixed(1)}`,
          `하단 작업 +${Math.max(0, Number(breakdownPlan?.lowerStageBonusPerWorkPoint) || 0).toFixed(1)}`,
          `숙련도 +${skillBonusPerWorkPoint.toFixed(1)}`,
          `토지 도포 박스 +${Math.max(0, Number(breakdownPlan?.currentFieldBoxBonusPerWorkPoint) || 0).toFixed(1)}`,
          hasAerialLift ? `고소작업차 +${harvestAerialKgBonusPerWorkPoint.toFixed(1)}` : '고소작업차 +0.0',
          `현재 작업효율 x${workEfficiencyRatio.toFixed(3)}`,
          hasBasket ? '수확 바구니 배정' : '수확 바구니 미배정',
          fixedBonusKg > 0 ? `사다리+바구니 고정 +${fixedBonusKg.toFixed(1)}` : '사다리+바구니 고정 +0.0'
        ];
      return {
        id: workerId || `worker-${stageKey}-${index + 1}`,
        name: workerName,
        laborPoints,
        perPointFinal,
        estimatedWorkerQtyKg,
        fixedBonusKg,
        reasonText: `${reasonParts.join(' + ')} / 장비효율 x${equipmentMul.toFixed(2)}`,
        blockedByAccess
      };
    })
    : [];

  const projectedBoxCount = Math.ceil(Math.max(0, Number(breakdownPlan?.qty) || 0) / harvestBoxCapacityKg);
  return {
    key: stageKey,
    title: stageLabel,
    zeroQtyReason,
    summary: {
      qtyKg: Math.round(Number(breakdownPlan?.qty) || 0),
      boxCount: Math.max(0, projectedBoxCount),
      limiterText: limiterLabels.join(' + ') || '없음'
    },
    selectedWorkers: breakdownWorkerEntries.map((entry, index) => {
      const workerId = String(entry?.id || '');
      const workerName = harvestWorkerNameById[workerId] || workerId || '미확인';
      return {
        id: workerId || `selected-worker-${stageKey}-${index + 1}`,
        name: workerName,
        laborPoints: Math.max(0, Number(entry?.labor) || 0)
      };
    }),
    workerBreakdowns,
    final: {
      laborCapacityKg,
      boxCapacityKg: finiteBoxCapacityKg,
      remainingQtyKg: remainingQty,
      boxUnitsAvailable: Math.max(0, Math.floor(Number(breakdownPlan?.boxUnitsAvailable) || 0))
    }
  };
}

export function buildHarvestBreakdownModalData({
  preferredStage = 'auto',
  lowerRunPlan,
  upperRunPlan,
  lowerStageKey,
  upperStageKey,
  selfLabor,
  externalLabor,
  harvestWorkerRosterByType,
  harvestCrewTypeKeys,
  harvestSelfWorkerId,
  harvestPlanLoadBoxKey,
  harvestSelectedEquipmentInstances,
  harvestBoxCapacityKg,
  orchardLadderKey,
  harvestKgPerWorkPoint,
  harvestAerialKgBonusPerWorkPoint,
  harvestLoadBoxKgBonusPerLadderWorker,
  harvestWorkerAssignmentEntriesForLabor,
  harvestHasAccessEquipmentItemKey,
  harvestHasAerialEquipmentItemKey,
  harvestHasBasketItemKey,
  harvestSkillKgBonusPerWorkPointOf,
  harvestEquipmentEfficiencyMultiplierForEntry
}) {
  const requestedStage = String(preferredStage || 'auto');
  const buildSection = (breakdownPlan, stageKey, stageLabel) => buildHarvestBreakdownSection({
    breakdownPlan,
    stageKey,
    stageLabel,
    selfLabor,
    externalLabor,
    harvestWorkerRosterByType,
    harvestCrewTypeKeys,
    harvestSelfWorkerId,
    harvestPlanLoadBoxKey,
    harvestSelectedEquipmentInstances,
    harvestBoxCapacityKg,
    orchardLadderKey,
    harvestKgPerWorkPoint,
    harvestAerialKgBonusPerWorkPoint,
    harvestLoadBoxKgBonusPerLadderWorker,
    harvestWorkerAssignmentEntriesForLabor,
    harvestHasAccessEquipmentItemKey,
    harvestHasAerialEquipmentItemKey,
    harvestHasBasketItemKey,
    harvestSkillKgBonusPerWorkPointOf,
    harvestEquipmentEfficiencyMultiplierForEntry
  });

  const sections = requestedStage === lowerStageKey
    ? [buildSection(lowerRunPlan, lowerStageKey, '하단 작업 산출식')].filter(Boolean)
    : (requestedStage === upperStageKey
      ? [buildSection(upperRunPlan, upperStageKey, '상단 작업 산출식')].filter(Boolean)
      : [
        buildSection(lowerRunPlan, lowerStageKey, '하단 작업 산출식'),
        buildSection(upperRunPlan, upperStageKey, '상단 작업 산출식')
      ].filter(Boolean));

  if (!sections.length) {
    return {
      title: '수확 산출식',
      desc: '산출 근거를 계산할 수 없습니다.',
      sections: []
    };
  }

  return {
    title: '수확 산출식',
    desc: requestedStage === 'auto'
      ? '하단 작업과 상단 작업 산출식을 나눠 보여줍니다.'
      : '이번 작업 예상 수량이 계산된 근거입니다.',
    summary: {
      qtyKg: sections.reduce((sum, section) => sum + Math.max(0, Number(section?.summary?.qtyKg) || 0), 0),
      boxCount: sections.reduce((sum, section) => sum + Math.max(0, Number(section?.summary?.boxCount) || 0), 0),
      limiterText: requestedStage === 'auto'
        ? '하단/상단 단계별 확인'
        : (sections[0]?.summary?.limiterText || '없음')
    },
    sections
  };
}

export function buildHarvestExecutionRequest({
  stage,
  cropId,
  ageYear,
  equipmentInstanceIds,
  loadBoxKey,
  loadBoxSourceType,
  loadBoxSelectionIds,
  selfLabor,
  simpleWorkers,
  externalLabor,
  workerAssignmentEntriesForLabor,
  requireAccessEquipment = false
}) {
  return {
    stage,
    cropId,
    ageYear,
    equipmentInstanceIds,
    loadBoxKey,
    loadBoxSourceType,
    loadBoxSelectionIds,
    selfLabor,
    simpleWorkers,
    externalLabor,
    workerAssignmentEntries: workerAssignmentEntriesForLabor(
      selfLabor,
      externalLabor,
      requireAccessEquipment
    )
  };
}

export function buildEmptyHarvestWorkerSelectionIds() {
  return { beginner: [], worker: [], skilledWorker: [] };
}

export function buildHarvestPlanModalCloseResetState() {
  return {
    modalOpen: false,
    targetModalOpen: false,
    equipmentModalOpen: false,
    loadBoxModalOpen: false,
    laborModalOpen: false,
    loadBoxSelections: [],
    selectedWorkerIdsByType: buildEmptyHarvestWorkerSelectionIds(),
    workerEquipmentByWorkerId: {},
    pressedEquipmentTokenId: '',
    draggingEquipmentTokenId: '',
    modalClosing: false
  };
}

export function buildHarvestPlanModalOpenState({
  defaultLaborPlan,
  normalizedLabor,
  firstActiveTargetOption,
  targetOptions,
  selectedFieldCropId,
  harvestCropOptions
}) {
  return {
    modalOpen: true,
    targetModalOpen: false,
    equipmentModalOpen: false,
    loadBoxModalOpen: false,
    laborModalOpen: false,
    modalClosing: false,
    cropId: String(
      firstActiveTargetOption?.cropId
      || targetOptions?.[0]?.cropId
      || selectedFieldCropId
      || harvestCropOptions?.[0]
      || ''
    ),
    ageYear: Math.max(
      0,
      Math.floor(
        Number(firstActiveTargetOption?.ageYear)
        || targetOptions?.[0]?.ageYear
        || 0
      )
    ),
    equipmentInstanceIds: [],
    equipmentConfirmed: false,
    loadBoxKey: '',
    loadBoxSourceType: 'stock',
    loadBoxSelections: [],
    loadBoxConfirmed: false,
    useSelfLabor: Boolean(defaultLaborPlan?.useSelfLabor),
    workerMix: defaultLaborPlan?.workerMix || { beginner: 0, worker: 0, skilledWorker: 0 },
    selectedWorkerIdsByType: buildEmptyHarvestWorkerSelectionIds(),
    simpleWorkers: Math.max(0, Math.floor(Number(defaultLaborPlan?.simpleWorkers) || 0)),
    targetWorkPoints: 0,
    selfLabor: Math.max(0, Math.floor(Number(normalizedLabor?.selfLabor) || 0)),
    externalLabor: 0,
    workerEquipmentByWorkerId: {},
    laborConfirmed: false,
    pressedEquipmentTokenId: '',
    draggingEquipmentTokenId: ''
  };
}

export function buildAutoAssignedHarvestWorkerEquipmentState({
  selectedWorkerIdsByType,
  selfWorkerSelected,
  useSelfLabor,
  gameLabor,
  crewTypeKeys,
  selfWorkerId,
  workerRosterByType,
  workerEquipmentByWorkerId,
  workerEquipmentCards,
  workerEquipmentOwnerByTokenId,
  workerEquipmentCardMap,
  isHarvestBasketItemKey,
  isHarvestAccessEquipmentItemKey,
  isHarvestAerialEquipmentItemKey,
  buildHarvestPlanLaborState,
  availableWorkerMix,
  normalizeHarvestLaborPair,
  externalLaborFromSelectedIds
}) {
  const nextSelectedIdsByType = {
    beginner: [...(selectedWorkerIdsByType?.beginner || [])],
    worker: [...(selectedWorkerIdsByType?.worker || [])],
    skilledWorker: [...(selectedWorkerIdsByType?.skilledWorker || [])]
  };
  let nextUseSelfLabor = Boolean(useSelfLabor);
  const safeGameLabor = Math.max(0, Math.floor(Number(gameLabor) || 0));
  const workerLaborById = new Map([
    ...(safeGameLabor > 0 ? [[selfWorkerId, safeGameLabor]] : []),
    ...crewTypeKeys.flatMap((key) => (
      workerRosterByType?.[key] || []
    ).map((worker) => [
      String(worker?.id || ''),
      Math.max(0, Math.floor(Number(worker?.labor) || 0))
    ]))
  ]);
  const selectedWorkerIds = [
    ...(selfWorkerSelected ? [selfWorkerId] : []),
    ...crewTypeKeys.flatMap((key) => selectedWorkerIdsByType?.[key] || [])
  ]
    .map((workerId) => String(workerId || ''))
    .filter(Boolean);
  const allCandidateWorkerIds = [
    ...(safeGameLabor > 0 ? [selfWorkerId] : []),
    ...((workerRosterByType?.beginner || []).map((worker) => String(worker?.id || '')).filter(Boolean)),
    ...((workerRosterByType?.worker || []).map((worker) => String(worker?.id || '')).filter(Boolean)),
    ...((workerRosterByType?.skilledWorker || []).map((worker) => String(worker?.id || '')).filter(Boolean))
  ]
    .filter((workerId) => (workerLaborById.get(String(workerId || '')) || 0) > 0)
    .sort((a, b) => {
      const laborDiff = (workerLaborById.get(String(b || '')) || 0) - (workerLaborById.get(String(a || '')) || 0);
      if (laborDiff !== 0) return laborDiff;
      if (String(a || '') === selfWorkerId) return -1;
      if (String(b || '') === selfWorkerId) return 1;
      return String(a || '').localeCompare(String(b || ''));
    });
  const selectedOrCandidateWorkerIds = selectedWorkerIds.length ? selectedWorkerIds : allCandidateWorkerIds;
  if (!selectedOrCandidateWorkerIds.length) return null;

  const nextAssignments = Object.entries(workerEquipmentByWorkerId || {}).reduce((acc, [workerId, tokenIds]) => {
    const filtered = (Array.isArray(tokenIds) ? tokenIds : []).map((id) => String(id || '')).filter(Boolean);
    if (filtered.length) acc[String(workerId || '')] = filtered;
    return acc;
  }, {});

  const ensureWorkerSelected = (workerId) => {
    const safeWorkerId = String(workerId || '');
    if (!safeWorkerId) return;
    if (safeWorkerId === selfWorkerId) {
      nextUseSelfLabor = true;
      return;
    }
    const workerTypeKey = crewTypeKeys.find((key) =>
      (workerRosterByType?.[key] || []).some((worker) => String(worker?.id || '') === safeWorkerId)
    );
    if (!workerTypeKey) return;
    if (!nextSelectedIdsByType[workerTypeKey].includes(safeWorkerId)) {
      nextSelectedIdsByType[workerTypeKey] = [...nextSelectedIdsByType[workerTypeKey], safeWorkerId];
    }
  };

  const currentCardsOfWorker = (workerId) => ((nextAssignments[String(workerId || '')] || [])
    .map((tokenId) => workerEquipmentCardMap?.[tokenId] || null)
    .filter(Boolean));

  const canAssignCardToWorker = (workerId, card) => {
    const safeWorkerId = String(workerId || '');
    if (!safeWorkerId || !card) return false;
    if ((workerLaborById.get(safeWorkerId) || 0) <= 0) return false;
    if (safeWorkerId === selfWorkerId && !nextUseSelfLabor && !selectedOrCandidateWorkerIds.includes(selfWorkerId)) return false;
    const assignedCards = currentCardsOfWorker(safeWorkerId);
    const targetIsBasket = isHarvestBasketItemKey(card?.itemKey);
    const hasSameItemAlready = !targetIsBasket && assignedCards.some((assignedCard) => String(assignedCard?.itemKey || '') === String(card?.itemKey || ''));
    if (hasSameItemAlready) return false;
    const targetIsAccessEquipment = isHarvestAccessEquipmentItemKey(card?.itemKey);
    const hasAccessEquipmentAlready = assignedCards.some((assignedCard) => isHarvestAccessEquipmentItemKey(assignedCard?.itemKey));
    if (targetIsAccessEquipment && hasAccessEquipmentAlready) return false;
    const targetIsAerialEquipment = isHarvestAerialEquipmentItemKey(card?.itemKey);
    const hasAerialEquipmentAlready = assignedCards.some((assignedCard) => isHarvestAerialEquipmentItemKey(assignedCard?.itemKey));
    const hasBasketAlready = assignedCards.some((assignedCard) => isHarvestBasketItemKey(assignedCard?.itemKey));
    if (targetIsBasket && hasBasketAlready) return false;
    const targetLoadBoxSourceType = String(card?.sourceType || 'stock');
    const hasMixedLoadBoxSourceAlready = targetIsBasket && assignedCards.some((assignedCard) => (
      isHarvestBasketItemKey(assignedCard?.itemKey)
      && String(assignedCard?.sourceType || 'stock') !== targetLoadBoxSourceType
    ));
    if (hasMixedLoadBoxSourceAlready) return false;
    if ((targetIsBasket && hasAerialEquipmentAlready) || (targetIsAerialEquipment && hasBasketAlready)) return false;
    return true;
  };

  const tryAssignCard = (card, preferredWorkers) => {
    for (const workerId of preferredWorkers) {
      if (!canAssignCardToWorker(workerId, card)) continue;
      ensureWorkerSelected(workerId);
      nextAssignments[String(workerId)] = [...(nextAssignments[String(workerId)] || []), String(card.tokenId || '')];
      return true;
    }
    return false;
  };

  let assignedAny = false;
  let selectedAny = selectedWorkerIds.length > 0;
  const unassignedCards = workerEquipmentCards.filter((card) => !workerEquipmentOwnerByTokenId?.[card.tokenId]);
  const accessCards = unassignedCards.filter((card) => isHarvestAccessEquipmentItemKey(card?.itemKey));
  const basketCards = unassignedCards.filter((card) => isHarvestBasketItemKey(card?.itemKey));

  accessCards.forEach((card) => {
    const preferredWorkers = [...selectedOrCandidateWorkerIds].sort((a, b) => {
      const cardDiff = currentCardsOfWorker(a).length - currentCardsOfWorker(b).length;
      if (cardDiff !== 0) return cardDiff;
      return (workerLaborById.get(String(b || '')) || 0) - (workerLaborById.get(String(a || '')) || 0);
    });
    if (tryAssignCard(card, preferredWorkers)) assignedAny = true;
  });

  basketCards.forEach((card) => {
    const workersWithoutBasket = selectedOrCandidateWorkerIds.filter((workerId) =>
      !currentCardsOfWorker(workerId).some((assignedCard) => isHarvestBasketItemKey(assignedCard?.itemKey))
    );
    const preferredWorkers = (workersWithoutBasket.length ? workersWithoutBasket : selectedOrCandidateWorkerIds).slice().sort((a, b) => {
      const cardDiff = currentCardsOfWorker(a).length - currentCardsOfWorker(b).length;
      if (cardDiff !== 0) return cardDiff;
      return (workerLaborById.get(String(b || '')) || 0) - (workerLaborById.get(String(a || '')) || 0);
    });
    if (tryAssignCard(card, preferredWorkers)) assignedAny = true;
  });

  crewTypeKeys.forEach((key) => {
    if ((nextSelectedIdsByType?.[key] || []).length > 0) selectedAny = true;
  });
  if (nextUseSelfLabor) selectedAny = true;
  if (!assignedAny && !selectedAny && selectedOrCandidateWorkerIds.length > 0) {
    ensureWorkerSelected(selectedOrCandidateWorkerIds[0]);
    selectedAny = true;
  }
  if (!assignedAny && !selectedAny) return null;

  const nextPlan = buildHarvestPlanLaborState({
    workerMix: crewTypeKeys.reduce((acc, key) => {
      acc[key] = Array.isArray(nextSelectedIdsByType?.[key]) ? nextSelectedIdsByType[key].length : 0;
      return acc;
    }, { beginner: 0, worker: 0, skilledWorker: 0 }),
    useSelfLabor: nextUseSelfLabor,
    availableSelfLabor: safeGameLabor,
    availableByType: availableWorkerMix
  });
  const selectedExternalLabor = externalLaborFromSelectedIds(nextSelectedIdsByType);
  const normalizedLabor = normalizeHarvestLaborPair({
    selfLabor: nextPlan.selfLabor,
    externalLabor: selectedExternalLabor,
    useSelfLabor: nextPlan.useSelfLabor,
    preserve: 'external'
  });
  const nextExternalLabor = Math.max(
    0,
    Math.min(
      Math.floor(Number(normalizedLabor.externalLabor) || 0),
      selectedExternalLabor
    )
  );
  const assignedEquipmentInstanceIds = Array.from(
    new Set(
      Object.values(nextAssignments)
        .flatMap((tokenIds) => (Array.isArray(tokenIds) ? tokenIds : []))
        .map((tokenId) => workerEquipmentCardMap?.[tokenId] || null)
        .filter(Boolean)
        .map((card) => String(card?.equipmentInstanceId || ''))
        .filter(Boolean)
    )
  );

  return {
    selectedWorkerIdsByType: nextSelectedIdsByType,
    workerMix: nextPlan.workerMix,
    useSelfLabor: nextPlan.useSelfLabor,
    simpleWorkers: nextPlan.simpleWorkers,
    selfLabor: normalizedLabor.selfLabor,
    externalLabor: nextExternalLabor,
    targetWorkPoints: normalizedLabor.selfLabor + nextExternalLabor,
    laborConfirmed: (normalizedLabor.selfLabor + nextExternalLabor) > 0,
    workerEquipmentByWorkerId: nextAssignments,
    assignedEquipmentInstanceIds
  };
}

export function buildHarvestInlineLaborState({
  selfLabor = 0,
  externalLabor = 0,
  useSelfLabor = false,
  preserve = 'self',
  normalizeHarvestLaborPair
}) {
  const nextUseSelfLabor = Boolean(useSelfLabor);
  const normalizedLabor = normalizeHarvestLaborPair({
    selfLabor,
    externalLabor,
    useSelfLabor: nextUseSelfLabor,
    preserve
  });
  const targetWorkPoints = normalizedLabor.selfLabor + normalizedLabor.externalLabor;
  return {
    useSelfLabor: nextUseSelfLabor,
    selfLabor: normalizedLabor.selfLabor,
    externalLabor: normalizedLabor.externalLabor,
    targetWorkPoints,
    laborConfirmed: targetWorkPoints > 0,
    shouldClearSelfWorkerEquipment: !nextUseSelfLabor
  };
}

export function buildManualHarvestWorkerEquipmentAssignmentState({
  workerId,
  tokenId,
  selfWorkerId,
  selfWorkerSelected,
  workerEquipmentCardMap,
  workerEquipmentByWorkerId,
  workerRosterByType,
  crewTypeKeys,
  selectedWorkerIdsByType,
  isHarvestBasketItemKey,
  isHarvestAccessEquipmentItemKey,
  isHarvestAerialEquipmentItemKey
}) {
  const validation = validateHarvestWorkerEquipmentAssignment({
    workerId,
    tokenId,
    selfWorkerId,
    selfWorkerSelected,
    workerEquipmentCardMap,
    workerEquipmentByWorkerId,
    isHarvestBasketItemKey,
    isHarvestAccessEquipmentItemKey,
    isHarvestAerialEquipmentItemKey
  });
  if (!validation.ok) return null;

  const safeWorkerId = String(workerId || '');
  const safeTokenId = String(tokenId || '');
  const targetCard = workerEquipmentCardMap?.[safeTokenId];

  const workerTypeKey = crewTypeKeys.find((key) =>
    (workerRosterByType?.[key] || []).some((worker) => String(worker?.id || '') === safeWorkerId)
  ) || '';
  const nextSelectedIdsByType = {
    beginner: [...(selectedWorkerIdsByType?.beginner || [])],
    worker: [...(selectedWorkerIdsByType?.worker || [])],
    skilledWorker: [...(selectedWorkerIdsByType?.skilledWorker || [])]
  };
  let shouldApplyWorkerSelection = false;
  const shouldEnableSelfLabor = safeWorkerId === String(selfWorkerId || '') && !selfWorkerSelected;
  if (workerTypeKey && !nextSelectedIdsByType[workerTypeKey].includes(safeWorkerId)) {
    nextSelectedIdsByType[workerTypeKey] = [...nextSelectedIdsByType[workerTypeKey], safeWorkerId];
    shouldApplyWorkerSelection = true;
  }

  const nextWorkerEquipmentByWorkerId = Object.entries(workerEquipmentByWorkerId || {}).reduce((acc, [entryWorkerId, tokenIds]) => {
    const filtered = (Array.isArray(tokenIds) ? tokenIds : []).filter((id) => String(id || '') !== safeTokenId);
    if (filtered.length) acc[entryWorkerId] = filtered;
    return acc;
  }, {});
  nextWorkerEquipmentByWorkerId[safeWorkerId] = [...(nextWorkerEquipmentByWorkerId[safeWorkerId] || []), safeTokenId];

  return {
    workerId: safeWorkerId,
    workerTypeKey,
    shouldApplyWorkerSelection,
    shouldEnableSelfLabor,
    nextSelectedIdsByType,
    nextWorkerEquipmentByWorkerId,
    shouldConfirmEquipment: targetCard.type === 'equipment' && Boolean(targetCard.equipmentInstanceId),
    equipmentInstanceId: String(targetCard?.equipmentInstanceId || '')
  };
}

export function validateHarvestWorkerEquipmentAssignment({
  workerId,
  tokenId,
  selfWorkerId,
  selfWorkerSelected,
  workerEquipmentCardMap,
  workerEquipmentByWorkerId,
  isHarvestBasketItemKey,
  isHarvestAccessEquipmentItemKey,
  isHarvestAerialEquipmentItemKey
}) {
  const safeWorkerId = String(workerId || '');
  const safeTokenId = String(tokenId || '');
  if (!safeWorkerId || !safeTokenId) return { ok: false, reason: '배정 대상이 올바르지 않습니다.' };

  const targetCard = workerEquipmentCardMap?.[safeTokenId];
  if (!targetCard) return { ok: false, reason: '배정할 장비를 찾을 수 없습니다.' };

  const assignedTokenIds = Array.isArray(workerEquipmentByWorkerId?.[safeWorkerId])
    ? workerEquipmentByWorkerId[safeWorkerId].map((id) => String(id || '')).filter(Boolean)
    : [];
  const assignedCards = assignedTokenIds
    .map((assignedTokenId) => workerEquipmentCardMap?.[assignedTokenId] || null)
    .filter(Boolean);
  const targetIsBasket = isHarvestBasketItemKey(targetCard?.itemKey);
  const hasSameItemAlready = !targetIsBasket && assignedCards.some((card) => String(card?.itemKey || '') === String(targetCard?.itemKey || ''));
  if (hasSameItemAlready) return { ok: false, reason: '같은 장비는 한 사람에게 중복 배정할 수 없습니다.' };
  const targetIsAccessEquipment = isHarvestAccessEquipmentItemKey(targetCard?.itemKey);
  const hasAccessEquipmentAlready = assignedCards.some((card) => isHarvestAccessEquipmentItemKey(card?.itemKey));
  if (targetIsAccessEquipment && hasAccessEquipmentAlready) return { ok: false, reason: '사다리/고소작업 장비는 한 사람당 1개만 배정할 수 있습니다.' };
  const targetIsAerialEquipment = isHarvestAerialEquipmentItemKey(targetCard?.itemKey);
  const hasAerialEquipmentAlready = assignedCards.some((card) => isHarvestAerialEquipmentItemKey(card?.itemKey));
  const hasBasketAlready = assignedCards.some((card) => isHarvestBasketItemKey(card?.itemKey));
  if (targetIsBasket && hasBasketAlready) return { ok: false, reason: '바구니는 한 사람당 1개만 배정할 수 있습니다.' };
  const targetLoadBoxSourceType = String(targetCard?.sourceType || 'stock');
  const hasMixedLoadBoxSourceAlready = targetIsBasket && assignedCards.some((card) => (
    isHarvestBasketItemKey(card?.itemKey)
    && String(card?.sourceType || 'stock') !== targetLoadBoxSourceType
  ));
  if (hasMixedLoadBoxSourceAlready) return { ok: false, reason: '같은 사람에게는 같은 출처의 바구니만 함께 배정할 수 있습니다.' };
  if (targetIsBasket && hasAerialEquipmentAlready) return { ok: false, reason: '고소작업 장비를 배정한 사람에게는 바구니를 추가할 수 없습니다.' };
  if (targetIsAerialEquipment && hasBasketAlready) return { ok: false, reason: '바구니를 든 사람에게는 고소작업 장비를 배정할 수 없습니다.' };

  return { ok: true, reason: '' };
}

export function resolveNextHarvestLoadBoxSelection({
  option,
  harvestLoadBoxOptions,
  harvestSelectedLoadBoxSelectionIds,
  harvestLoadBoxSelectionIdOf
}) {
  const selectionId = harvestLoadBoxSelectionIdOf(option);
  const optionSourceType = String(option?.sourceType || 'stock');
  const currentIds = [...harvestSelectedLoadBoxSelectionIds];
  const currentOptions = harvestLoadBoxOptions.filter((candidate) =>
    currentIds.includes(harvestLoadBoxSelectionIdOf(candidate))
  );
  const hasMixedSource = currentOptions.some((candidate) => String(candidate?.sourceType || 'stock') !== optionSourceType);
  let nextIds = currentIds.includes(selectionId)
    ? currentIds.filter((id) => id !== selectionId)
    : (hasMixedSource ? [selectionId] : [...currentIds, selectionId]);
  nextIds = Array.from(new Set(nextIds));
  const nextOptions = harvestLoadBoxOptions.filter((candidate) =>
    nextIds.includes(harvestLoadBoxSelectionIdOf(candidate))
  );
  return {
    nextIds,
    nextOptions
  };
}
