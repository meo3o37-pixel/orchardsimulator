export const buildEvChargeSelectionContext = (
  {
    prev,
    targetField,
    selectedMachineByFieldId = {},
    selectedModeByFieldId = {}
  },
  deps
) => {
  const selectedId = String(selectedMachineByFieldId?.[String(targetField.id)] || '');
  if (!selectedId) return null;
  if (!Array.isArray(targetField?.machineParkingSlots) || !targetField.machineParkingSlots.includes(selectedId)) return null;
  const parkedSlotNo = targetField.machineParkingSlots.findIndex((entry) => String(entry || '') === selectedId) + 1;
  const evChargeSlotSet = new Set(
    (Array.isArray(targetField?.evChargeSlotNos) ? targetField.evChargeSlotNos : [])
      .map((slotNo) => Math.floor(Number(slotNo) || 0))
  );
  if (parkedSlotNo <= 0 || !evChargeSlotSet.has(parkedSlotNo)) return null;
  const parsed = deps.parseMachineParkingInstanceId(selectedId);
  if (!parsed) return null;
  const machineItem = deps.machineItemMap?.[parsed.machineKey] || deps.equipmentItemMap?.[parsed.machineKey] || null;
  if (!machineItem || !deps.isElectricMachineItem(machineItem)) return null;
  const mode = String(selectedModeByFieldId?.[String(targetField.id)] || 'slow') === 'fast' ? 'fast' : 'slow';
  const chargeUnitKwh = mode === 'fast' ? deps.evChargeFastKwhPerAction : deps.evChargeSlowKwhPerAction;
  const chargeCostPerKwh = mode === 'fast' ? deps.evChargeFastCostPerKwh : deps.evChargeSlowCostPerKwh;
  const cap = Math.max(0, deps.electricBatteryCapacityKwhOfItem(machineItem));
  if (cap <= 0) return null;
  const current = deps.electricBatteryKwhOfInstance(prev, selectedId, machineItem);
  return {
    selectedId,
    parkedSlotNo,
    parsed,
    machineItem,
    mode,
    chargeUnitKwh,
    chargeCostPerKwh,
    cap,
    current
  };
};

export const applyEvChargeReservationToField = ({ targetField, selectedId }) => ({
  ...targetField,
  evSlowChargeReservedInstanceId: selectedId
});

export const buildEvFastChargeOutcome = (
  {
    prev,
    targetField,
    selectedId,
    parsed,
    machineItem,
    current,
    cap,
    chargeUnitKwh,
    chargeCostPerKwh
  },
  deps
) => {
  const fastChargeCountToday = (Number(targetField?.evFastChargeDay) || 0) === (Number(prev?.day) || 0)
    ? Math.max(0, Math.floor(Number(targetField?.evFastChargeCountToday) || 0))
    : 0;
  if (fastChargeCountToday >= deps.evChargeFastMaxCountPerDay) return null;
  const fastTargetCap = Math.max(0, Math.min(cap, cap * deps.evChargeFastMaxRatio));
  const addKwh = Math.max(0, Math.min(chargeUnitKwh, fastTargetCap - current));
  if (addKwh <= 0) return null;
  const cost = Math.max(0, Math.round(addKwh * chargeCostPerKwh));
  if (prev.money < cost) return null;
  const nextMachineBatteryKwhByInstance = {
    ...(prev.machineBatteryKwhByInstance || {}),
    [selectedId]: deps.clamp(current + addKwh, 0, cap)
  };
  let nextFacilityDurabilityByKey = { ...(targetField?.facilityDurabilityByKey || targetField?.tankDurabilityByFacility || {}) };
  nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
    nextFacilityDurabilityByKey,
    'farmPowerElectric',
    (deps.evChargePowerFacilityWearPer100Kwh * addKwh) / 100
  );
  nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
    nextFacilityDurabilityByKey,
    'evChargerStation',
    (deps.evChargeStationWearPer100Kwh * addKwh) / 100
  );
  const nextField = {
    ...targetField,
    evSlowChargeReservedInstanceId: targetField?.evSlowChargeReservedInstanceId === selectedId
      ? ''
      : String(targetField?.evSlowChargeReservedInstanceId || ''),
    evFastChargeDay: Number(prev?.day) || 0,
    evFastChargeCountToday: fastChargeCountToday + 1,
    evChargeUsageKwhTotal: Math.max(0, Number(targetField?.evChargeUsageKwhTotal) || 0) + addKwh,
    facilityDurabilityByKey: nextFacilityDurabilityByKey
  };
  return {
    nextField,
    nextMachineBatteryKwhByInstance,
    addKwh,
    cost,
    fastChargeCountToday,
    machineName: machineItem?.name || parsed.machineKey,
    unitNo: parsed.unitNo
  };
};

