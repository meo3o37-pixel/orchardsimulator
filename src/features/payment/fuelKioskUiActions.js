import { prepareFuelingRequest, receiptRemainingLiters } from '../fuel/fuelKioskActionUtils';
import { applyFuelFillToGame, computeCanDisplayAfterFill } from '../fuel/fuelFillService';

export function stageFuelCanToKioskAction({
  optionKeyRaw,
  fallbackItemKey = '',
  fuelKioskOptionByOptionKey,
  mapTransferSelectedCarrier,
  fuelKioskStagedCan,
  floorLitersToStep,
  fuelKioskVisualFuelKey,
  fuelKioskLastReceipt,
  setGame,
  normalizeVehicleFuelStorageByInstance,
  normalizeFuelContainerKey,
  normalizeFuelStorageByContainer,
  consumeStoredFuelLitersExactFromContainer,
  setFuelKioskStagedCan,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskCanVisualSnapshot,
  setFuelKioskBorrowedCan,
  setFuelKioskFuelingDone
}) {
  const optionKey = String(optionKeyRaw || '');
  const option = fuelKioskOptionByOptionKey?.[optionKey];
  const sourceCarrierId = String(mapTransferSelectedCarrier?.id || '');
  if (!option || !sourceCarrierId) return;
  if (fuelKioskStagedCan) {
    window.alert('이미 주유소에 올려둔 말통이 있습니다. 먼저 적재함으로 꺼내 주세요.');
    return;
  }
  const itemKey = String(fallbackItemKey || option?.key || '');
  if (!itemKey) return;
  const cap = Math.max(1, Number(option?.capacityPerUnit) || 1);
  const initialLiters = floorLitersToStep(Math.max(0, Number(option?.sameFuelStoredPerCan ?? option?.sameFuelStored) || 0));
  const sourceFuelKey = String(option?.activeFuelKey || fuelKioskVisualFuelKey || fuelKioskLastReceipt?.fuelKey || '');
  setGame((prev) => {
    if (!prev) return prev;
    const nextVehicleCargoByInstance = { ...(prev.vehicleCargoByInstance || {}) };
    const sourceCargo = { ...(nextVehicleCargoByInstance[sourceCarrierId] || {}) };
    const sourceQty = Math.max(0, Number(sourceCargo[itemKey]) || 0);
    if (sourceQty <= 0) return prev;
    sourceCargo[itemKey] = sourceQty - 1;
    if ((sourceCargo[itemKey] || 0) <= 0) delete sourceCargo[itemKey];
    if (Object.keys(sourceCargo).length > 0) {
      nextVehicleCargoByInstance[sourceCarrierId] = sourceCargo;
    } else {
      delete nextVehicleCargoByInstance[sourceCarrierId];
    }
    let nextVehicleFuelStorageByInstance = normalizeVehicleFuelStorageByInstance(prev.vehicleFuelStorageByInstance || {});
    if (sourceFuelKey && initialLiters > 0) {
      const normalizedContainerKey = normalizeFuelContainerKey(itemKey) || itemKey;
      const sourceFuelStorage = normalizeFuelStorageByContainer(nextVehicleFuelStorageByInstance[sourceCarrierId] || {});
      const consumed = consumeStoredFuelLitersExactFromContainer(
        sourceFuelStorage,
        sourceFuelKey,
        normalizedContainerKey,
        initialLiters
      );
      if (Object.keys(consumed.nextFuelStorageByContainer || {}).length > 0) {
        nextVehicleFuelStorageByInstance[sourceCarrierId] = consumed.nextFuelStorageByContainer;
      } else {
        delete nextVehicleFuelStorageByInstance[sourceCarrierId];
      }
    }
    return {
      ...prev,
      vehicleCargoByInstance: nextVehicleCargoByInstance,
      vehicleFuelStorageByInstance: nextVehicleFuelStorageByInstance
    };
  });
  setFuelKioskStagedCan({
    sourceCarrierId,
    containerKey: itemKey,
    capacityPerUnit: cap,
    storedLiters: initialLiters,
    fuelKey: sourceFuelKey
  });
  setFuelKioskCanKey('__staged__');
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskCanVisualSnapshot(null);
  setFuelKioskBorrowedCan(null);
  setFuelKioskFuelingDone(false);
}

