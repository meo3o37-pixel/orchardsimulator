import { computeFuelPaymentAmount } from './fuelKioskActionUtils';
import { floorNonNeg } from './fuelKioskActionUtils';
import { floorLiterNonNeg } from './fuelKioskActionUtils';

export const prepareFuelKioskPaymentContext = ({
  paymentSnapshot = null,
  fuelKioskItem = null,
  fuelKioskKey = '',
  fuelKioskPendingLiters = 0,
  fuelKioskPendingAmount = 0,
  fuelKioskPendingSourceLabel = '',
  fuelKioskUnitPrice = 0,
  selectedCardId = '',
  installmentMonths = 1,
  resolvedCardOverride = null,
  cardById = {},
  isCreditCardProduct,
  gameMoney = 0
}) => {
  const snapshot = paymentSnapshot && typeof paymentSnapshot === 'object' ? paymentSnapshot : null;
  const fuelKey = String(snapshot?.fuelKey || fuelKioskItem?.key || fuelKioskKey || '');
  const qty = floorLiterNonNeg(snapshot?.liters ?? fuelKioskPendingLiters);
  if (qty <= 0) return { ok: false, reason: '주유 가능한 수량이 없습니다.' };

  const snapshotUnitPrice = floorNonNeg(snapshot?.unitPrice);
  const snapshotFuelName = String(snapshot?.fuelName || '');
  const safeCardId = String(selectedCardId || '');
  const paidCard = resolvedCardOverride
    || (safeCardId ? (cardById[safeCardId] || null) : null);
  if (safeCardId && !paidCard) {
    return { ok: false, reason: '결제 카드 정보를 확인할 수 없습니다. 다시 선택해 주세요.' };
  }
  const isCreditPayment = isCreditCardProduct(paidCard);
  const safeInstallmentMonths = isCreditPayment ? Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1))) : 1;
  const sourceText = String(snapshot?.sourceLabel || fuelKioskPendingSourceLabel || '선택');
  const totalPricePreview = computeFuelPaymentAmount({
    snapshotAmount: snapshot?.amount,
    pendingAmount: fuelKioskPendingAmount,
    snapshotUnitPrice,
    currentUnitPrice: fuelKioskUnitPrice,
    liters: qty
  });
  if (!isCreditPayment && (Number(gameMoney) || 0) < totalPricePreview) {
    return { ok: false, reason: '보유 자금이 부족합니다.' };
  }
  return {
    ok: true,
    snapshot,
    fuelKey,
    qty,
    snapshotUnitPrice,
    snapshotFuelName,
    safeCardId,
    paidCard,
    isCreditPayment,
    safeInstallmentMonths,
    sourceText,
    totalPricePreview
  };
};

export const applyFuelKioskPaymentToGame = (prev, options) => {
  const {
    fuelKey,
    qty,
    snapshotAmount,
    snapshotUnitPrice,
    sourceText,
    isCreditPayment,
    safeInstallmentMonths,
    paidCard,
    selectedCardId,
    snapshotFuelName,
    fallbackFuelName,
    shopItems,
    shopUnitPriceOf,
    calcCreditInstallmentFee,
    makeCreditCardInstallmentBills,
    pushDiary,
    won,
    longDate,
    firstDayOfNextMonth
  } = options;

  const item = (shopItems || []).find((x) => String(x?.key || '') === String(fuelKey || ''));
  const unitPrice = item
    ? Math.max(0, Math.floor(Number(shopUnitPriceOf(prev, item, 'fuel')) || 0))
    : Math.max(0, Math.floor(Number(snapshotUnitPrice) || 0));
  const totalPrice = computeFuelPaymentAmount({
    snapshotAmount,
    pendingAmount: 0,
    snapshotUnitPrice: unitPrice,
    currentUnitPrice: unitPrice,
    liters: qty
  });

  if (!isCreditPayment && (Number(prev.money) || 0) < totalPrice) {
    return { committed: false, nextState: prev, meta: null };
  }

  const creditInstallmentFee = isCreditPayment ? calcCreditInstallmentFee(totalPrice, safeInstallmentMonths, paidCard) : 0;
  const creditBillTotal = totalPrice + creditInstallmentFee;
  const createdBills = isCreditPayment && creditBillTotal > 0
    ? makeCreditCardInstallmentBills({
      day: prev.day,
      cardId: selectedCardId,
      amount: totalPrice,
      label: `주유 결제 (${paidCard?.name || '신용카드'})`,
      installmentMonths: safeInstallmentMonths,
      card: paidCard,
      breakdown: {
        shopBaseAmount: 0,
        fuelBaseAmount: totalPrice,
        fuelLiters: qty,
        otherBaseAmount: 0
      }
    })
    : [];

  const nextPendingBills = isCreditPayment && createdBills.length > 0
    ? [
      ...((prev.pendingCreditCardBills || []).filter((bill) => bill && Number(bill.amount) > 0)),
      ...createdBills
    ]
    : (prev.pendingCreditCardBills || []);

  const committedFuelName = String(item?.name || snapshotFuelName || fallbackFuelName || '연료');
  const nextState = {
    ...prev,
    money: isCreditPayment ? prev.money : (prev.money - totalPrice),
    pendingCreditCardBills: nextPendingBills,
    logs: pushDiary(
      prev,
      `주유 결제: ${committedFuelName} ${qty}L (${sourceText}, 결제금 ${won(totalPrice)})${isCreditPayment ? ` / 신용카드 ${safeInstallmentMonths}개월 / 청구기준금액 ${won(creditBillTotal)} (${longDate(firstDayOfNextMonth(prev.day))}부터)` : ''}`
    )
  };

  return {
    committed: true,
    nextState,
    meta: {
      totalPrice,
      unitPrice: qty > 0 ? Math.max(0, Math.round(totalPrice / qty)) : unitPrice,
      billTotal: creditBillTotal,
      createdDay: Math.max(1, Math.floor(Number(prev.day) || 1)),
      fuelName: committedFuelName,
      billIds: createdBills.map((bill) => String(bill?.id || '')).filter(Boolean)
    }
  };
};