export const formatEvChargeReservationLog = ({ fieldName, machineName, unitNo }) =>
  `${fieldName} EV 완속충전 예약: ${machineName} #${unitNo} (다음날 처리)`;

export const formatEvChargeLog = ({ fieldName, mode, machineName, unitNo, addKwh, cost }, deps) =>
  `${fieldName} EV 충전 (${mode === 'fast' ? '급속' : '완속'}): ${machineName} #${unitNo} +${addKwh.toFixed(1)}kWh / 비용 -${deps.won(cost)}`;

export const processDailySlowEvCharge = (
  {
    field,
    nextDay,
    prev,
    nextMachineBatteryKwhByInstance,
    nextFacilityDurabilityByKey,
    availableMoney
  },
  deps
) => {
  const reservedInstanceId = String(field?.evSlowChargeReservedInstanceId || '');
  let nextReservedInstanceId = reservedInstanceId;
  let evSlowChargedKwh = 0;
  let nextBatteryMap = nextMachineBatteryKwhByInstance;
  let nextDurabilityMap = nextFacilityDurabilityByKey;
  let costTotal = 0;
  let logText = '';
  if (!reservedInstanceId) {
    return {
      nextReservedInstanceId,
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText
    };
  }
  const parkingSlots = Array.isArray(field?.machineParkingSlots) ? field.machineParkingSlots : [];
  const parkedSlotNo = parkingSlots.findIndex((entry) => String(entry || '') === reservedInstanceId) + 1;
  if (parkedSlotNo <= 0) {
    return {
      nextReservedInstanceId: '',
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText
    };
  }
  const parsed = deps.parseMachineParkingInstanceId(reservedInstanceId);
  const machineItem = parsed
    ? (deps.machineItemMap?.[parsed.machineKey] || deps.equipmentItemMap?.[parsed.machineKey] || null)
    : null;
  if (!parsed || !machineItem || !deps.isElectricMachineItem(machineItem)) {
    return {
      nextReservedInstanceId: '',
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText
    };
  }
  const evChargeSlotSet = new Set(
    (Array.isArray(field?.evChargeSlotNos) ? field.evChargeSlotNos : [])
      .map((slotNo) => Math.floor(Number(slotNo) || 0))
  );
  const readyForSlowCharge = evChargeSlotSet.has(parkedSlotNo)
    && deps.fieldFacilityUsable(field, 'evChargerStation', nextDay)
    && deps.fieldFacilityUsable(field, 'farmPowerElectric', nextDay)
    && field?.powerControlEnabled !== false
    && field?.evChargerControlEnabled !== false;
  if (!readyForSlowCharge) {
    return {
      nextReservedInstanceId,
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText
    };
  }
  const cap = Math.max(0, deps.electricBatteryCapacityKwhOfItem(machineItem));
  const current = deps.clamp(
    Number(
      nextBatteryMap?.[reservedInstanceId]
      ?? deps.electricBatteryKwhOfInstance(prev, reservedInstanceId, machineItem)
    ),
    0,
    cap
  );
  const addKwh = Math.max(0, Math.min(deps.evChargeSlowKwhPerAction, cap - current));
  if (addKwh <= 0) {
    return {
      nextReservedInstanceId,
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText
    };
  }
  const cost = Math.max(0, Math.round(addKwh * deps.evChargeSlowCostPerKwh));
  if (availableMoney < cost) {
    return {
      nextReservedInstanceId,
      evSlowChargedKwh,
      nextMachineBatteryKwhByInstance: nextBatteryMap,
      nextFacilityDurabilityByKey: nextDurabilityMap,
      costTotal,
      logText: `${field.name} EV 완속충전 보류: 자금 부족`
    };
  }
  nextBatteryMap = {
    ...nextBatteryMap,
    [reservedInstanceId]: deps.clamp(current + addKwh, 0, cap)
  };
  nextDurabilityMap = deps.applyFacilityDurabilityWear(
    nextDurabilityMap,
    'farmPowerElectric',
    (deps.evChargePowerFacilityWearPer100Kwh * addKwh) / 100
  );
  nextDurabilityMap = deps.applyFacilityDurabilityWear(
    nextDurabilityMap,
    'evChargerStation',
    (deps.evChargeStationWearPer100Kwh * addKwh) / 100
  );
  return {
    nextReservedInstanceId: '',
    evSlowChargedKwh: addKwh,
    nextMachineBatteryKwhByInstance: nextBatteryMap,
    nextFacilityDurabilityByKey: nextDurabilityMap,
    costTotal: cost,
    logText: `${field.name} EV 완속충전: ${(machineItem?.name || parsed.machineKey)} #${parsed.unitNo} +${addKwh.toFixed(1)}kWh / 비용 -${deps.won(cost)}`
  };
};
