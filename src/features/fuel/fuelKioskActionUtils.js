export const floorNonNeg = (value) => Math.max(0, Math.floor(Number(value) || 0));
export const floorLiterNonNeg = (value) => (
  Math.max(0, Math.floor(((Number(value) || 0) * 100) + 1e-9) / 100)
);

export const receiptRemainingLiters = (receipt) => (
  floorLiterNonNeg(receipt?.remainingLiters ?? receipt?.liters ?? 0)
);

export const computeFuelPaymentAmount = ({
  snapshotAmount = 0,
  pendingAmount = 0,
  snapshotUnitPrice = 0,
  currentUnitPrice = 0,
  liters = 0
}) => {
  const qty = floorLiterNonNeg(liters);
  const snapshotAmountWon = floorNonNeg(snapshotAmount);
  const pendingAmountWon = floorNonNeg(pendingAmount);
  const snapshotUnitPriceWon = floorNonNeg(snapshotUnitPrice);
  const currentUnitPriceWon = floorNonNeg(currentUnitPrice);
  return Math.max(
    0,
    snapshotAmountWon
    || pendingAmountWon
    || Math.max(0, Math.round(snapshotUnitPriceWon * qty))
    || Math.max(0, Math.round(currentUnitPriceWon * qty))
  );
};

export const computeRequestedFillLiters = (requestedLitersInput = null, draftLiters = '') => (
  floorLiterNonNeg(requestedLitersInput ?? draftLiters ?? 0)
);

export const computeFillLiters = ({
  requestedLiters = 0,
  receiptLiters = 0,
  storableRemainLiters = 0
}) => {
  const requested = floorLiterNonNeg(requestedLiters);
  const receipt = floorLiterNonNeg(receiptLiters);
  const remain = floorLiterNonNeg(storableRemainLiters);
  return requested > 0
    ? floorLiterNonNeg(Math.max(0, Math.min(requested, receipt, remain)))
    : floorLiterNonNeg(Math.max(0, Math.min(receipt, remain)));
};

export const prepareFuelingRequest = ({
  receipt,
  fallbackFuelKey = '',
  fallbackFuelName = '연료',
  selectedCan = null,
  inventory = {},
  requestedLitersInput = null,
  draftLiters = ''
}) => {
  const receiptFuelKey = String(receipt?.fuelKey || fallbackFuelKey || '');
  const receiptFuelName = String(receipt?.fuelName || fallbackFuelName || '연료');
  const receiptLiters = receiptRemainingLiters(receipt);
  if (receiptLiters <= 0) return { ok: false, reason: '' };

  const containerKey = String(selectedCan?.key || '');
  const canLabel = String(selectedCan?.displayLabel || selectedCan?.label || '빈말통');
  if (!containerKey) {
    return { ok: false, reason: '사용 가능한 말통/용기가 없습니다.' };
  }

  const containerOwnedQty = Math.max(0, Number(selectedCan?.qty) || Number(inventory?.[containerKey]) || 0);
  if (containerOwnedQty <= 0) {
    return { ok: false, reason: `${canLabel}을(를) 먼저 구매해 주세요.` };
  }

  const storableRemainLiters = Math.max(
    0,
    Number(selectedCan?.targetCanRemain ?? selectedCan?.storableRemain) || 0
  );
  if (storableRemainLiters <= 0) {
    return { ok: false, reason: `${canLabel} 저장공간이 없습니다. 다른 말통을 선택해 주세요.` };
  }

  const requestedLiters = computeRequestedFillLiters(requestedLitersInput, draftLiters);
  const fillLiters = computeFillLiters({
    requestedLiters,
    receiptLiters,
    storableRemainLiters
  });
  if (fillLiters <= 0) return { ok: false, reason: '' };

  return {
    ok: true,
    receiptFuelKey,
    receiptFuelName,
    receiptLiters,
    containerKey,
    canLabel,
    storableRemainLiters,
    fillLiters
  };
};
