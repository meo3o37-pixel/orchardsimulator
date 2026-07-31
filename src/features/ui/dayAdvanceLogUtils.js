export const buildCrewReviewLog = (
  {
    newlyApproved,
    newlyRejected,
    autoCanceledRejected
  },
  deps
) => [
  ...newlyApproved.map((rent) => `인력 승인: ${deps.crewTypes[rent.type]?.name || '인력'} ${rent.count}명`),
  ...newlyRejected.map((rent) => `인력 미승인: ${deps.crewTypes[rent.type]?.name || '인력'} ${rent.count}명 (추가비용 ${deps.won(rent.extraFee)} 필요)`),
  ...autoCanceledRejected.map((rent) => `인력 신청 자동취소: ${deps.crewTypes[rent.type]?.name || '인력'} ${rent.count}명 (미승인 후 2일 경과)`)
].join(' / ');

export const buildCrewAssignmentLog = ({ newlyAssigned }, deps) => newlyAssigned
  .map((rent) => {
    const total = deps.assignedLaborTotalOfRent(rent);
    return `외부인력 도착: ${deps.crewTypes[rent.type]?.name || '인력'} ${rent.count}명 노동력 ${total} 배정 (계약기간 고정)`;
  })
  .join(' / ');

export const buildRepairCompletionLog = ({ completedRepairs }, deps) => completedRepairs
  .map((order) => `수리완료: ${deps.equipmentItemMap[order.itemKey]?.name || order.itemKey}`)
  .join(' / ');

export const buildAdvanceDaySummaryLogs = (params, deps) => {
  const reviewLog = buildCrewReviewLog(params, deps);
  const assignmentLog = buildCrewAssignmentLog(params, deps);
  const repairLog = buildRepairCompletionLog(params, deps);
  const facilityRepairLog = (params.facilityRepairDoneLogs || []).join(' / ');
  const deadTreeLog = params.deadTreeToday > 0 ? `병충해 피해: ${params.deadTreeToday}그루 고사` : '';
  const pestEventLog = (params.pestEventLogs || []).join(' / ');
  const coldDamageLog = (params.coldDamageFieldLogs || []).join(' / ');
  const winterDamageLog = (params.winterDamageFieldLogs || []).join(' / ');
  const hailDamageLog = (params.hailDamageLogs || []).join(' / ');
  const autoRefillLog = params.autoRefillLitersTotal > 0
    ? `자동 급수: ${Math.floor(params.autoRefillLitersTotal).toLocaleString()}L (전기료 ${deps.won(params.autoRefillPowerFeeTotal)} / 환경부담금 ${deps.won(params.autoRefillEnvFeeTotal)})`
    : '';
  const standbyPowerFeeBreakdown = [
    `한전ON ${deps.won(params.standbyPowerFarmPowerOnDaily)}`,
    `펌프ON ${deps.won(params.standbyPowerIrrigationPumpOnDaily)}`,
    `EV제어ON ${deps.won(params.standbyPowerEvChargerOnDaily)}`,
    `방상팬ON 개당 ${deps.won(params.standbyPowerFrostFanPerUnitDaily)}`,
    params.coldStoragePowerFeeTotal > 0 ? `저온시설ON 총 ${deps.won(params.coldStoragePowerFeeTotal)}` : ''
  ].filter(Boolean).join(' / ');
  const standbyPowerFeeLog = params.standbyPowerFeeTotal > 0
    ? `대기전력료 ${deps.won(params.standbyPowerFeeTotal)} (${standbyPowerFeeBreakdown})`
    : '';
  const evSlowChargeLog = (params.evSlowChargeLogs || []).join(' / ');
  const freezeRiskLog = params.freezeRiskFieldCount > 0
    ? `겨울 물탱크 동파 위험: ${params.freezeRiskFieldCount}필지 (보온 커버 미장착)`
    : '';

  return {
    reviewLog,
    assignmentLog,
    repairLog,
    facilityRepairLog,
    deadTreeLog,
    pestEventLog,
    coldDamageLog,
    winterDamageLog,
    hailDamageLog,
    autoRefillLog,
    standbyPowerFeeLog,
    evSlowChargeLog,
    freezeRiskLog
  };
};

export const composeAdvanceDayDiaryLog = ({
  modePrefixLog,
  dayLog,
  laborLog,
  autoRefillLog,
  standbyPowerFeeLog,
  evSlowChargeLog,
  dueCreditBillLog,
  monsoonLog,
  dryHotWindLog,
  coldSnapLog,
  coldDamageLog,
  winterDamageLog,
  hailDamageLog,
  gaugeLog,
  deadTreeLog,
  pestEventLog,
  freezeRiskLog,
  reviewLog,
  assignmentLog,
  repairLog,
  facilityRepairLog,
  seedlingExpireLog,
  loanReviewLogParts,
  creditLog
}) => {
  const parts = [
    modePrefixLog,
    dayLog,
    laborLog,
    autoRefillLog,
    standbyPowerFeeLog,
    evSlowChargeLog,
    dueCreditBillLog,
    monsoonLog,
    dryHotWindLog,
    coldSnapLog,
    coldDamageLog,
    winterDamageLog,
    hailDamageLog,
    gaugeLog,
    deadTreeLog,
    pestEventLog,
    freezeRiskLog,
    reviewLog,
    assignmentLog,
    repairLog,
    facilityRepairLog,
    seedlingExpireLog,
    ...(Array.isArray(loanReviewLogParts) ? loanReviewLogParts : []),
    creditLog
  ].filter(Boolean);
  return parts.join(' / ');
};
