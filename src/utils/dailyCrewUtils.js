export const resolveDailyCrewState = (
  {
    prevCrewRents,
    prevLabor,
    nextDay,
    currentTimeOfDay,
    nightSelfLaborBase,
    nightLaborLowUsageThreshold,
    selfLaborBase,
    selfLaborExhausted
  },
  deps
) => {
  const reviewedRents = (prevCrewRents || []).map((rent) => {
    const normalized = deps.normalizeCrewRent(rent);
    if (normalized.status !== 'pending' || nextDay < normalized.reviewDay) return normalized;
    const denied = normalized.approvalRoll < 0.15;
    if (!denied) {
      return {
        ...normalized,
        status: 'approved',
        approvedDay: nextDay,
        paymentPending: true,
        paidDay: 0
      };
    }
    const days = Math.max(1, normalized.endDay - normalized.startDay + 1);
    const extraFee = Math.ceil(normalized.wage * normalized.count * days * 0.15);
    return {
      ...normalized,
      status: 'rejected',
      extraFee,
      rejectedDay: nextDay,
      autoCancelDay: nextDay + 2
    };
  });

  const reviewedAfterPaymentTimeout = reviewedRents.filter(
    (rent) =>
      !(
        rent.status === 'approved'
        && Boolean(rent.paymentPending)
        && Number(rent.approvedDay) > 0
        && nextDay > Number(rent.approvedDay)
      )
  );
  const activeRents = reviewedAfterPaymentTimeout.filter(
    (rent) => !(rent.status === 'rejected' && rent.autoCancelDay > 0 && nextDay >= rent.autoCancelDay)
  );
  const assignedCrewNames = new Set(
    activeRents.flatMap((rent) => deps.normalizeCrewWorkerNames(rent?.workerNames))
  );
  const assignedRents = activeRents.map((rent) => {
    const normalized = deps.normalizeCrewRent(rent);
    if (normalized.status !== 'approved') return normalized;
    if (normalized.paymentPending) return normalized;
    if (nextDay < normalized.startDay || nextDay > normalized.endDay) return normalized;
    return deps.assignCrewProfilesForContract(deps.assignCrewLaborForContract(normalized, nextDay), assignedCrewNames);
  });

  const nightRemainingLabor = currentTimeOfDay === 'night'
    ? Math.max(0, Number(prevLabor) || 0)
    : nightSelfLaborBase;
  const nightUsedLabor = Math.max(0, nightSelfLaborBase - nightRemainingLabor);
  const selfLabor = nightUsedLabor < nightLaborLowUsageThreshold ? selfLaborBase : selfLaborExhausted;

  const newlyApproved = reviewedAfterPaymentTimeout.filter((rent, idx) => {
    const before = deps.normalizeCrewRent((prevCrewRents || [])[idx]);
    return before.status === 'pending' && rent.status === 'approved';
  });
  const newlyRejected = reviewedAfterPaymentTimeout.filter((rent, idx) => {
    const before = deps.normalizeCrewRent((prevCrewRents || [])[idx]);
    return before.status === 'pending' && rent.status === 'rejected';
  });
  const crewApprovalNoticeEntries = [
    ...newlyApproved.map((rent) => ({
      id: rent.id,
      type: rent.type,
      count: rent.count,
      startDay: rent.startDay,
      endDay: rent.endDay,
      result: 'approved'
    })),
    ...newlyRejected.map((rent) => ({
      id: rent.id,
      type: rent.type,
      count: rent.count,
      startDay: rent.startDay,
      endDay: rent.endDay,
      result: 'rejected',
      extraFee: Math.max(0, Math.floor(Number(rent.extraFee) || 0))
    }))
  ];
  const crewApprovalNotice = crewApprovalNoticeEntries.length > 0
    ? {
        day: nextDay,
        entries: crewApprovalNoticeEntries
      }
    : null;

  const autoCanceledRejected = reviewedAfterPaymentTimeout.filter(
    (rent) => rent.status === 'rejected' && rent.autoCancelDay > 0 && nextDay >= rent.autoCancelDay
  );
  const newlyAssigned = assignedRents.filter(
    (rent) => rent.status === 'approved' && rent.startDay === nextDay && rent.assignedDay === nextDay
  );
  const externalArrivalNotice = newlyAssigned.length > 0
    ? (() => {
        const usedNames = new Set();
        return {
          day: nextDay,
          entries: newlyAssigned.map((rent) => {
            const perWorker = Array.isArray(rent?.assignedLaborPerWorker)
              ? rent.assignedLaborPerWorker.map((v) => Math.max(0, Math.floor(Number(v) || 0))).filter((v) => v > 0)
              : [];
            const names = deps.normalizeCrewWorkerNames(rent?.workerNames);
            const genders = deps.normalizeCrewWorkerGenders(rent?.workerGenders, names);
            const profiles = names.length === (perWorker.length || rent.count)
              ? names.map((name, index) => ({ name, gender: genders[index] || deps.crewGenderOfName(name) }))
              : deps.buildRandomCrewProfiles(perWorker.length || rent.count, usedNames);
            profiles.forEach((profile) => usedNames.add(profile.name));
            return {
              id: rent.id,
              type: rent.type,
              count: rent.count,
              total: deps.assignedLaborTotalOfRent(rent),
              perWorker,
              workers: profiles.map((profile, index) => ({
                name: profile.name,
                gender: profile.gender,
                labor: Math.max(0, Math.floor(Number(perWorker[index]) || 0))
              }))
            };
          })
        };
      })()
    : null;

  return {
    reviewedAfterPaymentTimeout,
    assignedRents,
    selfLabor,
    nightUsedLabor,
    newlyApproved,
    newlyRejected,
    autoCanceledRejected,
    crewApprovalNotice,
    newlyAssigned,
    externalArrivalNotice
  };
};
