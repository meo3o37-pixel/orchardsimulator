import { useCallback, useMemo } from 'react';

export function useWarehouseStorageMachineLoadActions({
  availableCarrierLadderCount,
  carrierLadderCapacityKgByKey,
  carrierLoadedMachinePalletSlotsByInstance,
  carrierLoadedMachineSlotCountByInstance,
  carrierMaxAllowedLoadKg,
  carrierTotalLoadedKgByInstance,
  diaryLine,
  game,
  harvestVehicleMachineSlotSpecOfMachine,
  harvestVehiclePalletSpecOfMachine,
  isForkliftMachineLike,
  machineDisplayNameWithRentTag,
  machineLoadFootprintPalletSlotsOfMachineLike,
  machineLoadMethodOfMachineLike,
  minRequiredLadderCapacityKg,
  normalizeVehicleLoadedMachineIdsByInstance,
  normalizeVehiclePalletSlotsByInstance,
  resolveMachineInstanceById,
  selectedCarrier,
  selectedField,
  selectedFieldParkingSlots,
  selectedLoadMachine,
  selectedTransportRow,
  setEntryModalOpen,
  setEntryTab,
  setGame,
  setSelectedCarrierId,
  setSelectedLoadMachineId,
}) {
  const carrierPalletFootprintUsageSummaryOfMachine = useCallback((carrier) => {
    const instanceId = String(carrier?.id || '');
    if (!instanceId) {
      return {
        totalPalletSlots: 0,
        totalMachineSlots: 0,
        occupiedPalletSlots: 0,
        usedMachineSlots: 0,
        remainPalletSlots: 0,
        remainMachineSlots: 0
      };
    }
    const palletSpec = harvestVehiclePalletSpecOfMachine(carrier);
    const machineSpec = harvestVehicleMachineSlotSpecOfMachine(carrier);
    const totalPalletSlots = Math.max(0, Number(palletSpec?.palletSlots) || 0);
    const totalMachineSlots = Math.max(0, Number(machineSpec?.machineSlots) || 0);
    const emptyPalletSlotsByNo = normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[instanceId] || {};
    const occupiedHarvestSlotNos = new Set(
      (Array.isArray(game?.storage) ? game.storage : [])
        .filter((batch) => (
          batch?.palletized
          && String(batch?.storageVehicleInstanceId || '') === instanceId
          && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
          && Math.max(0, Number(batch?.qty) || 0) > 0
        ))
        .map((batch) => Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)))
        .filter((slotNo) => slotNo > 0)
    );
    const occupiedHarvestSlots = occupiedHarvestSlotNos.size;
    const occupiedEmptyPalletSlots = Object.keys(emptyPalletSlotsByNo).length;
    const usedMachineSlots = carrierLoadedMachineSlotCountByInstance(game, instanceId);
    const usedMachinePalletSlots = carrierLoadedMachinePalletSlotsByInstance(game, instanceId);
    const occupiedPalletSlots = occupiedHarvestSlots + occupiedEmptyPalletSlots;
    return {
      totalPalletSlots,
      totalMachineSlots,
      occupiedPalletSlots,
      usedMachineSlots,
      remainPalletSlots: Math.max(0, totalPalletSlots - occupiedPalletSlots - usedMachinePalletSlots),
      remainMachineSlots: Math.max(0, totalMachineSlots - usedMachineSlots)
    };
  }, [
    carrierLoadedMachinePalletSlotsByInstance,
    carrierLoadedMachineSlotCountByInstance,
    game,
    harvestVehicleMachineSlotSpecOfMachine,
    harvestVehiclePalletSpecOfMachine,
    normalizeVehiclePalletSlotsByInstance
  ]);

  const validateFacilityStorageMachineLoad = useCallback((loadMachine, carrier, transportRow, options = {}) => {
    const ignoreTransport = Boolean(options?.ignoreTransport);
    if (!loadMachine) return { ok: false, reason: '적재할 장비를 먼저 선택해 주세요.' };
    if (!carrier) return { ok: false, reason: '저장공간을 먼저 선택해 주세요.' };
    if (String(loadMachine?.id || '') === String(carrier?.id || '')) {
      return { ok: false, reason: '자기 자신에게는 적재할 수 없습니다.' };
    }
    if (isForkliftMachineLike(carrier) || Math.max(0, Number(carrier?.item?.payloadKg) || 0) <= 0) {
      return { ok: false, reason: '선택한 장비에는 저장공간이 없습니다.' };
    }
    const sourceLoadedKg = carrierTotalLoadedKgByInstance(game, String(loadMachine?.id || ''));
    if (sourceLoadedKg > 0) {
      return { ok: false, reason: '적재 대상 장비의 적재함을 먼저 비워 주세요.' };
    }
    const machineWeightKg = Math.max(0, Number(loadMachine?.item?.weightKg) || 0);
    const payloadKg = Math.max(0, Number(carrier?.item?.payloadKg) || 0);
    const currentLoadedKg = carrierTotalLoadedKgByInstance(game, String(carrier?.id || ''));
    const remainKg = Math.max(0, carrierMaxAllowedLoadKg(payloadKg) - currentLoadedKg);
    if (remainKg + 1e-6 < machineWeightKg) {
      return { ok: false, reason: '적재 중량이 부족합니다.' };
    }
    const footprintSlots = machineLoadFootprintPalletSlotsOfMachineLike(loadMachine);
    const palletUsage = carrierPalletFootprintUsageSummaryOfMachine(carrier);
    if (palletUsage.totalMachineSlots <= 0) {
      return { ok: false, reason: '농기계를 실을 수 있는 차량 적재함이 아닙니다.' };
    }
    if (palletUsage.remainMachineSlots < 1) {
      return { ok: false, reason: '장비 자리가 부족합니다.' };
    }
    if (palletUsage.remainPalletSlots < footprintSlots) {
      return { ok: false, reason: '팔레트 공간이 부족합니다.' };
    }
    const loadMethod = machineLoadMethodOfMachineLike(loadMachine);
    if (ignoreTransport) {
      return {
        ok: true,
        reason: '',
        loadMethod,
        footprintSlots,
        machineWeightKg
      };
    }
    if (!transportRow) {
      return { ok: false, reason: loadMethod === 'forklift' ? '지게차를 선택해 주세요.' : '농기계 운반 사다리를 선택해 주세요.' };
    }
    if (String(transportRow?.sourceType || '') === 'machine' && String(transportRow?.machine?.id || '') === String(loadMachine?.id || '')) {
      return { ok: false, reason: '적재 대상 장비를 운반기구로 동시에 사용할 수 없습니다.' };
    }
    if (loadMethod === 'forklift') {
      if (!(transportRow?.sourceType === 'machine' && isForkliftMachineLike(transportRow?.machine))) {
        return { ok: false, reason: '지게차가 필요합니다.' };
      }
      const liftCapacityKg = Math.max(0, Number(transportRow?.machine?.item?.liftCapacityKg ?? transportRow?.machine?.item?.payloadKg) || 0);
      if (liftCapacityKg <= 0 || liftCapacityKg + 1e-6 < machineWeightKg) {
        return { ok: false, reason: '선택한 지게차 허용하중이 부족합니다.' };
      }
      return { ok: true, reason: '', loadMethod, footprintSlots, machineWeightKg };
    }
    const minLadderCapacityKg = minRequiredLadderCapacityKg(machineWeightKg);
    if (machineWeightKg > 5500) {
      return { ok: false, reason: '5.5톤용 사다리로도 부족한 중량입니다. 더 높은 규격의 운반 수단이 필요합니다.' };
    }
    if (transportRow?.sourceType !== 'tool') {
      return { ok: false, reason: '농기계 운반 사다리를 선택해 주세요.' };
    }
    const ladderCapacityKg = Math.max(0, Number(carrierLadderCapacityKgByKey?.[String(transportRow?.toolKey || '')]) || 0);
    if (ladderCapacityKg < minLadderCapacityKg) {
      return { ok: false, reason: '선택한 운반 사다리 규격이 부족합니다.' };
    }
    const selectedLadderUnitCount = Math.max(0, Number(transportRow?.ladderUnitCount) || 0);
    if (selectedLadderUnitCount >= 2) {
      return { ok: true, reason: '', loadMethod, footprintSlots, machineWeightKg };
    }
    const ladderCount = availableCarrierLadderCount(
      game?.vehicleCargoByInstance?.[String(carrier?.id || '')] || {},
      minLadderCapacityKg
    );
    if (ladderCount < 2) {
      return {
        ok: false,
        reason: `농기계 적재에는 ${Math.round(minLadderCapacityKg / 1000 * 10) / 10}톤급 이상 운반 사다리 2개가 필요합니다.`
      };
    }
    return { ok: true, reason: '', loadMethod, footprintSlots, machineWeightKg };
  }, [
    availableCarrierLadderCount,
    carrierLadderCapacityKgByKey,
    carrierMaxAllowedLoadKg,
    carrierPalletFootprintUsageSummaryOfMachine,
    carrierTotalLoadedKgByInstance,
    game,
    isForkliftMachineLike,
    machineLoadFootprintPalletSlotsOfMachineLike,
    machineLoadMethodOfMachineLike,
    minRequiredLadderCapacityKg
  ]);

  const facilityStorageSelectedLoadMachineValidation = useMemo(
    () => validateFacilityStorageMachineLoad(
      selectedLoadMachine,
      selectedCarrier,
      selectedTransportRow
    ),
    [
      selectedCarrier,
      selectedLoadMachine,
      selectedTransportRow,
      validateFacilityStorageMachineLoad
    ]
  );

  const executeFacilityStorageMachineLoad = useCallback((loadMachineOverride = null) => {
    const loadMachine = loadMachineOverride || selectedLoadMachine;
    const targetCarrier = selectedCarrier;
    const transportRow = selectedTransportRow;
    const validation = validateFacilityStorageMachineLoad(loadMachine, targetCarrier, transportRow);
    if (!validation.ok) {
      window.alert(validation.reason || '농기계를 적재할 수 없습니다.');
      return;
    }
    const loadMachineId = String(loadMachine?.id || '');
    const targetCarrierId = String(targetCarrier?.id || '');
    if (!loadMachineId || !targetCarrierId) return;
    const sourceSlotIndex = selectedFieldParkingSlots.findIndex(
      (instanceId) => String(instanceId || '') === loadMachineId
    );
    if (sourceSlotIndex < 0) {
      window.alert('적재할 장비가 현재 토지 주차칸에 없습니다.');
      return;
    }
    const targetTransportLabel = selectedTransportRow?.sourceType === 'machine'
      ? machineDisplayNameWithRentTag(selectedTransportRow?.machine)
      : String(selectedTransportRow?.toolName || selectedTransportRow?.toolMeta?.name || '운반기구');
    setGame((prev) => {
      const fields = Array.isArray(prev?.fields) ? prev.fields.map((field) => ({ ...field })) : [];
      const fieldIndex = fields.findIndex((field) => String(field?.id || '') === String(selectedField?.id || ''));
      if (fieldIndex < 0) return prev;
      const field = { ...fields[fieldIndex] };
      const slots = Array.isArray(field?.machineParkingSlots) ? [...field.machineParkingSlots] : [];
      if (String(slots[sourceSlotIndex] || '') !== loadMachineId) return prev;
      slots[sourceSlotIndex] = '';
      field.machineParkingSlots = slots;
      fields[fieldIndex] = field;
      const nextVehicleLoadedMachineIdsByInstance = normalizeVehicleLoadedMachineIdsByInstance(prev?.vehicleLoadedMachineIdsByInstance || {});
      const nextLoadedIds = Array.isArray(nextVehicleLoadedMachineIdsByInstance[targetCarrierId])
        ? [...nextVehicleLoadedMachineIdsByInstance[targetCarrierId]]
        : [];
      if (!nextLoadedIds.includes(loadMachineId)) nextLoadedIds.push(loadMachineId);
      nextVehicleLoadedMachineIdsByInstance[targetCarrierId] = nextLoadedIds;
      return {
        ...prev,
        fields,
        vehicleLoadedMachineIdsByInstance: nextVehicleLoadedMachineIdsByInstance,
        activityLog: [
          diaryLine(prev.day, `${machineDisplayNameWithRentTag(loadMachine)} 적재: ${machineDisplayNameWithRentTag(targetCarrier)} / ${targetTransportLabel}`),
          ...(prev.activityLog || [])
        ]
      };
    });
    setSelectedLoadMachineId('');
  }, [
    diaryLine,
    machineDisplayNameWithRentTag,
    normalizeVehicleLoadedMachineIdsByInstance,
    selectedCarrier,
    selectedField,
    selectedFieldParkingSlots,
    selectedLoadMachine,
    selectedTransportRow,
    setGame,
    setSelectedLoadMachineId,
    validateFacilityStorageMachineLoad
  ]);

  const unloadLoadedMachineFromCarrier = useCallback((loadedMachineId) => {
    const carrier = selectedCarrier;
    const carrierId = String(carrier?.id || '');
    const machineId = String(loadedMachineId || '');
    if (!carrierId || !machineId) return;
    const emptySlotIndex = selectedFieldParkingSlots.findIndex((instanceId) => !String(instanceId || '').trim());
    if (emptySlotIndex < 0) {
      window.alert('현재 토지 주차칸에 빈 자리가 없어 하차할 수 없습니다.');
      return;
    }
    setGame((prev) => {
      const fields = Array.isArray(prev?.fields) ? prev.fields.map((field) => ({ ...field })) : [];
      const fieldIndex = fields.findIndex((field) => String(field?.id || '') === String(selectedField?.id || ''));
      if (fieldIndex < 0) return prev;
      const field = { ...fields[fieldIndex] };
      const slots = Array.isArray(field?.machineParkingSlots) ? [...field.machineParkingSlots] : [];
      if (slots[emptySlotIndex]) return prev;
      const nextVehicleLoadedMachineIdsByInstance = normalizeVehicleLoadedMachineIdsByInstance(prev?.vehicleLoadedMachineIdsByInstance || {});
      const currentIds = Array.isArray(nextVehicleLoadedMachineIdsByInstance[carrierId]) ? nextVehicleLoadedMachineIdsByInstance[carrierId] : [];
      const nextIds = currentIds.filter((entryId) => String(entryId || '') !== machineId);
      if (nextIds.length) nextVehicleLoadedMachineIdsByInstance[carrierId] = nextIds;
      else delete nextVehicleLoadedMachineIdsByInstance[carrierId];
      slots[emptySlotIndex] = machineId;
      field.machineParkingSlots = slots;
      fields[fieldIndex] = field;
      const unloadedMachine = resolveMachineInstanceById(machineId);
      return {
        ...prev,
        fields,
        vehicleLoadedMachineIdsByInstance: nextVehicleLoadedMachineIdsByInstance,
        activityLog: [
          diaryLine(prev.day, `${machineDisplayNameWithRentTag(carrier)} 하차: ${machineDisplayNameWithRentTag(unloadedMachine)}`),
          ...(prev.activityLog || [])
        ]
      };
    });
  }, [
    diaryLine,
    machineDisplayNameWithRentTag,
    normalizeVehicleLoadedMachineIdsByInstance,
    resolveMachineInstanceById,
    selectedCarrier,
    selectedField,
    selectedFieldParkingSlots,
    setGame
  ]);

  const openFacilityStorageMachineLoadEntryForCarrier = useCallback((carrierMachineIdRaw = '') => {
    const carrierMachineId = String(carrierMachineIdRaw || '').trim();
    if (!carrierMachineId) return;
    setSelectedCarrierId(carrierMachineId);
    setSelectedLoadMachineId('');
    setEntryTab('parking');
    setEntryModalOpen(true);
  }, [
    setEntryModalOpen,
    setEntryTab,
    setSelectedCarrierId,
    setSelectedLoadMachineId
  ]);

  const openFacilityStorageCarrierPanelForMachine = useCallback((carrierMachineIdRaw = '') => {
    const carrierMachineId = String(carrierMachineIdRaw || '').trim();
    if (!carrierMachineId) return;
    setSelectedCarrierId(carrierMachineId);
  }, [setSelectedCarrierId]);

  return {
    carrierPalletFootprintUsageSummaryOfMachine,
    executeFacilityStorageMachineLoad,
    facilityStorageSelectedLoadMachineValidation,
    openFacilityStorageCarrierPanelForMachine,
    openFacilityStorageMachineLoadEntryForCarrier,
    unloadLoadedMachineFromCarrier,
    validateFacilityStorageMachineLoad,
  };
}