export function extractStagedFuelCanToSelectedCarrierAction({
  fuelKioskStagedCan,
  mapTransferSelectedCarrierIdRef,
  floorLitersToStep,
  fuelKioskVisualFuelKey,
  fuelKioskLastReceipt,
  setGame,
  mapTransferParkedCarrierRows,
  validateCarrierLoadRule,
  itemMetaByKey,
  itemCategoryByKey,
  normalizeVehicleFuelStorageByInstance,
  normalizeFuelContainerKey,
  normalizeFuelStorageByContainer,
  addStoredFuelLitersToContainer,
  setFuelKioskStagedCan,
  setFuelKioskCanVisualSnapshot,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskFuelingDone
}) {
  const staged = fuelKioskStagedCan;
  if (!staged) return;
  const targetCarrierId = String(mapTransferSelectedCarrierIdRef.current || '');
  if (!targetCarrierId) {
    window.alert('적재함을 먼저 선택해 주세요.');
    return;
  }
  const containerKey = String(staged?.containerKey || '');
  if (!containerKey) return;
  const stagedLiters = floorLitersToStep(Math.max(0, Number(staged?.storedLiters) || 0));
  const stagedFuelKey = String(staged?.fuelKey || fuelKioskVisualFuelKey || fuelKioskLastReceipt?.fuelKey || '');
  setGame((prev) => {
    if (!prev) return prev;
    const targetCarrier = mapTransferParkedCarrierRows.find((entry) => String(entry?.machine?.id || '') === targetCarrierId)?.machine || null;
    if (!targetCarrier) return prev;
    const loadBlockedMessage = validateCarrierLoadRule({
      carrier: targetCarrier,
      carrierCargoByKey: prev?.vehicleCargoByInstance?.[targetCarrierId] || {},
      itemKey: containerKey,
      itemLike: itemMetaByKey?.[containerKey] || null,
      itemCategory: String(itemCategoryByKey?.[containerKey] || '')
    });
    if (loadBlockedMessage) {
      window.alert(loadBlockedMessage);
      return prev;
    }
    const nextVehicleCargoByInstance = { ...(prev.vehicleCargoByInstance || {}) };
    const targetCargo = { ...(nextVehicleCargoByInstance[targetCarrierId] || {}) };
    targetCargo[containerKey] = Math.max(0, Number(targetCargo[containerKey]) || 0) + 1;
    nextVehicleCargoByInstance[targetCarrierId] = targetCargo;
    let nextVehicleFuelStorageByInstance = normalizeVehicleFuelStorageByInstance(prev.vehicleFuelStorageByInstance || {});
    if (stagedFuelKey && stagedLiters > 0) {
      const normalizedContainerKey = normalizeFuelContainerKey(containerKey) || containerKey;
      const targetFuelStorage = normalizeFuelStorageByContainer(nextVehicleFuelStorageByInstance[targetCarrierId] || {});
      nextVehicleFuelStorageByInstance[targetCarrierId] = addStoredFuelLitersToContainer(
        targetFuelStorage,
        normalizedContainerKey,
        stagedFuelKey,
        stagedLiters
      );
    }
    return {
      ...prev,
      vehicleCargoByInstance: nextVehicleCargoByInstance,
      vehicleFuelStorageByInstance: nextVehicleFuelStorageByInstance
    };
  });
  setFuelKioskStagedCan(null);
  setFuelKioskCanVisualSnapshot(null);
  setFuelKioskCanKey('');
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskFuelingDone(false);
}

