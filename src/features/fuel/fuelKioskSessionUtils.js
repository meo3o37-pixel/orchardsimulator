export function startFuelKioskSession({
  setFuelKioskStarted,
  setFuelKioskStep,
  setFuelKioskLastReceipt,
  setFuelKioskPendingLiters,
  setFuelKioskPendingAmount,
  setFuelKioskPendingSourceLabel,
  setFuelKioskCanKey,
  setFuelKioskCanPickerOpen,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelApplied
}) {
  setFuelKioskStarted(true);
  setFuelKioskStep('type');
  setFuelKioskLastReceipt(null);
  setFuelKioskPendingLiters(0);
  setFuelKioskPendingAmount(0);
  setFuelKioskPendingSourceLabel('');
  setFuelKioskCanKey('');
  setFuelKioskCanPickerOpen(false);
  setFuelKioskFueling(false);
  setFuelKioskFuelingDone(false);
  setFuelKioskFuelApplied(false);
}

export function moveFuelKioskToConfirmStep({
  setFuelKioskCanKey,
  setFuelKioskCanPickerOpen,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelApplied,
  setFuelKioskStep
}) {
  setFuelKioskCanKey('');
  setFuelKioskCanPickerOpen(false);
  setFuelKioskFueling(false);
  setFuelKioskFuelingDone(false);
  setFuelKioskFuelApplied(false);
  setFuelKioskStep('confirm');
}

export function clearFuelKioskDirectTarget({
  setFuelKioskDirectTargetCarrierId,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskCanPickerOpen,
  setFuelKioskFuelingDone,
  setFuelKioskBorrowedCan
}) {
  setFuelKioskDirectTargetCarrierId('');
  setFuelKioskCanKey('');
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskCanPickerOpen(false);
  setFuelKioskFuelingDone(false);
  setFuelKioskBorrowedCan(null);
}

export function resetCompletedFuelKiosk({
  setFuelKioskCanKey,
  setFuelKioskCanPickerOpen,
  setFuelKioskLastReceipt,
  setFuelKioskStep,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskFillLitersDraft,
  setFuelKioskFueling,
  setFuelKioskFuelingDone,
  setFuelKioskFuelApplied
}) {
  setFuelKioskCanKey('');
  setFuelKioskCanPickerOpen(false);
  setFuelKioskLastReceipt(null);
  setFuelKioskStep('type');
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskFillLitersDraft('');
  setFuelKioskFueling(false);
  setFuelKioskFuelingDone(false);
  setFuelKioskFuelApplied(false);
}
