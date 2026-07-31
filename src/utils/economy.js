export const calcUnitPrice = (batch, crops) => {
  const crop = crops?.[batch?.cropId];
  if (!crop) return 0;
  const qualityBonus = 0.75 + (Number(batch?.quality) || 0) / 140;
  const freshnessBonus = 0.7 + (Math.max(0, Math.min(100, Number(batch?.life) || 0)) / 100) * 0.35;
  return Math.floor(crop.basePrice * qualityBonus * freshnessBonus);
};

export const logMoneyFlowType = (line = '') => {
  const text = String(line || '');
  const hasIncomeSign = /\+\s*\d[\d,]*\s*원/.test(text);
  const hasExpenseSign = /-\s*\d[\d,]*\s*원/.test(text);
  if (hasIncomeSign && !hasExpenseSign) return 'income';
  if (hasExpenseSign && !hasIncomeSign) return 'expense';

  const hasWonAmount = /\d[\d,]*\s*원/.test(text);
  if (hasWonAmount) {
    const incomeKeywords = /(판매|수익|정산|입금|환급|보조금)/;
    const expenseKeywords = /(매입|구매|건설|철거비|비용|요금|부담금|결제|수리|대여|지출)/;
    const hasIncomeKeyword = incomeKeywords.test(text);
    const hasExpenseKeyword = expenseKeywords.test(text);
    if (hasIncomeKeyword && !hasExpenseKeyword) return 'income';
    if (hasExpenseKeyword && !hasIncomeKeyword) return 'expense';
  }

  return 'other';
};

export const ageYieldRate = (ageYear) => {
  if (ageYear < 3) return 0;
  if (ageYear === 3) return 0.65;
  return 1;
};
