import { dayFromInput, toDate } from '../../utils/common';

export const isCreditCardProduct = (card) => Number(card?.minScore || 0) > 0;

export const firstDayOfNextMonth = (baseDay) => {
  const d = toDate(baseDay);
  const dueDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const dueInput = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
  return dayFromInput(dueInput);
};

export const firstDayOfOffsetMonth = (baseDay, monthOffset = 1) => {
  const d = toDate(baseDay);
  const dueDate = new Date(d.getFullYear(), d.getMonth() + Math.max(1, Math.floor(Number(monthOffset) || 1)), 1);
  const dueInput = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
  return dayFromInput(dueInput);
};

export const creditInstallmentProfile = (card) => {
  const minScore = Math.max(0, Math.floor(Number(card?.minScore) || 0));
  if (minScore >= 860) return { gradeKey: 'platinum', gradeLabel: '플래티넘', interestFreeMonths: 12, monthlyFeeRate: 0 };
  if (minScore >= 820) return { gradeKey: 'signature', gradeLabel: '시그니처', interestFreeMonths: 10, monthlyFeeRate: 0.0025 };
  if (minScore >= 780) return { gradeKey: 'gold', gradeLabel: '골드', interestFreeMonths: 8, monthlyFeeRate: 0.004 };
  if (minScore >= 740) return { gradeKey: 'silver', gradeLabel: '실버', interestFreeMonths: 6, monthlyFeeRate: 0.0055 };
  return { gradeKey: 'basic', gradeLabel: '일반', interestFreeMonths: 3, monthlyFeeRate: 0.0075 };
};

export const calcCreditInstallmentFee = (amount, installmentMonths, card) => {
  const total = Math.max(0, Math.floor(Number(amount) || 0));
  const months = Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1)));
  if (total <= 0 || months <= 1 || !isCreditCardProduct(card)) return 0;
  const profile = creditInstallmentProfile(card);
  const chargeMonths = Math.max(0, months - profile.interestFreeMonths);
  if (chargeMonths <= 0) return 0;
  return Math.max(0, Math.floor(total * profile.monthlyFeeRate * chargeMonths));
};

const splitInstallmentAmounts = (amount, installmentMonths) => {
  const total = Math.max(0, Math.floor(Number(amount) || 0));
  const months = Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1)));
  const base = Math.floor(total / months);
  const remainder = total - (base * months);
  return Array.from({ length: months }, (_, idx) => (idx < remainder ? (base + 1) : base));
};

const makeCreditCardBill = ({
  day,
  cardId,
  amount,
  label,
  dueDay = null,
  installmentNo = 1,
  installmentTotal = 1,
  shopBaseAmount = 0,
  fuelBaseAmount = 0,
  fuelLiters = 0,
  otherBaseAmount = 0,
  installmentFeeAmount = 0
}) => ({
  id: `ccbill-${day}-${installmentNo}-${Math.floor(Math.random() * 1000000)}`,
  cardId: String(cardId || ''),
  amount: Math.max(0, Math.floor(Number(amount) || 0)),
  label: String(label || '신용카드 결제'),
  createdDay: Math.max(1, Math.floor(Number(day) || 1)),
  dueDay: Math.max(1, Math.floor(Number(dueDay) || firstDayOfNextMonth(day))),
  installmentNo: Math.max(1, Math.floor(Number(installmentNo) || 1)),
  installmentTotal: Math.max(1, Math.floor(Number(installmentTotal) || 1)),
  shopBaseAmount: Math.max(0, Math.floor(Number(shopBaseAmount) || 0)),
  fuelBaseAmount: Math.max(0, Math.floor(Number(fuelBaseAmount) || 0)),
  fuelLiters: Math.max(0, Math.floor(Number(fuelLiters) || 0)),
  otherBaseAmount: Math.max(0, Math.floor(Number(otherBaseAmount) || 0)),
  installmentFeeAmount: Math.max(0, Math.floor(Number(installmentFeeAmount) || 0))
});

