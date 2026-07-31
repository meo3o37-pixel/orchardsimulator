export const buildPaymentPhoneNotificationEntry = ({
  summary = '',
  amount = 0,
  paidCard = null,
  isCreditPayment = false,
  installmentMonths = 1,
  creditBillTotal = 0,
  createdDay = 1,
  won
}) => {
  const safeSummary = String(summary || '').trim() || '결제';
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  const safeInstallmentMonths = Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1)));
  const paidCardName = String(paidCard?.name || '').trim();
  const methodText = isCreditPayment
    ? `${paidCardName || '신용카드'} ${safeInstallmentMonths}개월`
    : paidCardName
      ? `${paidCardName} 체크카드`
      : '현금 결제';
  const billedText = isCreditPayment && Number(creditBillTotal) > safeAmount
    ? ` · 청구 ${won(Math.max(0, Math.floor(Number(creditBillTotal) || 0)))}`
    : '';
  return {
    type: 'payment-history',
    source: 'wallet',
    priority: 'normal',
    title: '결제 내역',
    body: `${safeSummary} · ${won(safeAmount)} · ${methodText}${billedText}`,
    createdDay: Math.max(1, Math.floor(Number(createdDay) || 1)),
    createdAtLabel: '결제내역',
    actionApp: 'messages'
  };
};

export const appendPaymentPhoneNotificationToState = (
  prevState,
  appendPhoneNotificationsStatePatch,
  options = {}
) => {
  if (!prevState || typeof appendPhoneNotificationsStatePatch !== 'function') return prevState;
  return {
    ...prevState,
    ...appendPhoneNotificationsStatePatch(prevState, [
      buildPaymentPhoneNotificationEntry(options)
    ])
  };
};

export const appendPaymentPhoneNotificationFromRequest = (
  nextState,
  prevState,
  appendPhoneNotificationsStatePatch,
  {
    summary = '',
    paymentRequest = null,
    won
  } = {}
) => {
  if (!nextState || nextState === prevState || !paymentRequest) return nextState;
  return appendPaymentPhoneNotificationToState(nextState, appendPhoneNotificationsStatePatch, {
    summary,
    amount: paymentRequest.payAmount,
    paidCard: paymentRequest.paidCard,
    isCreditPayment: paymentRequest.isCreditPayment,
    installmentMonths: paymentRequest.safeInstallmentMonths,
    creditBillTotal: paymentRequest.creditBillTotal,
    createdDay: prevState?.day,
    won
  });
};