export function startFuelKioskFuelingAction({
  requestedLitersInput = null,
  fuelKioskLastReceipt,
  fuelKioskFueling,
  fuelKioskFuelingTimerRef,
  fuelKioskFuelingProgressTimerRef,
  fuelKioskDirectTargetMachine,
  fuelKioskKey,
  fuelKioskItem,
  machineFuelKeyFromType,
  machineFuelTypeLabelOf,
  floorLitersToStep,
  machineTankCapacityLitersOfItem,
  machineFuelLitersTrackedOfInstance,
  game,
  fuelKioskFillLitersDraft,
  fuelKioskSelectedCanState,
  setFuelKioskAnimatingFillLiters,
  setFuelKioskCanVisualSnapshot,
  fuelKioskSelectedCanDisplayLabel,
  fuelKioskSelectedCanSizeClass,
  fuelKioskSelectedCanFillRatio,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelingProgress,
  FUEL_KIOSK_FUELING_DURATION_MS,
  setGame,
  parseMachineParkingInstanceId,
  MACHINE_ITEM_MAP,
  EQUIPMENT_ITEM_MAP,
  isCombustionMachineItem,
  clamp,
  pushDiary,
  formatLiterText,
  fuelKioskMaxFillLiters,
  setFuelKioskFillLitersDraft,
  fuelKioskStagedCan,
  setFuelKioskStagedCan,
  setFuelKioskLastReceipt,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskCanKey,
  setFuelKioskBorrowedCan,
  setFuelKioskFuelApplied
}) {
  if (!fuelKioskLastReceipt || fuelKioskFueling) return;
  if (fuelKioskFuelingTimerRef.current) clearTimeout(fuelKioskFuelingTimerRef.current);
  if (fuelKioskFuelingProgressTimerRef.current) clearInterval(fuelKioskFuelingProgressTimerRef.current);
  const directTarget = fuelKioskDirectTargetMachine;
  let receiptFuelKey = '';
  let receiptFuelName = '';
  let receiptLiters = 0;
  let containerKey = '';
  let canLabel = '';
  let storableRemainLiters = 0;
  let fillLiters = 0;
  let selectedCan = fuelKioskSelectedCanState || null;
  if (directTarget) {
    receiptFuelKey = String(fuelKioskLastReceipt?.fuelKey || fuelKioskKey || '');
    receiptFuelName = String(fuelKioskLastReceipt?.fuelName || fuelKioskItem?.name || '연료');
    const targetFuelKey = String(machineFuelKeyFromType(directTarget?.item?.fuelType) || '');
    if (targetFuelKey && receiptFuelKey && targetFuelKey !== receiptFuelKey) {
      window.alert(`선택 차량은 ${machineFuelTypeLabelOf(directTarget?.item?.fuelType)}만 주유할 수 있습니다.`);
      return;
    }
    receiptLiters = floorLitersToStep(fuelKioskLastReceipt?.liters);
    const receiptRemain = floorLitersToStep(receiptRemainingLiters(fuelKioskLastReceipt));
    const tankCap = Math.max(0, machineTankCapacityLitersOfItem(directTarget.item));
    const tankCurrent = Math.max(0, machineFuelLitersTrackedOfInstance(game, directTarget.id, directTarget.item));
    const tankRemain = floorLitersToStep(Math.max(0, tankCap - tankCurrent));
    const requestedDraft = floorLitersToStep(requestedLitersInput ?? fuelKioskFillLitersDraft);
    fillLiters = floorLitersToStep(
      Math.max(
        0,
        Math.min(
          receiptRemain,
          tankRemain,
          requestedDraft > 0 ? requestedDraft : Math.min(receiptRemain, tankRemain)
        )
      )
    );
    if (fillLiters <= 0) {
      if (tankRemain <= 0) {
        window.alert('선택한 차량 연료탱크가 이미 가득 찼습니다.');
      } else {
        window.alert('주유 가능한 수량이 없습니다.');
      }
      return;
    }
  } else {
    const prepared = prepareFuelingRequest({
      receipt: fuelKioskLastReceipt,
      fallbackFuelKey: fuelKioskKey,
      fallbackFuelName: fuelKioskItem?.name || '연료',
      selectedCan,
      inventory: game?.inventory || {},
      requestedLitersInput,
      draftLiters: fuelKioskFillLitersDraft
    });
    if (!prepared.ok) {
      if (prepared.reason) window.alert(prepared.reason);
      return;
    }
    receiptFuelKey = prepared.receiptFuelKey;
    receiptFuelName = prepared.receiptFuelName;
    receiptLiters = prepared.receiptLiters;
    containerKey = prepared.containerKey;
    canLabel = prepared.canLabel;
    storableRemainLiters = prepared.storableRemainLiters;
    fillLiters = prepared.fillLiters;
  }
  setFuelKioskAnimatingFillLiters(fillLiters);
  if (!directTarget) {
    setFuelKioskCanVisualSnapshot({
      label: String(
        fuelKioskSelectedCanDisplayLabel
        || selectedCan?.displayLabel
        || selectedCan?.label
        || ''
      ),
      fuelKey: String(selectedCan?.activeFuelKey || receiptFuelKey || ''),
      sizeClass: String(fuelKioskSelectedCanSizeClass || ''),
      capacityPerUnit: Math.max(1, Number(selectedCan?.capacityPerUnit) || 1),
      fillRatio: Math.max(0, Math.min(1, Number(fuelKioskSelectedCanFillRatio) || 0))
    });
  }
  setFuelKioskFueling(true);
  setFuelKioskFuelingDone(false);
  setFuelKioskFuelingProgress(0);
  const fuelingStartAt = Date.now();
  fuelKioskFuelingProgressTimerRef.current = setInterval(() => {
    const elapsed = Date.now() - fuelingStartAt;
    const nextProgress = Math.max(0, Math.min(1, elapsed / FUEL_KIOSK_FUELING_DURATION_MS));
    setFuelKioskFuelingProgress(nextProgress);
    if (nextProgress >= 1 && fuelKioskFuelingProgressTimerRef.current) {
      clearInterval(fuelKioskFuelingProgressTimerRef.current);
      fuelKioskFuelingProgressTimerRef.current = null;
    }
  }, 100);
  fuelKioskFuelingTimerRef.current = setTimeout(() => {
    if (receiptFuelKey && fillLiters > 0) {
      let appliedFillLiters = fillLiters;
      if (directTarget) {
        const directTargetId = String(directTarget.id || '');
        setGame((prev) => {
          if (!prev || !directTargetId) return prev;
          const parsedTarget = parseMachineParkingInstanceId(directTargetId);
          const fallbackItem = parsedTarget
            ? (MACHINE_ITEM_MAP?.[parsedTarget.machineKey] || EQUIPMENT_ITEM_MAP?.[parsedTarget.machineKey] || null)
            : null;
          const targetMachine = {
            id: directTargetId,
            machineKey: String(directTarget?.machineKey || parsedTarget?.machineKey || ''),
            unitNo: Math.max(1, Math.floor(Number(directTarget?.unitNo ?? parsedTarget?.unitNo) || 1)),
            item: directTarget?.item || fallbackItem
          };
          if (!targetMachine.item || !isCombustionMachineItem(targetMachine.item)) {
            appliedFillLiters = 0;
            return prev;
          }
          const cap = Math.max(0, machineTankCapacityLitersOfItem(targetMachine.item));
          const current = Math.max(0, machineFuelLitersTrackedOfInstance(prev, targetMachine.id, targetMachine.item));
          const room = floorLitersToStep(Math.max(0, cap - current));
          const safeFill = floorLitersToStep(Math.max(0, Math.min(fillLiters, room)));
          appliedFillLiters = safeFill;
          if (safeFill <= 0) return prev;
          const nextFuel = clamp(current + safeFill, 0, cap);
          return {
            ...prev,
            machineFuelByInstance: {
              ...(prev.machineFuelByInstance || {}),
              [targetMachine.id]: nextFuel
            },
            logs: pushDiary(
              prev,
              `차량 직주유: ${targetMachine.item?.name || targetMachine.machineKey} #${targetMachine.unitNo} / ${receiptFuelName} ${safeFill}L (탱크 ${nextFuel.toFixed(1)}L/${cap.toFixed(1)}L)`
            )
          };
        });
      } else if (fuelKioskStagedCan) {
        const cap = Math.max(1, Number(fuelKioskStagedCan?.capacityPerUnit) || 1);
        const currentLiters = floorLitersToStep(Math.max(0, Number(fuelKioskStagedCan?.storedLiters) || 0));
        const room = floorLitersToStep(Math.max(0, cap - currentLiters));
        const safeFill = floorLitersToStep(Math.max(0, Math.min(fillLiters, room)));
        appliedFillLiters = safeFill;
        if (safeFill > 0) {
          setFuelKioskStagedCan((prev) => {
            if (!prev) return prev;
            const prevLiters = floorLitersToStep(Math.max(0, Number(prev?.storedLiters) || 0));
            const nextLiters = floorLitersToStep(Math.min(cap, prevLiters + safeFill));
            return {
              ...prev,
              storedLiters: nextLiters,
              fuelKey: String(receiptFuelKey || prev?.fuelKey || '')
            };
          });
        }
      } else {
        setGame((prev) => {
          const applied = applyFuelFillToGame(prev, {
            containerKey,
            receiptFuelKey,
            fillLiters,
            storableRemainLiters,
            canLabel,
            receiptFuelName,
            targetCarrierId: '',
            pushDiary
          });
          appliedFillLiters = applied.appliedFillLiters;
          return applied.nextState;
        });
      }
      setFuelKioskLastReceipt((prev) => {
        if (!prev) return prev;
        const currentRemain = receiptRemainingLiters(prev);
        return {
          ...prev,
          remainingLiters: Math.max(0, currentRemain - appliedFillLiters)
        };
      });
      if (appliedFillLiters > 0) {
        if (directTarget) {
          const nextDirectSuggestedFill = floorLitersToStep(
            Math.max(0, Math.min(
              fuelKioskMaxFillLiters,
              Math.max(0, Number(fuelKioskFillLitersDraft) || 0)
            ))
          );
          setFuelKioskFillLitersDraft(nextDirectSuggestedFill > 0 ? formatLiterText(nextDirectSuggestedFill) : '');
        } else {
          const canDisplay = computeCanDisplayAfterFill({
            selectedCan,
            receiptFuelName,
            appliedFillLiters,
            containerKey,
            receiptLiters,
            storableRemainLiters
          });
          if (canDisplay.labelOverride) {
            setFuelKioskSelectedCanLabelOverride(canDisplay.labelOverride);
          }
          if (!fuelKioskStagedCan && canDisplay.nextCanKey) {
            setFuelKioskCanKey(canDisplay.nextCanKey);
            setFuelKioskBorrowedCan((prev) => {
              if (!prev) return prev;
              if (String(prev.itemKey || '') !== String(containerKey || '')) return prev;
              return {
                ...prev,
                optionKey: String(canDisplay.nextCanKey || '')
              };
            });
          }
          const nextSuggestedFill = canDisplay.nextSuggestedFill;
          setFuelKioskFillLitersDraft(nextSuggestedFill > 0 ? formatLiterText(nextSuggestedFill) : '');
        }
        setFuelKioskFuelApplied(true);
      }
    }
    setFuelKioskFueling(false);
    setFuelKioskFuelingDone(true);
    setFuelKioskFuelingProgress(0);
    setFuelKioskAnimatingFillLiters(0);
    if (fuelKioskFuelingProgressTimerRef.current) {
      clearInterval(fuelKioskFuelingProgressTimerRef.current);
      fuelKioskFuelingProgressTimerRef.current = null;
    }
    fuelKioskFuelingTimerRef.current = null;
  }, FUEL_KIOSK_FUELING_DURATION_MS);
}

