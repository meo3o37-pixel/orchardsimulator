export const formatFacilityInstallOptionSuffix = (
  {
    isTreeCountFacility = false,
    treeInstallCount = 0,
    isTank = false,
    tankUpgradeOptionKeys = [],
    hasFacilityBuildOptions = false,
    housingOptionKeys = [],
    housingFurnitureIncluded = false,
    isWell = false,
    wellDepthOptionKey = '',
    wellPrecisionSensorEnabled = false
  },
  deps
) => {
  const treeCountSuffix = isTreeCountFacility ? ` / ${treeInstallCount}주` : '';
  const tankOptionSuffix = (isTank && tankUpgradeOptionKeys.length) ? ` [옵션 ${tankUpgradeOptionKeys.length}개]` : '';
  const facilityOptionSuffix = (!isTank && hasFacilityBuildOptions && housingOptionKeys.length) ? ` [옵션 ${housingOptionKeys.length}개]` : '';
  const housingFurnitureSuffix = housingFurnitureIncluded ? ' [기본 가구 포함]' : '';
  const wellOptionSuffix = isWell ? ` [옵션 ${deps.wellBuildOptionLabel(wellDepthOptionKey, wellPrecisionSensorEnabled)}]` : '';
  return `${treeCountSuffix}${tankOptionSuffix}${facilityOptionSuffix}${housingFurnitureSuffix}${wellOptionSuffix}`;
};

export const formatInstallmentPaymentSuffix = (
  {
    isCreditPayment = false,
    safeInstallmentMonths = 1,
    creditInstallmentFee = 0,
    creditBillTotal = 0,
    day
  },
  deps
) => {
  if (!isCreditPayment) return '';
  return ` / 신용카드 ${safeInstallmentMonths}개월${creditInstallmentFee > 0 ? ` (수수료 ${deps.won(creditInstallmentFee)})` : ' (무이자)'} / 청구예정 ${deps.won(creditBillTotal)} (${deps.longDate(deps.firstDayOfNextMonth(day))}부터)`;
};

export const formatFacilityInstallLogText = (
  {
    facilityName = '',
    optionSuffix = '',
    fieldName = '',
    finalCost = 0,
    uprootSummaryText = '',
    trellisUprootSummaryText = '',
    irrigationUprootSummaryText = ''
  },
  deps
) => `시설 설치: ${facilityName}${optionSuffix} / ${fieldName} (${deps.won(finalCost)})${uprootSummaryText}${trellisUprootSummaryText}${irrigationUprootSummaryText}`;

export const formatFacilityDemolitionLogText = (
  {
    facilityName = '',
    fieldName = '',
    finalCost = 0
  },
  deps
) => `시설 철거: ${facilityName} / ${fieldName} (철거비 ${deps.won(finalCost)})`;

export const formatFacilityRepairLogText = (
  {
    fieldName = '',
    facilityName = '',
    finalDays = 0,
    finalCost = 0
  },
  deps
) => `${fieldName} ${facilityName} 수리 시작 (${finalDays}일, 비용 ${deps.won(finalCost)})`;
