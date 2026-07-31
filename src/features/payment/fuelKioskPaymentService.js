export function refundFuelKioskRemaining({
  fuelKioskLastReceipt,
  receiptRemainingLiters,
  gameDay,
  setGame,
  CARD_PRODUCT_BY_ID,
  makeCreditCardInstallmentBills,
  pushDiary,
  won,
  appendPaymentPhoneNotificationToState,
  setFuelKioskLastReceipt,
  setFuelKioskFuelApplied,
  setFuelKioskFuelingDone,
  fuelKioskFuelingTimerRef,
  setFuelKioskFueling
}) {
  const receipt = fuelKioskLastReceipt;
  if (!receipt) return;
  const totalLiters = Math.max(0, Math.floor(Number(receipt?.liters) || 0));
  const remainingLiters = receiptRemainingLiters(receipt);
  if (remainingLiters <= 0) return;
  const usedLiters = Math.max(0, totalLiters - remainingLiters);
  const paidAmount = Math.max(0, Math.floor(Number(receipt?.amount) || 0));
  const refundAmount = totalLiters > 0
    ? Math.max(0, Math.round((paidAmount * remainingLiters) / totalLiters))
    : 0;
  const fuelName = String(receipt?.fuelName || '연료');
  const paymentType = String(receipt?.paymentType || 'cash');
  const cardId = String(receipt?.cardId || '');
  const installmentMonths = Math.max(1, Math.min(12, Math.floor(Number(receipt?.installmentMonths) || 1)));
  const createdDay = Math.max(1, Math.floor(Number(receipt?.createdDay) || Number(gameDay) || 1));
  const billIds = new Set((Array.isArray(receipt?.billIds) ? receipt.billIds : []).map((id) => String(id || '')).filter(Boolean));
  setGame((prev) => {
    if (paymentType !== 'credit') {
      const nextState = {
        ...prev,
        money: (Number(prev.money) || 0) + refundAmount,
        logs: pushDiary(
          prev,
          `주유 미사용 환불: ${fuelName} ${remainingLiters}L (${won(refundAmount)})`
        )
      };
      return appendPaymentPhoneNotificationToState
        ? appendPaymentPhoneNotificationToState(nextState, {
          summary: `주유 환불 ${fuelName} ${remainingLiters}L`,
          amount: refundAmount,
          paidCard: null,
          isCreditPayment: false,
          installmentMonths: 1,
          creditBillTotal: refundAmount,
          createdDay,
          won
        })
        : nextState;
    }
    const pending = Array.isArray(prev.pendingCreditCardBills) ? prev.pendingCreditCardBills : [];
    let removedBills = pending.filter((bill) => billIds.has(String(bill?.id || '')));
    let remainBills = pending.filter((bill) => !billIds.has(String(bill?.id || '')));
    if (!removedBills.length && billIds.size === 0 && cardId) {
      const fallbackRemoved = pending.filter((bill) => (
        String(bill?.cardId || '') === cardId
        && Math.max(1, Math.floor(Number(bill?.createdDay) || 0)) === createdDay
        && Number(bill?.fuelLiters || 0) > 0
      ));
      if (fallbackRemoved.length) {
        const fallbackIds = new Set(fallbackRemoved.map((bill) => String(bill?.id || '')).filter(Boolean));
        removedBills = fallbackRemoved;
        remainBills = pending.filter((bill) => !fallbackIds.has(String(bill?.id || '')));
      }
    }
    const paidCard = CARD_PRODUCT_BY_ID[cardId] || null;
    const usedBaseAmount = Math.max(0, paidAmount - refundAmount);
    const rebuiltBills = usedBaseAmount > 0 && cardId
      ? makeCreditCardInstallmentBills({
        day: createdDay,
        cardId,
        amount: usedBaseAmount,
        label: `주유 결제 (${paidCard?.name || '신용카드'})`,
        installmentMonths,
        card: paidCard,
        breakdown: {
          shopBaseAmount: 0,
          fuelBaseAmount: usedBaseAmount,
          fuelLiters: usedLiters,
          otherBaseAmount: 0
        }
      })
      : [];
    const canceledAmount = removedBills.reduce((sum, bill) => sum + Math.max(0, Math.floor(Number(bill?.amount) || 0)), 0);
    const rebuiltAmount = rebuiltBills.reduce((sum, bill) => sum + Math.max(0, Math.floor(Number(bill?.amount) || 0)), 0);
    const creditCancelAmount = Math.max(0, canceledAmount - rebuiltAmount) || Math.max(0, refundAmount);
    const cardName = String(paidCard?.name || '신용카드');
    const nextState = {
      ...prev,
      pendingCreditCardBills: [...remainBills, ...rebuiltBills],
      logs: pushDiary(
        prev,
        `주유 미사용 카드취소: 결제카드 ${cardName} / ${fuelName} ${remainingLiters}L (${won(creditCancelAmount)})`
      )
    };
    return appendPaymentPhoneNotificationToState
      ? appendPaymentPhoneNotificationToState(nextState, {
        summary: `주유 카드취소 ${fuelName} ${remainingLiters}L`,
        amount: creditCancelAmount,
        paidCard,
        isCreditPayment: true,
        installmentMonths,
        creditBillTotal: creditCancelAmount,
        createdDay,
        won
      })
      : nextState;
  });
  setFuelKioskLastReceipt(null);
  setFuelKioskFuelApplied(false);
  setFuelKioskFuelingDone(false);
  if (fuelKioskFuelingTimerRef.current) {
    clearTimeout(fuelKioskFuelingTimerRef.current);
    fuelKioskFuelingTimerRef.current = null;
  }
  setFuelKioskFueling(false);
}