export function fuelKioskChooseTypeAction({
  fuelKey,
  setFuelKioskKey,
  setFuelKioskLastReceipt,
  setFuelKioskFuelApplied,
  setFuelKioskPresetManwon,
  setFuelKioskPendingLiters,
  setFuelKioskPendingAmount,
  setFuelKioskPendingSourceLabel,
  setFuelKioskStep
}) {
  if (!fuelKey) return;
  setFuelKioskKey(fuelKey);
  setFuelKioskLastReceipt(null);
  setFuelKioskFuelApplied(false);
  setFuelKioskPresetManwon(1);
  setFuelKioskPendingLiters(0);
  setFuelKioskPendingAmount(0);
  setFuelKioskPendingSourceLabel('');
  setFuelKioskStep('amount');
}

export function fuelKioskGoBackAction({
  fuelKioskStep,
  fuelKioskLastReceipt,
  setFuelKioskCancelConfirmOpen,
  setFuelKioskCanKey,
  setFuelKioskDirectTargetCarrierId,
  setFuelKioskCanPickerOpen,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelApplied,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskFillLitersDraft,
  setFuelKioskStep,
  refundFuelKioskRemaining,
  setFuelKioskStarted
}) {
  if (fuelKioskStep === 'confirm') {
    const remainingLiters = receiptRemainingLiters(fuelKioskLastReceipt);
    if (remainingLiters > 0) {
      setFuelKioskCancelConfirmOpen(true);
    } else {
      setFuelKioskCanKey('');
      setFuelKioskDirectTargetCarrierId('');
      setFuelKioskCanPickerOpen(false);
      setFuelKioskFueling(false);
      setFuelKioskFuelingDone(false);
      setFuelKioskFuelApplied(false);
      setFuelKioskSelectedCanLabelOverride('');
      setFuelKioskFillLitersDraft('');
      setFuelKioskStep('type');
    }
    return;
  }
  if (fuelKioskStep === 'settle') {
    const remainingLiters = receiptRemainingLiters(fuelKioskLastReceipt);
    if (remainingLiters > 0) {
      refundFuelKioskRemaining();
    }
    setFuelKioskStep('amount');
    return;
  }
  if (fuelKioskStep === 'type') {
    setFuelKioskStarted(false);
    setFuelKioskStep('type');
    setFuelKioskDirectTargetCarrierId('');
    setFuelKioskCanPickerOpen(false);
    return;
  }
  if (fuelKioskStep === 'amount') {
    setFuelKioskStep('type');
    setFuelKioskCanPickerOpen(false);
    return;
  }
  if (fuelKioskStep === 'amountCustom') {
    setFuelKioskStep('amount');
    setFuelKioskCanPickerOpen(false);
    return;
  }
  setFuelKioskCanPickerOpen(false);
  setFuelKioskStep('amount');
}

