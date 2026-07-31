export function applyCrewRentPaymentToState(prev, options) {
  if (!prev) return prev;
  const {
    rentId,
    target,
    payAmount,
    selectedCardId = '',
    paidCard = null,
    isCreditPayment = false,
    safeInstallmentMonths = 1,
    creditInstallmentFee = 0,
    creditBillTotal = 0,
    makeCreditCardInstallmentBills,
    won,
    longDate,
    firstDayOfNextMonth,
    pushDiary,
    paymentKind = 'approved',
    crewTypeName = '인력'
  } = options || {};
  if (!target || !rentId) return prev;
  if (!isCreditPayment && (Number(prev.money) || 0) < payAmount) return prev;
  const createdBills = isCreditPayment && creditBillTotal > 0
    ? makeCreditCardInstallmentBills({
      day: prev.day,
      cardId: selectedCardId,
      amount: payAmount,
      label: paymentKind === 'rejected'
        ? `인력 재승인 결제 (${paidCard?.name || '신용카드'})`
        : `인력 대여 결제 (${paidCard?.name || '신용카드'})`,
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
  const nextCrewRents = (prev.crewRents || []).map((rent) => {
    if (rent.id !== rentId) return rent;
    if (paymentKind === 'rejected') {
      return {
        ...rent,
        status: 'approved',
        startDay: Math.max(rent.startDay, prev.day),
        approvedDay: prev.day,
        paymentPending: false,
        paidDay: prev.day
      };
    }
    return {
      ...rent,
      paymentPending: false,
      paidDay: prev.day
    };
  });
  const paymentLabel = paymentKind === 'rejected' ? '인력 재승인 결제' : '인력 대여 결제';
  const paymentLog = isCreditPayment
    ? ` / 신용카드 ${safeInstallmentMonths}개월${creditInstallmentFee > 0 ? ` (수수료 ${won(creditInstallmentFee)})` : ' (무이자)'} / 청구예정 ${won(creditBillTotal)} (${longDate(firstDayOfNextMonth(prev.day))}부터)`
    : '';
  return {
    ...prev,
    money: isCreditPayment ? prev.money : (prev.money - payAmount),
    crewRents: nextCrewRents,
    pendingCreditCardBills: nextPendingBills,
    logs: pushDiary(
      prev,
      `${paymentLabel}: ${crewTypeName} ${target.count}명 (${longDate(target.startDay)} ~ ${longDate(target.endDay)}, 총 ${won(payAmount)})${paymentLog}`
    )
  };
}