export const makeCreditCardInstallmentBills = ({
  day,
  cardId,
  amount,
  label,
  installmentMonths = 1,
  card = null,
  breakdown = null
}) => {
  const totalAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (totalAmount <= 0) return [];
  const months = Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1)));
  const fee = calcCreditInstallmentFee(totalAmount, months, card);
  const billTotal = totalAmount + fee;
  const splitAmounts = splitInstallmentAmounts(billTotal, months);
  const shopBaseTotal = Math.max(0, Math.floor(Number(breakdown?.shopBaseAmount) || 0));
  const fuelBaseTotal = Math.max(0, Math.floor(Number(breakdown?.fuelBaseAmount) || 0));
  const fuelLitersTotal = Math.max(0, Math.floor(Number(breakdown?.fuelLiters) || 0));
  const explicitOtherBase = Math.max(0, Math.floor(Number(breakdown?.otherBaseAmount) || 0));
  const knownBase = shopBaseTotal + fuelBaseTotal + explicitOtherBase;
  const inferredOtherBase = Math.max(0, totalAmount - knownBase);
  const otherBaseTotal = explicitOtherBase + inferredOtherBase;
  const splitShopBase = splitInstallmentAmounts(shopBaseTotal, months);
  const splitFuelBase = splitInstallmentAmounts(fuelBaseTotal, months);
  const splitFuelLiters = splitInstallmentAmounts(fuelLitersTotal, months);
  const splitOtherBase = splitInstallmentAmounts(otherBaseTotal, months);
  const splitFee = splitInstallmentAmounts(fee, months);
  return splitAmounts
    .map((partAmount, idx) => makeCreditCardBill({
      day,
      cardId,
      amount: partAmount,
      label,
      dueDay: firstDayOfOffsetMonth(day, idx + 1),
      installmentNo: idx + 1,
      installmentTotal: months,
      shopBaseAmount: splitShopBase[idx] || 0,
      fuelBaseAmount: splitFuelBase[idx] || 0,
      fuelLiters: splitFuelLiters[idx] || 0,
      otherBaseAmount: splitOtherBase[idx] || 0,
      installmentFeeAmount: splitFee[idx] || 0
    }))
    .filter((bill) => bill.amount > 0);
};

export const calculateCreditBillSettlement = (bill, cardPerkEffectsMap = {}) => {
  const cardId = String(bill?.cardId || '');
  const effects = cardPerkEffectsMap[cardId] || {};
  const shopBaseAmount = Math.max(0, Math.floor(Number(bill?.shopBaseAmount) || 0));
  const fuelBaseAmount = Math.max(0, Math.floor(Number(bill?.fuelBaseAmount) || 0));
  const fuelLiters = Math.max(0, Math.floor(Number(bill?.fuelLiters) || 0));
  const otherBaseAmount = Math.max(0, Math.floor(Number(bill?.otherBaseAmount) || 0));
  const installmentFeeAmount = Math.max(0, Math.floor(Number(bill?.installmentFeeAmount) || 0));
  const hasBreakdown = (shopBaseAmount + fuelBaseAmount + otherBaseAmount + installmentFeeAmount) > 0;
  const grossAmount = hasBreakdown
    ? (shopBaseAmount + fuelBaseAmount + otherBaseAmount + installmentFeeAmount)
    : Math.max(0, Math.floor(Number(bill?.amount) || 0));
  const shopDiscount = Math.floor(shopBaseAmount * Math.max(0, Number(effects.shopDiscountRate) || 0));
  const fuelDiscount = Math.floor(fuelBaseAmount * Math.max(0, Number(effects.fuelDiscountRate) || 0));
  const shopPayable = Math.max(0, shopBaseAmount - shopDiscount);
  const fuelPayable = Math.max(0, fuelBaseAmount - fuelDiscount);
  const shopCashback = Math.floor(shopPayable * Math.max(0, Number(effects.shopCashbackRate) || 0));
  const fuelCashback = Math.floor(fuelPayable * Math.max(0, Number(effects.fuelCashbackRate) || 0));
  const fuelLiterRebate = Math.floor(Math.max(0, Number(effects.fuelPerLiterRebate) || 0) * fuelLiters);
  const benefitAmount = shopDiscount + fuelDiscount + shopCashback + fuelCashback + fuelLiterRebate;
  const payableAmount = Math.max(0, grossAmount - benefitAmount);
  return {
    grossAmount,
    benefitAmount,
    payableAmount
  };
};
