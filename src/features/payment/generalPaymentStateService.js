function buildNextPendingBills(prev, {
  isCreditPayment = false,
  creditBillTotal = 0,
  selectedCardId = '',
  payAmount = 0,
  billLabel = '',
  safeInstallmentMonths = 1,
  paidCard = null,
  billBreakdown = null,
  makeCreditCardInstallmentBills
}) {
  const createdBills = isCreditPayment && creditBillTotal > 0
    ? makeCreditCardInstallmentBills({
      day: prev.day,
      cardId: selectedCardId,
      amount: payAmount,
      label: billLabel,
      installmentMonths: safeInstallmentMonths,
      card: paidCard,
      breakdown: billBreakdown || {
        shopBaseAmount: 0,
        fuelBaseAmount: 0,
        fuelLiters: 0,
        otherBaseAmount: payAmount
      }
    })
    : [];
  return isCreditPayment && createdBills.length > 0
    ? [
      ...((prev.pendingCreditCardBills || []).filter((bill) => bill && Number(bill.amount) > 0)),
      ...createdBills
    ]
    : (prev.pendingCreditCardBills || []);
}

export function applyLandPurchasePaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    payAmount = 0,
    isCreditPayment = false,
    creditBillTotal = 0,
    selectedCardId = '',
    safeInstallmentMonths = 1,
    paidCard = null,
    makeCreditCardInstallmentBills,
    fields = prev.fields,
    laborCost = 0,
    logText = ''
  } = options || {};
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const nextPendingBills = buildNextPendingBills(prev, {
    isCreditPayment,
    creditBillTotal,
    selectedCardId,
    payAmount,
    billLabel: `토지 매입 결제 (${paidCard?.name || '신용카드'})`,
    safeInstallmentMonths,
    paidCard,
    makeCreditCardInstallmentBills
  });
  return {
    ...prev,
    labor: (Number(prev.labor) || 0) - laborCost,
    money: isCreditPayment ? prev.money : (prev.money - payAmount),
    pendingCreditCardBills: nextPendingBills,
    fields,
    logs: logText
  };
}

export function applyFacilityInstallPaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    payAmount = 0,
    isCreditPayment = false,
    creditBillTotal = 0,
    selectedCardId = '',
    safeInstallmentMonths = 1,
    paidCard = null,
    makeCreditCardInstallmentBills,
    fields = prev.fields,
    logText = ''
  } = options || {};
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const nextPendingBills = buildNextPendingBills(prev, {
    isCreditPayment,
    creditBillTotal,
    selectedCardId,
    payAmount,
    billLabel: `시설 건설 결제 (${paidCard?.name || '신용카드'})`,
    safeInstallmentMonths,
    paidCard,
    makeCreditCardInstallmentBills
  });
  return {
    ...prev,
    money: isCreditPayment ? prev.money : (prev.money - payAmount),
    pendingCreditCardBills: nextPendingBills,
    fields,
    logs: logText
  };
}

export function applyShopCartPaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    payAmount = 0,
    isCreditPayment = false,
    creditBillTotal = 0,
    selectedCardId = '',
    safeInstallmentMonths = 1,
    paidCard = null,
    makeCreditCardInstallmentBills,
    billBreakdown = null,
    statePatch = {},
    logText = ''
  } = options || {};
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const nextPendingBills = buildNextPendingBills(prev, {
    isCreditPayment,
    creditBillTotal,
    selectedCardId,
    payAmount,
    billLabel: `장바구니 결제 (${paidCard?.name || '신용카드'})`,
    safeInstallmentMonths,
    paidCard,
    billBreakdown,
    makeCreditCardInstallmentBills
  });
  return {
    ...prev,
    ...statePatch,
    pendingCreditCardBills: nextPendingBills,
    logs: logText
  };
}

export function applyServicePaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    payAmount = 0,
    isCreditPayment = false,
    creditBillTotal = 0,
    selectedCardId = '',
    safeInstallmentMonths = 1,
    paidCard = null,
    makeCreditCardInstallmentBills,
    statePatch = {},
    logText = '',
    billLabel = ''
  } = options || {};
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const nextPendingBills = buildNextPendingBills(prev, {
    isCreditPayment,
    creditBillTotal,
    selectedCardId,
    payAmount,
    billLabel: String(billLabel || `서비스 결제 (${paidCard?.name || '신용카드'})`),
    safeInstallmentMonths,
    paidCard,
    makeCreditCardInstallmentBills
  });
  return {
    ...prev,
    ...statePatch,
    pendingCreditCardBills: nextPendingBills,
    logs: logText
  };
}
