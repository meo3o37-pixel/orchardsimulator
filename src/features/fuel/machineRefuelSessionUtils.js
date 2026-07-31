export function openMachineRefuelFromWarehouseItem({
  item,
  preferredUnitNo = 1,
  preferredTankKey = 'drive',
  isCombustionMachineItem,
  machineParkingInstanceId,
  machineHasSeparateSprayFuelTank,
  setMachineRefuelTargetInstanceId,
  setMachineRefuelTargetTankKey,
  setMachineRefuelModalOpen
}) {
  if (!item || !isCombustionMachineItem(item)) {
    window.alert('주유 가능한 내연기관 장비가 아닙니다.');
    return;
  }

  const unitNo = Math.max(1, Math.floor(Number(preferredUnitNo) || 1));
  setMachineRefuelTargetInstanceId(machineParkingInstanceId(String(item.key || ''), unitNo));
  setMachineRefuelTargetTankKey(
    preferredTankKey === 'spray' && machineHasSeparateSprayFuelTank(item)
      ? 'spray'
      : 'drive'
  );
  setMachineRefuelModalOpen(true);
}

export function closeMachineRefuelSession({
  machineRefuelTimerRef,
  machineRefuelProgressTimerRef,
  runGenericModalClose,
  setMachineRefuelModalOpen,
  setMachineRefuelTargetInstanceId,
  setMachineRefuelTargetTankKey,
  setMachineRefuelLitersDraft,
  setMachineRefuelCanPickerOpen,
  setMachineRefuelSelectedCan,
  setMachineRefuelAnimating,
  setMachineRefuelAnimatingLiters,
  setMachineRefuelAnimatingProgress
}) {
  if (machineRefuelTimerRef.current) {
    clearTimeout(machineRefuelTimerRef.current);
    machineRefuelTimerRef.current = null;
  }
  if (machineRefuelProgressTimerRef.current) {
    clearInterval(machineRefuelProgressTimerRef.current);
    machineRefuelProgressTimerRef.current = null;
  }

  runGenericModalClose('machineRefuel', () => {
    setMachineRefuelModalOpen(false);
    setMachineRefuelTargetInstanceId('');
    setMachineRefuelTargetTankKey('drive');
    setMachineRefuelLitersDraft('');
    setMachineRefuelCanPickerOpen(false);
    setMachineRefuelSelectedCan(null);
    setMachineRefuelAnimating(false);
    setMachineRefuelAnimatingLiters(0);
    setMachineRefuelAnimatingProgress(0);
  });
}
