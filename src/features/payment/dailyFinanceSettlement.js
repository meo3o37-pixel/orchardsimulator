export const settleDailyFinance = (
  {
    prev,
    nextDay,
    autoRefillPowerFeeTotal,
    autoRefillEnvFeeTotal,
    standbyPowerFeeTotal,
    evSlowChargeCostTotal,
    cardEffectsById,
    cardProductById
  },
  deps
) => {
  let nextMoney = (Number(prev.money) || 0) - autoRefillPowerFeeTotal - autoRefillEnvFeeTotal - standbyPowerFeeTotal - evSlowChargeCostTotal;
  const currentDayOfMonth = deps.toDate(nextDay).getDate();
  const creditBillsRaw = Array.isArray(prev.pendingCreditCardBills) ? prev.pendingCreditCardBills : [];
  const dueCreditBills = currentDayOfMonth === 1
    ? creditBillsRaw.filter((bill) => Math.max(1, Math.floor(Number(bill?.dueDay) || 1)) <= nextDay)
    : [];
  const remainCreditBills = currentDayOfMonth === 1
    ? creditBillsRaw.filter((bill) => Math.max(1, Math.floor(Number(bill?.dueDay) || 1)) > nextDay)
    : creditBillsRaw;
  const dueCreditBillSettlements = dueCreditBills.map((bill) => ({
    bill,
    settlement: deps.calculateCreditBillSettlement(bill, cardEffectsById)
  }));
  const dueCreditBillTotal = dueCreditBillSettlements.reduce((sum, item) => sum + item.settlement.payableAmount, 0);
  if (dueCreditBillTotal > 0) {
    nextMoney -= dueCreditBillTotal;
  }
  const dueCreditBenefitTotal = dueCreditBillSettlements.reduce((sum, item) => sum + item.settlement.benefitAmount, 0);
  const dueCreditBillLog = dueCreditBillSettlements.length
    ? `신용카드 대금 출금 ${deps.won(dueCreditBillTotal)}${dueCreditBenefitTotal > 0 ? ` (혜택 ${deps.won(dueCreditBenefitTotal)} 적용)` : ''} (${dueCreditBillSettlements.map(({ bill, settlement }) => {
      const card = cardProductById[String(bill?.cardId || '')];
      return `${card?.name || '신용카드'} ${deps.won(settlement.payableAmount)}`;
    }).join(' / ')})`
    : '';

  let nextCreditScore = deps.clampCreditScore(Number(prev.creditScore) || 720);
  let nextLoanUsed = Math.max(0, Number(prev.loanUsed) || 0);
  let nextLoanNextDueDay = Math.max(0, Math.floor(Number(prev.loanNextDueDay) || 0));
  let nextLoanOverdueDays = Math.max(0, Math.floor(Number(prev.loanOverdueDays) || 0));
  let nextNoOverdueMonths = Math.max(0, Math.floor(Number(prev.creditNoOverdueMonths) || 0));
  let nextLoanApplications = [...(prev.loanApplications || [])];
  let nextLoanContracts = [...(prev.loanContracts || [])];
  const creditLogParts = [];
  const loanReviewLogParts = [];

  nextLoanApplications = nextLoanApplications.filter((app) => {
    if (String(app?.status) !== 'pending') return false;
    if (nextDay < (Number(app?.reviewDay) || 0)) return true;
    const amount = Math.max(0, Math.floor(Number(app?.amount) || 0));
    const gradeKey = deps.creditGradeFromScore(nextCreditScore);
    const profile = deps.creditProfileTable[gradeKey] || deps.creditProfileTable.hard;
    const currentLimit = deps.loanLimitFromGrade(gradeKey);
    const remainingLimit = Math.max(0, currentLimit - nextLoanUsed);
    const monthsTotal = Math.max(1, Math.floor(Number(app?.monthsTotal) || deps.loanTermMonths));
    const approved = profile.loanable && amount > 0 && amount <= remainingLimit && Math.random() < (Number(profile.approvalChance) || 0);
    if (approved) {
      nextMoney += amount;
      nextLoanUsed += amount;
      const approvedRate = deps.annualRateByGradeAndTerm(gradeKey, monthsTotal);
      nextLoanContracts.push({
        id: `contract-${app.id}`,
        principalInitial: amount,
        principalRemaining: amount,
        annualRate: approvedRate,
        monthsTotal,
        monthsPaid: 0,
        nextDueDay: nextDay + 30
      });
      loanReviewLogParts.push(`대출 심사결과: 승인 ${deps.won(amount)} (신청일 ${deps.longDate(Number(app?.requestedDay) || nextDay)})`);
    } else {
      loanReviewLogParts.push(`대출 심사결과: 거절 ${deps.won(amount)} (신청일 ${deps.longDate(Number(app?.requestedDay) || nextDay)})`);
    }
    return false;
  });

  const provisionalGrade = deps.creditGradeFromScore(nextCreditScore);
  const provisionalLimit = deps.loanLimitFromGrade(provisionalGrade);
  const utilRatio = provisionalLimit > 0 ? (nextLoanUsed / provisionalLimit) : 0;
  if (utilRatio >= 0.85) {
    nextCreditScore = deps.clampCreditScore(nextCreditScore - 2);
    creditLogParts.push('신용점수 변동: 대출 사용률 높음(-2)');
  } else if (utilRatio >= 0.7) {
    nextCreditScore = deps.clampCreditScore(nextCreditScore - 1);
    creditLogParts.push('신용점수 변동: 대출 사용률 경고(-1)');
  }

  let paidOnTimeToday = false;
  nextLoanContracts = nextLoanContracts
    .map((contract) => {
      const principalRemaining = Math.max(0, Number(contract?.principalRemaining) || 0);
      if (principalRemaining <= 0) return null;
      const nextDueDay = Math.max(1, Math.floor(Number(contract?.nextDueDay) || (nextDay + 30)));
      const monthsTotal = Math.max(1, Math.floor(Number(contract?.monthsTotal) || deps.loanTermMonths));
      const monthsPaid = Math.max(0, Math.floor(Number(contract?.monthsPaid) || 0));
      const annualRate = Math.max(0, Number(contract?.annualRate) || 0);
      if (nextDay < nextDueDay) {
        return {
          ...contract,
          principalRemaining,
          nextDueDay,
          monthsTotal,
          monthsPaid,
          annualRate
        };
      }
      const remainingMonths = Math.max(1, monthsTotal - monthsPaid);
      const installment = deps.equalInstallmentAmount(principalRemaining, annualRate, remainingMonths);
      const monthlyRate = annualRate / 12;
      const interestPortion = Math.round(principalRemaining * monthlyRate);
      const principalPortion = Math.max(0, Math.min(principalRemaining, installment - interestPortion));
      const payAmount = Math.min(installment, principalRemaining + interestPortion);
      if (nextMoney >= payAmount) {
        nextMoney -= payAmount;
        const nextPrincipal = Math.max(0, principalRemaining - principalPortion);
        const nextMonthsPaid = monthsPaid + 1;
        const gain = deps.randIntInclusive(5, 15);
        nextCreditScore = deps.clampCreditScore(nextCreditScore + gain);
        nextLoanOverdueDays = 0;
        nextNoOverdueMonths += 1;
        paidOnTimeToday = true;
        creditLogParts.push(`원리금 상환 성공: ${deps.won(payAmount)} (원금 ${deps.won(principalPortion)} / 이자 ${deps.won(interestPortion)})`);
        if (nextPrincipal <= 0 || nextMonthsPaid >= monthsTotal) {
          return null;
        }
        return {
          ...contract,
          principalInitial: Math.max(0, Number(contract?.principalInitial) || principalRemaining),
          principalRemaining: nextPrincipal,
          annualRate,
          monthsTotal,
          monthsPaid: nextMonthsPaid,
          nextDueDay: nextDueDay + 30
        };
      }
      const penalty = deps.randIntInclusive(30, 80);
      nextCreditScore = deps.clampCreditScore(nextCreditScore - penalty);
      nextLoanOverdueDays += 1;
      nextNoOverdueMonths = 0;
      creditLogParts.push(`원리금 상환 연체: 납부예정 ${deps.won(payAmount)} (신용 -${penalty})`);
      return {
        ...contract,
        principalInitial: Math.max(0, Number(contract?.principalInitial) || principalRemaining),
        principalRemaining,
        annualRate,
        monthsTotal,
        monthsPaid,
        nextDueDay: nextDay + 1
      };
    })
    .filter(Boolean);

  nextLoanUsed = nextLoanContracts.reduce((sum, contract) => sum + Math.max(0, Number(contract?.principalRemaining) || 0), 0);
  nextLoanNextDueDay = nextLoanContracts.length
    ? nextLoanContracts.reduce((min, contract) => Math.min(min, Math.max(1, Math.floor(Number(contract?.nextDueDay) || (nextDay + 30)))), Number.MAX_SAFE_INTEGER)
    : 0;
  if (nextLoanUsed > 0 && deps.toDate(nextDay).getDate() === 1 && nextLoanOverdueDays === 0) {
    nextCreditScore = deps.clampCreditScore(nextCreditScore + 4);
    creditLogParts.push('장기 무연체 보너스: 신용 +4');
  }
  if (paidOnTimeToday && nextNoOverdueMonths > 0 && nextNoOverdueMonths % 3 === 0) {
    nextCreditScore = deps.clampCreditScore(nextCreditScore + 6);
    creditLogParts.push('무연체 누적 보너스: 신용 +6');
  }

  const nextCreditGrade = deps.creditGradeFromScore(nextCreditScore);
  const nextLoanLimit = deps.loanLimitFromGrade(nextCreditGrade);
  if (nextLoanUsed <= 0) {
    nextLoanUsed = 0;
    nextLoanOverdueDays = 0;
    nextNoOverdueMonths = 0;
    nextLoanNextDueDay = 0;
  }

  return {
    nextMoney,
    remainCreditBills,
    dueCreditBillLog,
    nextCreditScore,
    nextCreditGrade,
    nextLoanLimit,
    nextLoanUsed,
    nextLoanNextDueDay,
    nextLoanOverdueDays,
    nextNoOverdueMonths,
    nextLoanApplications,
    nextLoanContracts,
    loanReviewLogParts,
    creditLog: creditLogParts.join(' / ')
  };
};