export function confirmFuelKioskPayment({
  selectedCardId = '',
  installmentMonths = 1,
  paymentSnapshot = null,
  resolvedCardOverride = null,
  prepareFuelKioskPaymentContext,
  fuelKioskItem,
  fuelKioskKey,
  fuelKioskPendingLiters,
  fuelKioskPendingAmount,
  fuelKioskPendingSourceLabel,
  fuelKioskUnitPrice,
  CARD_PRODUCT_BY_ID,
  isCreditCardProduct,
  game,
  calcCreditInstallmentFee,
  applyFuelKioskPaymentToGame,
  SHOP_ITEMS,
  shopUnitPriceOf,
  makeCreditCardInstallmentBills,
  pushDiary,
  won,
  longDate,
  firstDayOfNextMonth,
  appendPaymentPhoneNotificationToState,
  setGame,
  setFuelKioskLastReceipt,
  setFuelKioskFuelApplied,
  setFuelKioskPendingLiters,
  setFuelKioskPendingAmount,
  setFuelKioskPendingSourceLabel,
  setFuelKioskCustomValue
}) {
  const prepared = prepareFuelKioskPaymentContext({
    paymentSnapshot,
    fuelKioskItem,
    fuelKioskKey,
    fuelKioskPendingLiters,
    fuelKioskPendingAmount,
    fuelKioskPendingSourceLabel,
    fuelKioskUnitPrice,
    selectedCardId,
    installmentMonths,
    resolvedCardOverride,
    cardById: CARD_PRODUCT_BY_ID,
    isCreditCardProduct,
    gameMoney: Number(game?.money) || 0
  });
  if (!prepared.ok) {
    if (prepared.reason) window.alert(prepared.reason);
    return false;
  }
  const {
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
  } = prepared;
  let paymentCommitted = false;
  let committedTotalPrice = totalPricePreview;
  let committedUnitPrice = qty > 0 ? Math.max(0, Math.round(totalPricePreview / qty)) : snapshotUnitPrice;
  let committedBillTotal = isCreditPayment
    ? (totalPricePreview + calcCreditInstallmentFee(totalPricePreview, safeInstallmentMonths, paidCard))
    : totalPricePreview;
  let committedCreatedDay = Math.max(1, Math.floor(Number(game?.day) || 1));
  let committedBillIds = [];
  let committedFuelName = String(snapshotFuelName || fuelKioskItem?.name || '연료');
  setGame((prev) => {
    const applied = applyFuelKioskPaymentToGame(prev, {
      fuelKey,
      qty,
      snapshotAmount: snapshot?.amount,
      snapshotUnitPrice,
      sourceText,
      isCreditPayment,
      safeInstallmentMonths,
      paidCard,
      selectedCardId,
      snapshotFuelName,
      fallbackFuelName: fuelKioskItem?.name || '연료',
      shopItems: SHOP_ITEMS.fuel || [],
      shopUnitPriceOf,
      calcCreditInstallmentFee,
      makeCreditCardInstallmentBills,
      pushDiary,
      won,
      longDate,
      firstDayOfNextMonth
    });
    if (!applied.committed || !applied.meta) return prev;
    paymentCommitted = true;
    committedTotalPrice = applied.meta.totalPrice;
    committedUnitPrice = applied.meta.unitPrice;
    committedBillTotal = applied.meta.billTotal;
    committedCreatedDay = applied.meta.createdDay;
    committedFuelName = applied.meta.fuelName;
    committedBillIds = applied.meta.billIds;
    return appendPaymentPhoneNotificationToState
      ? appendPaymentPhoneNotificationToState(applied.nextState, {
        summary: `주유 결제 ${applied.meta.fuelName} ${qty}L`,
        amount: applied.meta.totalPrice,
        paidCard,
        isCreditPayment,
        installmentMonths: safeInstallmentMonths,
        creditBillTotal: applied.meta.billTotal,
        createdDay: applied.meta.createdDay,
        won
      })
      : applied.nextState;
  });
  setFuelKioskLastReceipt({
    fuelKey,
    fuelName: committedFuelName,
    liters: qty,
    remainingLiters: qty,
    amount: committedTotalPrice || totalPricePreview,
    sourceText,
    unitPrice: committedUnitPrice,
    paymentType: isCreditPayment ? 'credit' : 'cash',
    cardId: isCreditPayment ? String(paidCard?.id || safeCardId || '') : '',
    installmentMonths: isCreditPayment ? safeInstallmentMonths : 1,
    createdDay: committedCreatedDay,
    billIds: committedBillIds,
    billedTotalAmount: committedBillTotal
  });
  setFuelKioskFuelApplied(false);
  setFuelKioskPendingLiters(0);
  setFuelKioskPendingAmount(0);
  setFuelKioskPendingSourceLabel('');
  setFuelKioskCustomValue('');
  return paymentCommitted || true;
}
