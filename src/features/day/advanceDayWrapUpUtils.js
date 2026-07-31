import { SEEDLING_KEYS, expireSeedlingsForDay } from '../../utils/seedlings';
import { buildNextWeatherState } from '../background/dailyWeatherForecastUtils';
import { settleDailyFinance } from '../payment/dailyFinanceSettlement';
import { storageFreshnessLossPerDayOf } from '../storage/storageFreshnessProfiles';
import { buildAdvanceDaySummaryLogs, composeAdvanceDayDiaryLog } from '../ui/dayAdvanceLogUtils';

export const buildAdvanceDayWrapUp = (params, deps) => {
  const {
    prev,
    fields,
    nextDay,
    isWeekTick,
    newlyApproved,
    newlyRejected,
    autoCanceledRejected,
    newlyAssigned,
    facilityRepairDoneLogs,
    deadTreeToday,
    pestEventLogs,
    coldDamageFieldLogs,
    winterDamageFieldLogs,
    hailDamageLogs,
    autoRefillLitersTotal,
    autoRefillPowerFeeTotal,
    autoRefillEnvFeeTotal,
    standbyPowerFeeTotal,
    coldStoragePowerFeeTotal,
    evSlowChargeLogs,
    evSlowChargeCostTotal,
    freezeRiskFieldCount,
    weather,
    nextTemperatureC,
    isWinterSeason,
    prevPestRainBoostUntilDay,
    prevWeedRainBoostUntilDay,
    monsoonEndDay,
    dryHotWindUntilDay,
    nextLabor,
    externalCrewLaborByType,
    externalCrewLabor,
    selfLabor,
    externalArrivalNotice,
    crewApprovalNotice,
    assignedRents,
    nextMachineBatteryKwhByInstance,
    monsoonSummerStartsYear,
    monsoonSummerStarts,
    mode,
    currentTimeOfDay,
    dayLog,
    laborLog,
    monsoonLog,
    dryHotWindLog,
    coldSnapLog
  } = params;

  const storage = (prev.storage || [])
    .map((batch) => {
      const facilityKey = String(batch?.storageFacilityKey || '').trim();
      const storedFieldId = String(batch?.storageFieldId || '').trim();
      const storedField = storedFieldId
        ? fields.find((field) => String(field?.id || '') === storedFieldId) || null
        : null;
      const fallbackField = facilityKey
        ? fields.find((field) => (
          Math.max(0, Number(deps.storageTemperature?.fieldFacilityCountOf?.(field, facilityKey) || 0)) > 0
        )) || null
        : null;
      const storageField = storedField || fallbackField;
      const storageTemperatureC = (() => {
        if (!facilityKey || !storageField) return nextTemperatureC;
        const isColdStorageFacility = Boolean(
          deps.storageTemperature?.facilityActsAsColdStorage?.(storageField, facilityKey)
        );
        const coldEnabled = isColdStorageFacility && Boolean(
          deps.storageTemperature?.coldFacilityControlEnabledOf?.(storageField, facilityKey)
        );
        if (!coldEnabled) return nextTemperatureC;
        const unitKey = String(batch?.storageFacilityUnitKey || '').trim();
        if (unitKey) {
          const unitState = storageField?.coldFacilityControlByUnitKey?.[unitKey] || null;
          if (unitState?.enabled !== false) {
            const unitTemp = Number(unitState?.tempC);
            if (Number.isFinite(unitTemp)) {
              return Number(
                deps.storageTemperature?.normalizeColdControlTargetTemp?.(unitTemp, 0) ?? unitTemp
              );
            }
          }
        }
        const fallbackTemp = String(facilityKey).startsWith('panelWarehouse')
          ? Number(storageField?.panelCoolingTargetTempC ?? 0)
          : Number(storageField?.coldStorageTargetTempC ?? 0);
        return Number(
          deps.storageTemperature?.normalizeColdControlTargetTemp?.(fallbackTemp, 0) ?? fallbackTemp
        );
      })();
      const storedDay = Math.max(
        1,
        Math.floor(Number(batch?.storedDay) || Number(batch?.createdDay) || nextDay)
      );
      const daysStored = Math.max(1, nextDay - storedDay);
      const lifeLoss = storageFreshnessLossPerDayOf({
        cropId: String(batch?.cropId || ''),
        temperatureC: storageTemperatureC,
        daysStored,
        oneMcpTreated: Boolean(batch?.treated1Mcp)
      });
      return {
        ...batch,
        life: Math.max(0, Math.round(((Number(batch?.life) || 0) - lifeLoss) * 100) / 100)
      };
    })
    .filter((batch) => batch.qty > 0);

  const weeklyPenaltyCount = isWeekTick
    ? fields.filter((field) => field.owned && field.cropId && deps.weekly.dailyQualityPenaltyFromNutrition(field) > 0).length
    : 0;

  const gaugeLog = isWeekTick
    ? weeklyPenaltyCount > 0
      ? `주간 점검: 토양양분 저하 ${weeklyPenaltyCount}필지(일일 패널티 적용 중)`
      : '주간 점검: 토양양분 상태 양호'
    : '';

  const completedRepairs = (prev.repairOrders || []).filter((order) => nextDay >= order.readyDay);
  const remainedRepairs = (prev.repairOrders || []).filter((order) => nextDay < order.readyDay);
  const naturalWearApplied = deps.equipment.applyEquipmentNaturalWear(prev);
  const nextEquipmentDurability = { ...(naturalWearApplied.equipmentDurability || {}) };
  const nextEquipmentDurabilityByInstance = { ...(naturalWearApplied.equipmentDurabilityByInstance || {}) };

  completedRepairs.forEach((order) => {
    if ((prev.inventory?.[order.itemKey] || 0) <= 0) return;
    nextEquipmentDurability[order.itemKey] = 100;
    const qty = Math.max(0, Number(prev.inventory?.[order.itemKey]) || 0);
    for (let unitNo = 1; unitNo <= qty; unitNo += 1) {
      const instanceId = deps.equipment.machineParkingInstanceId(order.itemKey, unitNo);
      nextEquipmentDurabilityByInstance[instanceId] = 100;
    }
  });

  const {
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
  } = buildAdvanceDaySummaryLogs({
    newlyApproved,
    newlyRejected,
    autoCanceledRejected,
    newlyAssigned,
    completedRepairs,
    facilityRepairDoneLogs,
    deadTreeToday,
    pestEventLogs,
    coldDamageFieldLogs,
    winterDamageFieldLogs,
    hailDamageLogs,
    autoRefillLitersTotal,
    autoRefillPowerFeeTotal,
    autoRefillEnvFeeTotal,
    standbyPowerFeeTotal,
    coldStoragePowerFeeTotal,
    evSlowChargeLogs,
    freezeRiskFieldCount
  }, deps.summaryLogs);

  const nextLedger = { ...(prev.crewShortageLedger || {}) };
  newlyRejected.forEach((rent) => {
    nextLedger[deps.crew.crewRentSignature(rent.type, rent.startDay, rent.endDay)] = rent.extraFee;
  });

  const seedlingExpireResult = expireSeedlingsForDay(prev.inventory || {}, prev.seedlingExpiryByKey || {}, nextDay);
  const seedlingExpiredLogParts = SEEDLING_KEYS
    .map((seedlingKey) => {
      const expiredQty = Number(seedlingExpireResult.expiredByKey?.[seedlingKey]) || 0;
      if (expiredQty <= 0) return '';
      const seedlingName = deps.seedlings.seedlingItems.find((item) => item.key === seedlingKey)?.name || seedlingKey;
      return `${seedlingName} 유통기한 만료 ${expiredQty}주 폐기`;
    })
    .filter(Boolean);
  const seedlingExpireLog = seedlingExpiredLogParts.join(' / ');

  const nextFuelPriceMap = deps.forecast.nextFuelPriceByKey(prev.fuelPriceByKey || {});

  const financeState = settleDailyFinance({
    prev,
    nextDay,
    autoRefillPowerFeeTotal,
    autoRefillEnvFeeTotal,
    standbyPowerFeeTotal,
    evSlowChargeCostTotal,
    cardEffectsById: deps.finance.cardEffectsById,
    cardProductById: deps.finance.cardProductById
  }, deps.finance);

  const {
    nextWeatherForecast,
    nextPestRainBoostUntilDay,
    nextWeedRainBoostUntilDay
  } = buildNextWeatherState({
    prevWeatherForecast: prev.weatherForecast,
    nextDay,
    weatherName: weather.name,
    nextTemperatureC,
    isWinterSeason,
    prevPestRainBoostUntilDay,
    prevWeedRainBoostUntilDay,
    monsoonEndDay,
    monsoonWeather: deps.forecast.monsoonWeather,
    dryHotWindUntilDay,
    dryHotWindWeather: deps.forecast.dryHotWindWeather
  }, deps.forecast);

  const modePrefixLog = mode === 'nextDay' && currentTimeOfDay !== 'night'
    ? '야간 건너뛰고 다음날 진행'
    : '';

  const logs = deps.logging.pushDiary(prev, composeAdvanceDayDiaryLog({
    modePrefixLog,
    dayLog,
    laborLog,
    autoRefillLog,
    standbyPowerFeeLog,
    evSlowChargeLog,
    dueCreditBillLog: financeState.dueCreditBillLog,
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
    loanReviewLogParts: financeState.loanReviewLogParts,
    creditLog: financeState.creditLog
  }), nextDay);

  return {
    storage,
    remainedRepairs,
    nextLedger,
    nextEquipmentDurability,
    nextEquipmentDurabilityByInstance,
    seedlingExpireResult,
    nextFuelPriceMap,
    nextWeatherForecast,
    nextPestRainBoostUntilDay,
    nextWeedRainBoostUntilDay,
    logs,
    ...financeState,
    nextStatePatch: {
      labor: nextLabor,
      crewDailyRentalLimitByDay: deps.crew.ensureCrewDailyRentalLimitByDay(
        prev.crewDailyRentalLimitByDay || prev.crewDailyRentalLimit || {},
        nextDay
      ),
      externalCrewLaborToday: deps.crew.normalizeExternalCrewLaborToday({
        day: nextDay,
        byType: externalCrewLaborByType,
        total: externalCrewLabor,
        self: selfLabor
      }, nextDay),
      externalLaborRemaining: externalCrewLabor,
      externalArrivalNotice,
      crewApprovalNotice,
      crewRents: assignedRents,
      pendingCreditCardBills: financeState.remainCreditBills,
      crewShortageLedger: nextLedger,
      equipmentDurability: nextEquipmentDurability,
      equipmentDurabilityByInstance: nextEquipmentDurabilityByInstance,
      machineBatteryKwhByInstance: nextMachineBatteryKwhByInstance,
      repairOrders: remainedRepairs,
      inventory: seedlingExpireResult.nextInventory,
      seedlingExpiryByKey: seedlingExpireResult.nextSeedlingExpiryByKey,
      fields,
      storage,
      soldToday: 0,
      weather: weather.name,
      weatherDesc: weather.desc,
      temperatureC: nextTemperatureC,
      weatherForecast: nextWeatherForecast,
      pestRainBoostUntilDay: nextPestRainBoostUntilDay,
      weedRainBoostUntilDay: nextWeedRainBoostUntilDay,
      fuelPriceByKey: nextFuelPriceMap,
      monsoonEndDay,
      monsoonSummerStartsYear,
      monsoonSummerStarts,
      dryHotWindUntilDay,
      creditScore: financeState.nextCreditScore,
      creditGrade: financeState.nextCreditGrade,
      loanLimit: financeState.nextLoanLimit,
      loanUsed: financeState.nextLoanUsed,
      loanNextDueDay: financeState.nextLoanNextDueDay,
      loanOverdueDays: financeState.nextLoanOverdueDays,
      creditNoOverdueMonths: financeState.nextNoOverdueMonths,
      loanApplications: financeState.nextLoanApplications,
      loanContracts: financeState.nextLoanContracts,
      logs
    }
  };
};
