export function buildMachineRentPaymentRequest({
  game,
  machineRentPaymentModal,
  selectedCardId = '',
  installmentMonths = 1,
  cardProductById,
  isCreditCardProduct,
  calcCreditInstallmentFee
}) {
  if (!game || !machineRentPaymentModal?.kind) return { ok: false };
  const payAmount = Math.max(0, Math.floor(Number(machineRentPaymentModal.amount) || 0));
  const paidCard = selectedCardId ? (cardProductById[String(selectedCardId || '')] || null) : null;
  const isCreditPayment = isCreditCardProduct(paidCard);
  const safeInstallmentMonths = isCreditPayment ? Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1))) : 1;
  const creditInstallmentFee = isCreditPayment ? calcCreditInstallmentFee(payAmount, safeInstallmentMonths, paidCard) : 0;
  const creditBillTotal = payAmount + creditInstallmentFee;
  if (!isCreditPayment && (Number(game.money) || 0) < payAmount) {
    return { ok: false, reason: '보유 자금이 부족합니다.' };
  }
  return {
    ok: true,
    payAmount,
    paidCard,
    isCreditPayment,
    safeInstallmentMonths,
    creditInstallmentFee,
    creditBillTotal,
    kind: String(machineRentPaymentModal.kind || '')
  };
}

export function buildMachineRentalCheckoutPaymentDraft({
  game,
  item,
  itemKey,
  days,
  totalFee
}) {
  if (!game || !item) return { ok: false };
  const currentQty = Math.max(0, Number(game.inventory?.[itemKey]) || 0);
  if (item.maxQty && currentQty >= item.maxQty) {
    return { ok: false, reason: '최대 보유 수량에 도달했습니다.' };
  }
  if ((Number(game.money) || 0) < totalFee) {
    return { ok: false, reason: '보유 자금이 부족합니다.' };
  }
  return {
    ok: true,
    modal: {
      open: true,
      kind: 'rent-register',
      amount: totalFee,
      itemKey,
      displayName: item.name,
      purchaseOptionKey: '',
      offerId: '',
      durability: 100,
      rentId: '',
      days
    }
  };
}

export function buildUsedMachineOfferPaymentDraft({
  game,
  offer,
  item,
  clamp,
  vehiclePurchaseOptionsOf
}) {
  if (!game || !offer || !item) return { ok: false };
  const safePrice = Math.max(10000, Math.floor(Number(offer.price) || 0));
  const safeDurability = clamp(Number(offer.durability) || 60, 1, 100);
  const purchaseOptionKey = String(offer?.purchaseOptionKey || '');
  const purchaseOption = vehiclePurchaseOptionsOf(item).find((option) => String(option?.key || '') === purchaseOptionKey) || null;
  const displayName = purchaseOption ? `${item.name} (${purchaseOption.label})` : item.name;
  if ((Number(game.money) || 0) < safePrice) {
    return { ok: false, reason: '보유 자금이 부족합니다.' };
  }
  const currentQty = Math.max(0, Number(game.inventory?.[item.key]) || 0);
  if (item.maxQty && currentQty >= item.maxQty) {
    return { ok: false, reason: '최대 보유 수량에 도달했습니다.' };
  }
  return {
    ok: true,
    safePrice,
    safeDurability,
    purchaseOptionKey,
    displayName,
    modal: {
      open: true,
      kind: 'used-register',
      amount: safePrice,
      itemKey: String(item.key || ''),
      displayName,
      purchaseOptionKey,
      offerId: String(offer.id || ''),
      durability: safeDurability,
      rentId: '',
      days: 1
    }
  };
}

export function applyMachineRentPaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    isCreditPayment,
    payAmount,
    creditBillTotal,
    selectedCardId,
    safeInstallmentMonths,
    paidCard,
    label,
    makeCreditCardInstallmentBills,
    won,
    longDate,
    firstDayOfNextMonth,
    pushDiary
  } = options;
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const createdBills = isCreditPayment && creditBillTotal > 0
    ? makeCreditCardInstallmentBills({
        day: prev.day,
        cardId: selectedCardId,
        amount: payAmount,
        label,
        installmentMonths: safeInstallmentMonths,
        card: paidCard,
        breakdown: {
          shopBaseAmount: 0,
          fuelBaseAmount: 0,
          fuelLiters: 0,
          otherBaseAmount: payAmount
        }
      })
    : [];
  const nextPendingBills = isCreditPayment && createdBills.length > 0
    ? [
        ...((prev.pendingCreditCardBills || []).filter((bill) => bill && Number(bill.amount) > 0)),
        ...createdBills
      ]
    : (prev.pendingCreditCardBills || []);
  const feeAmount = Math.max(0, creditBillTotal - payAmount);
  const paymentLog = isCreditPayment
    ? ` / 신용카드 ${safeInstallmentMonths}개월${feeAmount > 0 ? ` (수수료 ${won(feeAmount)})` : ' (무이자)'} / 청구예정 ${won(creditBillTotal)} (${longDate(firstDayOfNextMonth(prev.day))}부터)`
    : '';
  return {
    ...prev,
    money: isCreditPayment ? prev.money : (prev.money - payAmount),
    pendingCreditCardBills: nextPendingBills,
    logs: pushDiary(prev, `${label}: ${won(payAmount)}${paymentLog}`)
  };
}

export function createEmptyMachineRentPaymentModal() {
  return {
    open: false,
    kind: '',
    amount: 0,
    itemKey: '',
    displayName: '',
    offerId: '',
    durability: 100,
    vehiclePlateOverride: null,
    rentId: '',
    days: 1
  };
}