export function confirmFuelKioskCancelConfirmAction({
  refundFuelKioskRemaining,
  setFuelKioskCancelConfirmOpen,
  setFuelKioskCanKey,
  setFuelKioskDirectTargetCarrierId,
  setFuelKioskCanPickerOpen,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelApplied,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskFillLitersDraft,
  setFuelKioskStep
}) {
  refundFuelKioskRemaining();
  setFuelKioskCancelConfirmOpen(false);
  setFuelKioskCanKey('');
  setFuelKioskDirectTargetCarrierId('');
  setFuelKioskCanPickerOpen(false);
  setFuelKioskFueling(false);
  setFuelKioskFuelingDone(false);
  setFuelKioskFuelApplied(false);
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskFillLitersDraft('');
  setFuelKioskStep('type');
}

export function fuelKioskSubmitCustomAction({
  fuelKioskCustomValue,
  fuelKioskCustomUnit,
  fuelKioskSelectLiters,
  fuelKioskPurchaseByManwon
}) {
  const num = Math.max(0, Math.floor(Number(fuelKioskCustomValue) || 0));
  if (num <= 0) {
    window.alert('입력 값을 확인해 주세요.');
    return;
  }
  if (fuelKioskCustomUnit === 'liter') {
    fuelKioskSelectLiters(num, '기타(L)');
    return;
  }
  fuelKioskPurchaseByManwon(num);
}

export function fuelKioskPushCustomDigitAction({ digit, setFuelKioskCustomValue }) {
  const d = String(digit ?? '').replace(/[^0-9]/g, '');
  if (!d) return;
  setFuelKioskCustomValue((prev) => {
    const base = String(prev || '');
    const next = (base + d).slice(0, 9);
    return next.replace(/^0+(?=\d)/, '');
  });
}

export function fuelKioskCustomBackspaceAction({ setFuelKioskCustomValue }) {
  setFuelKioskCustomValue((prev) => String(prev || '').slice(0, -1));
}

export function fuelKioskCustomClearAction({ setFuelKioskCustomValue }) {
  setFuelKioskCustomValue('');
}

export function openFuelKioskCardPayModalAction({
  liters,
  sourceLabel,
  amountOverride = 0,
  floorLitersToStep,
  fuelKioskItem,
  fuelKioskUnitPrice,
  setFuelKioskPendingLiters,
  setFuelKioskPendingAmount,
  setFuelKioskPendingSourceLabel,
  fuelKioskPaymentSnapshotRef,
  fuelKioskKey,
  setShopPayMode,
  setShopPayRentId,
  setShopPayCardIndex,
  setShopPayInstallmentMonths,
  setShopPayCardModalOpen
}) {
  const qty = floorLitersToStep(liters);
  if (qty <= 0 || !fuelKioskItem) {
    window.alert('주유 가능한 수량이 없습니다.');
    return;
  }
  const baseAmount = Math.max(0, Math.round(Math.floor(Number(fuelKioskUnitPrice) || 0) * qty));
  const safeAmount = Math.max(0, Math.floor(Number(amountOverride) || 0)) || baseAmount;
  setFuelKioskPendingLiters(qty);
  setFuelKioskPendingAmount(safeAmount);
  setFuelKioskPendingSourceLabel(sourceLabel || '선택');
  fuelKioskPaymentSnapshotRef.current = {
    fuelKey: String(fuelKioskItem?.key || fuelKioskKey || ''),
    fuelName: String(fuelKioskItem?.name || '연료'),
    unitPrice: Math.max(0, Math.floor(Number(fuelKioskUnitPrice) || 0)),
    liters: qty,
    amount: safeAmount,
    sourceLabel: String(sourceLabel || '선택')
  };
  setShopPayMode('fuel-kiosk');
  setShopPayRentId('');
  setShopPayCardIndex(0);
  setShopPayInstallmentMonths(1);
  setShopPayCardModalOpen(true);
}

export function fuelKioskSelectLitersAction({ liters, sourceLabel, floorLitersToStep, openFuelKioskCardPayModal }) {
  const qty = floorLitersToStep(liters);
  if (qty <= 0) {
    window.alert('주유 가능한 수량이 없습니다.');
    return;
  }
  openFuelKioskCardPayModal(qty, sourceLabel, 0);
}

export function fuelKioskPurchaseByManwonAction({
  manwon,
  fuelKioskUnitPrice,
  floorLitersToStep,
  openFuelKioskCardPayModal
}) {
  const amountWon = Math.max(0, Math.floor(Number(manwon) || 0)) * 10000;
  if (fuelKioskUnitPrice <= 0) return;
  const liters = floorLitersToStep(Math.max(0.01, Math.min(9999, amountWon / fuelKioskUnitPrice)));
  openFuelKioskCardPayModal(liters, `${Math.max(0, Math.floor(Number(manwon) || 0))}만원`, amountWon);
}
