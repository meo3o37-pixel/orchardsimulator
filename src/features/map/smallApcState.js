export const SMALL_APC_COLD_STORAGE_BUILDING_KEYS = Object.freeze(['building-1', 'building-2', 'building-3']);
export const SMALL_APC_COLD_STORAGE_SLOT_COUNT = 20;
export const SMALL_APC_STEM_REMOVAL_WORKBENCH_COUNT = 2;
export const SMALL_APC_STEM_REMOVAL_MOVE_IN_DURATION_MS = 3000;
export const SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS = 3000;
export const SMALL_APC_STEM_REMOVAL_BOX_DURATION_MS = 2000;
export const SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS = 3000;
export const SMALL_APC_PRETRIMMED_STEM_REMOVED_CHANCE = 0.8;
export const SMALL_APC_SORTING_LINE_COUNT = 2;
export const SMALL_APC_SORTING_BASE_DURATION_MS = 5000;
export const SMALL_APC_SORTING_BOX_DURATION_MS = 1000;
export const SMALL_APC_SORTING_MOVE_IN_DURATION_MS = 3000;
export const SMALL_APC_SORTING_MOVE_OUT_DURATION_MS = 3000;
export const SMALL_APC_SORTING_IDLE_GAP_MS = 1500;
export const SMALL_APC_PALLETS_PER_SLOT = 3;
const SMALL_APC_STAFF_MEMBER_NAMES = Object.freeze([
  '김현우',
  '박지훈',
  '이서준',
  '최민재',
  '정도윤',
  '강지후',
  '한예준',
  '오수민',
  '윤하람',
  '신가온',
  '문지안',
  '배서윤',
  '임채원',
  '조하은',
  '백나리',
  '송유찬',
  '서도현',
  '남지율',
  '하민성',
  '유채린',
]);
const SMALL_APC_STAFF_ROLE_LABEL_BY_KEY = Object.freeze({
  office: '사무직',
  general: '일반직',
  dietitian: '영양사',
});
const SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY = Object.freeze({
  present: '출근',
  late: '지각',
  absent: '미출근',
  vacation: '휴가',
  hangoverLeave: '숙취휴가',
  sickLeave: '병가',
  offDuty: '퇴근',
  unauthorizedLeave: '무단퇴근',
  missing: '잠수',
});
const SMALL_APC_STAFF_ATTENDANCE_TONE_BY_KEY = Object.freeze({
  present: 'issued',
  late: 'pending',
  absent: 'pending',
  vacation: 'pending',
  hangoverLeave: 'pending',
  sickLeave: 'pending',
  offDuty: 'pending',
  unauthorizedLeave: 'alert',
  missing: 'alert',
});
const SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY = Object.freeze({
  working: '근무중',
  moving: '이동중',
  resting: '휴식중',
  eating: '식사중',
  training: '교육중',
  meeting: '회의중',
  smokingBreak: '흡연중',
});
const SMALL_APC_STAFF_ACTIVITY_TONE_BY_KEY = Object.freeze({
  working: 'issued',
  moving: 'pending',
  resting: 'paid',
  eating: 'paid',
  training: 'paid',
  meeting: 'pending',
  smokingBreak: 'paid',
});
const SMALL_APC_STAFF_FACILITY_RULES = Object.freeze([
  Object.freeze({ key: 'receiving', label: '출하접수대', maxWorkers: 1, workersPerUnit: 1, unitLabel: '창구', entryKey: 'receiving', allowedRoleKeys: ['office'] }),
  Object.freeze({ key: 'loading', label: '하차장', maxWorkers: 8, workersPerUnit: 2, unitLabel: '칸', entryKey: 'loading-yard', allowedRoleKeys: ['general'] }),
  Object.freeze({ key: 'sorting', label: '선별장', maxWorkers: 12, workersPerUnit: 6, unitLabel: '대', entryKey: 'sorting', allowedRoleKeys: ['general'] }),
  Object.freeze({ key: 'coldStorage', label: 'APC 저온창고', maxWorkers: 3, workersPerUnit: 1, unitLabel: '명', entryKey: 'cold-storage', runLabel: '투입', allowedRoleKeys: ['general'] }),
  Object.freeze({ key: 'pickup', label: '물품 임시보관소', maxWorkers: 0, workersPerUnit: 1, unitLabel: '명', entryKey: 'pickup', runLabel: '투입', allowedRoleKeys: ['general'] }),
  Object.freeze({ key: 'office', label: '사무실', maxWorkers: 2, workersPerUnit: 1, unitLabel: '명', entryKey: 'office', runLabel: '투입', allowedRoleKeys: ['office'] }),
  Object.freeze({ key: 'workshop', label: '작업실', maxWorkers: 8, workersPerUnit: 2, unitLabel: '대', entryKey: 'workshop', allowedRoleKeys: ['general'] }),
  Object.freeze({ key: 'lounge', label: '직원휴게실', maxWorkers: 0, workersPerUnit: 1, unitLabel: '명', entryKey: 'lounge', runLabel: '체류', allowedRoleKeys: ['office', 'general', 'dietitian'] }),
  Object.freeze({ key: 'cafeteria', label: '식당', maxWorkers: 2, workersPerUnit: 2, unitLabel: '조', entryKey: 'cafeteria', fixedWorkers: 2, allowedRoleKeys: ['dietitian'] }),
  Object.freeze({ key: 'shipping', label: '상품출고장', maxWorkers: 6, workersPerUnit: 3, unitLabel: '라인', entryKey: 'shipping', allowedRoleKeys: ['general'] }),
]);

const SMALL_APC_FUJI_MONTHLY_AUCTION_RANGE_20KG = Object.freeze({
  1: Object.freeze({
    'A급': Object.freeze([175000, 205000]),
    'B급': Object.freeze([115000, 138000]),
    processing: Object.freeze([21500, 28000]),
  }),
  2: Object.freeze({
    'A급': Object.freeze([180000, 215000]),
    'B급': Object.freeze([118000, 142000]),
    processing: Object.freeze([22500, 29000]),
  }),
  3: Object.freeze({
    'A급': Object.freeze([185000, 220000]),
    'B급': Object.freeze([122000, 146000]),
    processing: Object.freeze([23000, 30000]),
  }),
  4: Object.freeze({
    'A급': Object.freeze([190000, 228000]),
    'B급': Object.freeze([125000, 150000]),
    processing: Object.freeze([23500, 31000]),
  }),
  5: Object.freeze({
    'A급': Object.freeze([195000, 235000]),
    'B급': Object.freeze([128000, 154000]),
    processing: Object.freeze([24000, 32000]),
  }),
  6: Object.freeze({
    'A급': Object.freeze([190000, 230000]),
    'B급': Object.freeze([125000, 152000]),
    processing: Object.freeze([23500, 31000]),
  }),
  7: Object.freeze({
    'A급': Object.freeze([175000, 210000]),
    'B급': Object.freeze([115000, 140000]),
    processing: Object.freeze([21500, 28500]),
  }),
  8: Object.freeze({
    'A급': Object.freeze([160000, 195000]),
    'B급': Object.freeze([105000, 128000]),
    processing: Object.freeze([19500, 25500]),
  }),
  9: Object.freeze({
    'A급': Object.freeze([145000, 180000]),
    'B급': Object.freeze([95000, 118000]),
    processing: Object.freeze([17500, 23500]),
  }),
  10: Object.freeze({
    'A급': Object.freeze([125000, 160000]),
    'B급': Object.freeze([82000, 105000]),
    processing: Object.freeze([15000, 20500]),
  }),
  11: Object.freeze({
    'A급': Object.freeze([120000, 155000]),
    'B급': Object.freeze([78000, 102000]),
    processing: Object.freeze([14000, 20000]),
  }),
  12: Object.freeze({
    'A급': Object.freeze([145000, 178000]),
    'B급': Object.freeze([95000, 120000]),
    processing: Object.freeze([18000, 24000]),
  }),
});

const SMALL_APC_AUCTION_DIE_FACTOR_BY_NO = Object.freeze({
  1: 1.12,
  2: 1.09,
  3: 1.06,
  4: 1.03,
  5: 1.0,
  6: 0.96,
  7: 0.92,
  8: 0.88,
  9: 0.84,
  10: 0.78,
});

const SMALL_APC_SETTLEMENT_FEE_RATE = 0.03;

export function createSmallApcStateRuntime({
  appleSortSizeTableRows = [],
  processGradeLabel = '',
  clamp,
  monthOf,
  toDate,
  normalizeHarvestGradeLabel,
  normalizeHarvestStemRemoved,
  harvestBoxesPerPallet,
  harvestBoxCapacityKg,
  normalizedHarvestLoadBoxKey,
  shopItemMetaByKey = {},
  crops = {},
  qualityStateText,
  buildHarvestBoxStateLabelParts,
  toolImageSrcOf,
} = {}) {
  const processingGradeKey = String(processGradeLabel || '').trim() || '가공용';
  const smallApcStaffFacilityRuleByKey = Object.freeze(
    SMALL_APC_STAFF_FACILITY_RULES.reduce((acc, rule) => {
      acc[String(rule?.key || '')] = rule;
      return acc;
    }, {})
  );
  const inferSmallApcStaffRoleKey = (member = null, index = 0) => {
    const explicitRoleKey = String(member?.roleKey || member?.role || '').trim();
    if (SMALL_APC_STAFF_ROLE_LABEL_BY_KEY[explicitRoleKey]) return explicitRoleKey;
    const assignedFacilityKey = String(member?.assignedFacilityKey || '').trim();
    if (assignedFacilityKey === 'receiving' || assignedFacilityKey === 'office') return 'office';
    if (assignedFacilityKey === 'cafeteria') return 'dietitian';
    if (index < 2) return 'office';
    if (index === 15 || index === 16) return 'dietitian';
    return 'general';
  };
  const createDefaultSmallApcStaffState = () => ({
    members: SMALL_APC_STAFF_MEMBER_NAMES.map((name, index) => {
      const facilityAssignments = [
        'receiving',
        'loading',
        'loading',
        'loading',
        'loading',
        'sorting',
        'sorting',
        'sorting',
        'sorting',
        'sorting',
        'sorting',
        'coldStorage',
        'coldStorage',
        'office',
        'workshop',
        'cafeteria',
        'cafeteria',
        'shipping',
        'shipping',
        'shipping',
      ];
      return {
        id: `small-apc-staff-${index + 1}`,
        name,
        roleKey: inferSmallApcStaffRoleKey({ assignedFacilityKey: facilityAssignments[index] || '' }, index),
        attendanceStatus: 'present',
        activityStatus: 'working',
        assignedFacilityKey: facilityAssignments[index] || '',
      };
    }),
  });
  const smallApcPresentAttendanceKeys = new Set(['present']);
  const smallApcClockedInAttendanceKeys = new Set(['present', 'late']);
  const smallApcActivityFacilityOverrideByKey = Object.freeze({
    resting: 'lounge',
    smokingBreak: 'lounge',
    eating: 'cafeteria',
    meeting: 'office',
    training: 'office',
  });
  const resolveLegacySmallApcAttendanceStatus = (statusKey = 'working') => {
    const normalizedStatusKey = String(statusKey || 'working').trim() || 'working';
    if (SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY[normalizedStatusKey]) return normalizedStatusKey;
    return 'present';
  };
  const resolveLegacySmallApcActivityStatus = (statusKey = 'working') => {
    const normalizedStatusKey = String(statusKey || 'working').trim() || 'working';
    if (SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[normalizedStatusKey]) return normalizedStatusKey;
    return 'working';
  };
  const smallApcEffectiveStatusKeyOf = (member = null) => {
    const attendanceStatus = String(member?.attendanceStatus || 'present').trim() || 'present';
    const activityStatus = String(member?.activityStatus || 'working').trim() || 'working';
    if (!smallApcClockedInAttendanceKeys.has(attendanceStatus)) return attendanceStatus;
    if (attendanceStatus === 'late') return 'late';
    return SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[activityStatus] ? activityStatus : 'working';
  };
  const smallApcCurrentFacilityKeyOf = (member = null) => {
    const attendanceStatus = String(member?.attendanceStatus || 'present').trim() || 'present';
    const activityStatus = String(member?.activityStatus || 'working').trim() || 'working';
    if (!smallApcClockedInAttendanceKeys.has(attendanceStatus)) return '';
    return String(smallApcActivityFacilityOverrideByKey[activityStatus] || member?.assignedFacilityKey || '').trim();
  };
  const smallApcStatusLabelOf = (member = null) => {
    const effectiveStatusKey = smallApcEffectiveStatusKeyOf(member);
    return SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[effectiveStatusKey]
      || SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY[effectiveStatusKey]
      || '근무중';
  };
  const smallApcStatusToneOf = (member = null) => {
    const effectiveStatusKey = smallApcEffectiveStatusKeyOf(member);
    return SMALL_APC_STAFF_ACTIVITY_TONE_BY_KEY[effectiveStatusKey]
      || SMALL_APC_STAFF_ATTENDANCE_TONE_BY_KEY[effectiveStatusKey]
      || 'issued';
  };
  const smallApcStatusDescriptionOf = (member = null) => {
    const attendanceStatus = String(member?.attendanceStatus || 'present').trim() || 'present';
    const activityStatus = String(member?.activityStatus || 'working').trim() || 'working';
    const attendanceLabel = SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY[attendanceStatus] || '출근';
    const activityLabel = SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[activityStatus] || '근무중';
    if (!smallApcClockedInAttendanceKeys.has(attendanceStatus)) return attendanceLabel;
    if (attendanceStatus === 'late') return '지각';
    return activityStatus === 'working' ? attendanceLabel : `${attendanceLabel} · ${activityLabel}`;
  };
  const normalizeSmallApcStaffState = (rawValue = null) => {
    const fallback = createDefaultSmallApcStaffState();
    const rawMembers = Array.isArray(rawValue?.members) ? rawValue.members : fallback.members;
    const normalizedMembers = rawMembers
      .map((member, index) => {
        const id = String(member?.id || `small-apc-staff-${index + 1}`).trim();
        const fallbackName = SMALL_APC_STAFF_MEMBER_NAMES[index] || `직원 ${index + 1}`;
        const assignedFacilityKey = String(member?.assignedFacilityKey || '').trim();
        const facilityRule = smallApcStaffFacilityRuleByKey[assignedFacilityKey] || null;
        const legacyStatusKey = String(member?.status || 'working').trim() || 'working';
        const attendanceStatus = String(member?.attendanceStatus || '').trim() || resolveLegacySmallApcAttendanceStatus(legacyStatusKey);
        const activityStatus = String(member?.activityStatus || '').trim() || resolveLegacySmallApcActivityStatus(legacyStatusKey);
        return {
          id,
          name: String(member?.name || fallbackName).trim() || fallbackName,
          roleKey: inferSmallApcStaffRoleKey(member, index),
          attendanceStatus: SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY[attendanceStatus] ? attendanceStatus : 'present',
          activityStatus: SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[activityStatus] ? activityStatus : 'working',
          assignedFacilityKey: facilityRule ? assignedFacilityKey : '',
        };
      })
      .filter((member) => member.id);
    return {
      members: normalizedMembers.length ? normalizedMembers : fallback.members,
    };
  };
  const SMALL_APC_STAFF_DAILY_ATTENDANCE_WEIGHTS = Object.freeze([
    Object.freeze({ key: 'present', weight: 96.5 }),
    Object.freeze({ key: 'late', weight: 1.2 }),
    Object.freeze({ key: 'absent', weight: 0.6 }),
    Object.freeze({ key: 'vacation', weight: 0.9 }),
    Object.freeze({ key: 'sickLeave', weight: 0.5 }),
    Object.freeze({ key: 'hangoverLeave', weight: 0.08 }),
    Object.freeze({ key: 'unauthorizedLeave', weight: 0.08 }),
    Object.freeze({ key: 'missing', weight: 0.04 }),
  ]);
  const SMALL_APC_STAFF_DAILY_ATTENDANCE_LIMITS = Object.freeze({
    late: 2,
    vacation: 2,
    sickLeave: 2,
    hangoverLeave: 1,
    unauthorizedLeave: 1,
    missing: 1,
    absent: 2,
  });
  const SMALL_APC_STAFF_DAILY_ACTIVITY_WEIGHTS = Object.freeze([
    Object.freeze({ key: 'working', weight: 86 }),
    Object.freeze({ key: 'moving', weight: 1 }),
    Object.freeze({ key: 'resting', weight: 2 }),
    Object.freeze({ key: 'eating', weight: 1 }),
    Object.freeze({ key: 'meeting', weight: 2 }),
    Object.freeze({ key: 'training', weight: 1 }),
    Object.freeze({ key: 'smokingBreak', weight: 1 }),
  ]);
  const SMALL_APC_STAFF_DAILY_ACTIVITY_LIMITS = Object.freeze({
    moving: 1,
    resting: 2,
    eating: 1,
    meeting: 1,
    training: 1,
    smokingBreak: 1,
  });
  const SMALL_APC_STAFF_BASELINE_BY_FACILITY_KEY = Object.freeze({
    receiving: 1,
    cafeteria: 2,
    loading: 2,
    sorting: 0,
    shipping: 0,
    coldStorage: 0,
    office: 1,
    workshop: 0,
  });
  const SMALL_APC_STAFF_REALLOCATION_PRIORITY = Object.freeze([
    'receiving',
    'office',
    'cafeteria',
    'loading',
    'sorting',
    'shipping',
    'coldStorage',
    'workshop',
  ]);
  const pickSmallApcStaffStatusByWeight = (weightRows = [], random = Math.random) => {
    const totalWeight = weightRows.reduce(
      (sum, row) => sum + Math.max(0, Number(row?.weight || 0)),
      0
    );
    let roll = Math.max(0, Number(random?.() ?? Math.random()) || 0) * Math.max(0.0001, totalWeight);
    for (const row of weightRows) {
      roll -= Math.max(0, Number(row?.weight || 0));
      if (roll <= 0) return String(row?.key || 'working').trim() || 'working';
    }
    return 'working';
  };
  const enforceSmallApcStaffAttendanceLimits = (members = []) => {
    const normalizedMembers = Array.isArray(members) ? members.map((member) => ({ ...member })) : [];
    const counts = normalizedMembers.reduce((acc, member) => {
      const attendanceStatus = String(member?.attendanceStatus || 'present').trim();
      acc[attendanceStatus] = (acc[attendanceStatus] || 0) + 1;
      return acc;
    }, {});
    Object.entries(SMALL_APC_STAFF_DAILY_ATTENDANCE_LIMITS).forEach(([attendanceStatus, maxCount]) => {
      let overflow = Math.max(0, (counts[attendanceStatus] || 0) - Math.max(0, Number(maxCount) || 0));
      if (overflow <= 0) return;
      for (const member of normalizedMembers) {
        if (overflow <= 0) break;
        if (String(member?.attendanceStatus || '').trim() !== attendanceStatus) continue;
        member.attendanceStatus = 'present';
        overflow -= 1;
      }
    });
    const escapeCount = ['unauthorizedLeave', 'missing'].reduce(
      (sum, attendanceStatus) => sum + normalizedMembers.filter((member) => String(member?.attendanceStatus || '').trim() === attendanceStatus).length,
      0
    );
    if (escapeCount > 1) {
      let overflow = escapeCount - 1;
      for (const member of normalizedMembers) {
        if (overflow <= 0) break;
        const attendanceStatus = String(member?.attendanceStatus || '').trim();
        if (attendanceStatus !== 'unauthorizedLeave' && attendanceStatus !== 'missing') continue;
        member.attendanceStatus = 'present';
        overflow -= 1;
      }
    }
    return normalizedMembers;
  };
  const enforceSmallApcStaffActivityLimits = (members = []) => {
    const normalizedMembers = Array.isArray(members) ? members.map((member) => ({ ...member })) : [];
    const counts = normalizedMembers.reduce((acc, member) => {
      const activityStatus = String(member?.activityStatus || 'working').trim();
      acc[activityStatus] = (acc[activityStatus] || 0) + 1;
      return acc;
    }, {});
    Object.entries(SMALL_APC_STAFF_DAILY_ACTIVITY_LIMITS).forEach(([activityStatus, maxCount]) => {
      let overflow = Math.max(0, (counts[activityStatus] || 0) - Math.max(0, Number(maxCount) || 0));
      if (overflow <= 0) return;
      for (const member of normalizedMembers) {
        if (overflow <= 0) break;
        if (String(member?.activityStatus || '').trim() !== activityStatus) continue;
        member.activityStatus = 'working';
        overflow -= 1;
      }
    });
    return normalizedMembers;
  };
  const smallApcStaffWorkloadCountOf = (workloadRaw = null, facilityKey = '') => (
    Math.max(0, Math.floor(Number(workloadRaw?.[facilityKey] || 0)))
  );
  const desiredSmallApcStaffCountOf = (facilityKey = '', workloadRaw = null) => {
    const rule = smallApcStaffFacilityRuleByKey[String(facilityKey || '').trim()] || null;
    if (!rule) return 0;
    const safeMaxWorkers = Math.max(0, Math.floor(Number(rule?.maxWorkers) || 0));
    if (safeMaxWorkers <= 0) return 0;
    const workloadCount = smallApcStaffWorkloadCountOf(workloadRaw, facilityKey);
    if (facilityKey === 'cafeteria') return Math.min(safeMaxWorkers, Math.max(0, Number(rule?.fixedWorkers || 0) || 2));
    if (facilityKey === 'receiving') return Math.min(safeMaxWorkers, Math.max(1, workloadCount > 0 ? 1 : 0));
    if (facilityKey === 'office') return Math.min(safeMaxWorkers, Math.max(1, workloadCount > 0 ? 2 : 1));
    if (workloadCount <= 0) return Math.max(0, Number(SMALL_APC_STAFF_BASELINE_BY_FACILITY_KEY[facilityKey] || 0));
    const workersPerUnit = Math.max(1, Math.floor(Number(rule?.workersPerUnit) || 1));
    const activeUnitCount = Math.max(1, Math.ceil(workloadCount / Math.max(1, facilityKey === 'sorting' ? 1 : 2)));
    return Math.min(safeMaxWorkers, activeUnitCount * workersPerUnit);
  };
  const rebalanceSmallApcStaffAssignments = (rawState = null, { workload = null } = {}) => {
    const normalizedState = normalizeSmallApcStaffState(rawState);
    const members = Array.isArray(normalizedState?.members) ? normalizedState.members.map((member) => ({ ...member })) : [];
    const workingMembers = members.filter(
      (member) => smallApcPresentAttendanceKeys.has(String(member?.attendanceStatus || '').trim())
        && String(member?.activityStatus || '').trim() === 'working'
    );
    const workingMembersByRoleKey = workingMembers.reduce((acc, member) => {
      const roleKey = String(member?.roleKey || 'general').trim() || 'general';
      if (!acc[roleKey]) acc[roleKey] = [];
      acc[roleKey].push(member);
      return acc;
    }, {});
    const capacityByFacilityKey = SMALL_APC_STAFF_FACILITY_RULES.reduce((acc, rule) => {
      acc[String(rule?.key || '').trim()] = Math.max(0, Math.floor(Number(rule?.maxWorkers) || 0));
      return acc;
    }, {});
    const desiredByFacilityKey = SMALL_APC_STAFF_REALLOCATION_PRIORITY.reduce((acc, facilityKey) => {
      acc[facilityKey] = desiredSmallApcStaffCountOf(facilityKey, workload);
      return acc;
    }, {});
    const assignedByFacilityKey = {};
    const pushAssignedMember = (facilityKey, member) => {
      if (!assignedByFacilityKey[facilityKey]) assignedByFacilityKey[facilityKey] = [];
      assignedByFacilityKey[facilityKey].push(member);
    };
    const assignFromAllowedRole = (facilityKey, desiredCount) => {
      const rule = smallApcStaffFacilityRuleByKey[facilityKey] || null;
      const allowedRoleKeys = Array.isArray(rule?.allowedRoleKeys) && rule.allowedRoleKeys.length
        ? rule.allowedRoleKeys.map((roleKey) => String(roleKey || '').trim()).filter(Boolean)
        : ['general'];
      const maxCount = Math.max(0, Number(capacityByFacilityKey[facilityKey] || 0));
      const targetCount = Math.min(Math.max(0, desiredCount), maxCount);
      while ((assignedByFacilityKey[facilityKey]?.length || 0) < targetCount) {
        let assignedMember = null;
        let assignedRoleKey = '';
        for (const roleKey of allowedRoleKeys) {
          const nextMember = workingMembersByRoleKey[roleKey]?.shift();
          if (nextMember) {
            assignedMember = nextMember;
            assignedRoleKey = roleKey;
            break;
          }
        }
        if (!assignedMember) break;
        const nextMember = { ...assignedMember, roleKey: assignedRoleKey, assignedFacilityKey: facilityKey };
        pushAssignedMember(facilityKey, nextMember);
      }
    };
    SMALL_APC_STAFF_REALLOCATION_PRIORITY.forEach((facilityKey) => {
      assignFromAllowedRole(facilityKey, desiredByFacilityKey[facilityKey] || 0);
    });
    SMALL_APC_STAFF_REALLOCATION_PRIORITY.forEach((facilityKey) => {
      const desiredCount = desiredByFacilityKey[facilityKey] || 0;
      if (desiredCount <= 0) return;
      assignFromAllowedRole(facilityKey, desiredCount);
    });
    const leftoverWorkingMembers = Object.values(workingMembersByRoleKey).flat();
    leftoverWorkingMembers.forEach((member) => {
      const nextMember = {
        ...member,
        assignedFacilityKey: 'lounge',
      };
      pushAssignedMember('lounge', nextMember);
    });
    const workingMemberById = new Map(
      Object.values(assignedByFacilityKey).flat().map((member) => [member.id, member])
    );
    return {
      members: members.map((member) => {
        const rebalancedMember = workingMemberById.get(member.id) || null;
        return {
          ...member,
          ...(rebalancedMember || {}),
          assignedFacilityKey: String((rebalancedMember?.assignedFacilityKey || member?.assignedFacilityKey || '')).trim(),
        };
      }),
    };
  };
  const rollSmallApcStaffDailyState = (rawState = null, { random = Math.random } = {}) => {
    const normalizedState = normalizeSmallApcStaffState(rawState);
    const rolledMembers = (Array.isArray(normalizedState?.members) ? normalizedState.members : []).map((member) => ({
      ...member,
      attendanceStatus: pickSmallApcStaffStatusByWeight(SMALL_APC_STAFF_DAILY_ATTENDANCE_WEIGHTS, random),
      activityStatus: 'working',
    }));
    const attendanceAdjustedMembers = enforceSmallApcStaffAttendanceLimits(rolledMembers).map((member) => ({
      ...member,
      activityStatus: smallApcPresentAttendanceKeys.has(String(member?.attendanceStatus || '').trim())
        ? pickSmallApcStaffStatusByWeight(SMALL_APC_STAFF_DAILY_ACTIVITY_WEIGHTS, random)
        : 'working',
    }));
    return rebalanceSmallApcStaffAssignments({
      members: enforceSmallApcStaffActivityLimits(attendanceAdjustedMembers),
    });
  };
  const buildSmallApcStaffingProfile = (rawState = null) => {
    const normalizedState = normalizeSmallApcStaffState(rawState);
    const members = Array.isArray(normalizedState?.members) ? normalizedState.members : [];
    const staffRows = members.map((member) => {
      const statusKey = smallApcEffectiveStatusKeyOf(member);
      const assignedFacility = smallApcStaffFacilityRuleByKey[String(member?.assignedFacilityKey || '').trim()] || null;
      const currentFacility = smallApcStaffFacilityRuleByKey[smallApcCurrentFacilityKeyOf(member)] || null;
      const attendanceStatus = String(member?.attendanceStatus || 'present').trim() || 'present';
      const activityStatus = String(member?.activityStatus || 'working').trim() || 'working';
      return {
        ...member,
        roleKey: String(member?.roleKey || 'general').trim() || 'general',
        roleLabel: SMALL_APC_STAFF_ROLE_LABEL_BY_KEY[String(member?.roleKey || 'general').trim()] || '일반직',
        status: statusKey,
        statusKey,
        statusLabel: smallApcStatusLabelOf(member),
        statusTone: smallApcStatusToneOf(member),
        statusDescription: smallApcStatusDescriptionOf(member),
        attendanceKey: attendanceStatus,
        attendanceLabel: SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY[attendanceStatus] || '출근',
        activityKey: activityStatus,
        activityLabel: SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY[activityStatus] || '근무중',
        isClockedIn: smallApcClockedInAttendanceKeys.has(attendanceStatus),
        isWorking: statusKey === 'working',
        assignedFacilityLabel: assignedFacility?.label || '미배치',
        currentFacilityKey: smallApcCurrentFacilityKeyOf(member),
        currentFacilityLabel: currentFacility?.label || '미배치',
      };
    });
    const assignedMembersByFacilityKey = staffRows.reduce((acc, member) => {
      const facilityKey = smallApcCurrentFacilityKeyOf(member);
      if (!facilityKey) return acc;
      if (!acc[facilityKey]) acc[facilityKey] = [];
      acc[facilityKey].push(member);
      return acc;
    }, {});
    const statusSummary = [
      ...Object.keys(SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY),
      ...Object.keys(SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY).filter((key) => key !== 'present'),
    ].reduce((acc, statusKey) => {
      acc[statusKey] = 0;
      return acc;
    }, {});
    members.forEach((member) => {
      const statusKey = smallApcEffectiveStatusKeyOf(member);
      if (Object.prototype.hasOwnProperty.call(statusSummary, statusKey)) {
        statusSummary[statusKey] += 1;
      }
    });
    const roleSummary = Object.keys(SMALL_APC_STAFF_ROLE_LABEL_BY_KEY).reduce((acc, roleKey) => {
      acc[roleKey] = staffRows.filter((member) => String(member?.roleKey || '') === roleKey).length;
      return acc;
    }, {});
    const facilities = SMALL_APC_STAFF_FACILITY_RULES.map((rule) => {
      const assignedMembers = assignedMembersByFacilityKey[String(rule?.key || '')] || [];
      const activeWorkers = assignedMembers.filter((member) => smallApcEffectiveStatusKeyOf(member) === 'working').length;
      const safeMaxWorkers = Math.max(0, Math.floor(Number(rule?.maxWorkers) || 0));
      const workersPerUnit = Math.max(1, Math.floor(Number(rule?.workersPerUnit) || 1));
      const maxUnitCount = safeMaxWorkers > 0 ? Math.floor(safeMaxWorkers / workersPerUnit) : 0;
      const activeUnitCount = safeMaxWorkers <= 0
        ? 0
        : (workersPerUnit <= 1
          ? Math.min(activeWorkers, safeMaxWorkers)
          : Math.min(Math.floor(activeWorkers / workersPerUnit), maxUnitCount));
      const activeHeadline = workersPerUnit <= 1
        ? `현재 ${activeWorkers}/${safeMaxWorkers}명 투입`
        : `현재 ${activeWorkers}/${safeMaxWorkers}명 · ${activeUnitCount}/${maxUnitCount}${String(rule?.unitLabel || '개')} 가동`;
      const assignedHeadline = safeMaxWorkers <= 0
        ? '배치 인원 없음'
        : activeHeadline;
      return {
        ...rule,
        assignedMembers,
        allowedRoleLabels: (Array.isArray(rule?.allowedRoleKeys) ? rule.allowedRoleKeys : [])
          .map((roleKey) => SMALL_APC_STAFF_ROLE_LABEL_BY_KEY[String(roleKey || '').trim()])
          .filter(Boolean),
        activeWorkers,
        activeUnitCount,
        maxUnitCount,
        idleAssignedWorkers: workersPerUnit > 1 ? Math.max(0, activeWorkers - (activeUnitCount * workersPerUnit)) : 0,
        statusLabel: safeMaxWorkers <= 0
          ? '배치 없음'
          : (activeWorkers > 0 ? '가동중' : '대기'),
        statusTone: safeMaxWorkers <= 0
          ? 'paid'
          : (activeWorkers > 0 ? 'issued' : 'pending'),
        summaryText: assignedHeadline,
      };
    });
    const facilityByEntryKey = facilities.reduce((acc, facility) => {
      const entryKey = String(facility?.entryKey || '').trim();
      if (entryKey) acc[entryKey] = facility;
      return acc;
    }, {});
    return {
      state: normalizedState,
      totalWorkers: members.length,
      activeWorkers: staffRows.filter((member) => member.isWorking).length,
      statusSummary,
      roleSummary,
      facilities,
      facilityByKey: facilities.reduce((acc, facility) => {
        acc[String(facility?.key || '')] = facility;
        return acc;
      }, {}),
      facilityByEntryKey,
      staffRows,
    };
  };

  const smallApcMonthlyAuctionRange20KgOf = (monthRaw = 1, gradeLabelRaw = '') => {
    const month = clamp(Math.floor(Number(monthRaw) || 1), 1, 12);
    const gradeLabel = normalizeHarvestGradeLabel(gradeLabelRaw, '미선별') || '미선별';
    const monthRanges = SMALL_APC_FUJI_MONTHLY_AUCTION_RANGE_20KG[month]
      || SMALL_APC_FUJI_MONTHLY_AUCTION_RANGE_20KG[11];
    if (gradeLabel === '미선별') {
      const aRange = monthRanges?.['A급'] || [120000, 155000];
      const bRange = monthRanges?.['B급'] || [78000, 102000];
      const processingRange = monthRanges?.processing || [28000, 40000];
      const min = Math.round((aRange[0] * 0.18) + (bRange[0] * 0.57) + (processingRange[0] * 0.25));
      const max = Math.round((aRange[1] * 0.18) + (bRange[1] * 0.57) + (processingRange[1] * 0.25));
      return [min, max];
    }
    return monthRanges?.[gradeLabel] || monthRanges?.['B급'] || [78000, 102000];
  };

  const smallApcGradeAuctionBase20KgOf = (dayRaw = 1, gradeLabelRaw = '') => {
    const safeDay = Math.max(1, Math.floor(Number(dayRaw) || 1));
    const month = monthOf(safeDay);
    const [minPriceRaw = 0, maxPriceRaw = 0] = smallApcMonthlyAuctionRange20KgOf(month, gradeLabelRaw);
    const minPrice = Math.max(0, Number(minPriceRaw) || 0);
    const maxPrice = Math.max(minPrice, Number(maxPriceRaw) || minPrice);
    if (maxPrice <= minPrice) return minPrice;
    const date = toDate(safeDay);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const ratio = clamp((date.getDate() - 1) / Math.max(1, daysInMonth - 1), 0, 1);
    return Math.round(minPrice + ((maxPrice - minPrice) * ratio));
  };

  const smallApcSizeFactorOf = (sizeLabelRaw = '') => {
    const sizeLabel = String(sizeLabelRaw || '').trim();
    const dieNo = Math.max(0, Number((sizeLabel.match(/(\d+)/) || [])[1] || 0));
    if (dieNo > 0) return Number(SMALL_APC_AUCTION_DIE_FACTOR_BY_NO[dieNo]) || 0.92;
    if (sizeLabel.includes('대과')) return 1.03;
    if (sizeLabel.includes('중과')) return 1.0;
    if (sizeLabel.includes('소과')) return 0.92;
    return 0.96;
  };

  const smallApcQualityFactorOf = (qualityLabelRaw = '') => {
    const qualityLabel = String(qualityLabelRaw || '').trim();
    if (qualityLabel === '최상') return 1.08;
    if (qualityLabel === '상') return 1.04;
    if (qualityLabel === '보통') return 1.0;
    if (qualityLabel === '불량 하하') return 0.72;
    return 0.96;
  };

  const smallApcFreshnessFactorOf = (freshnessRaw = 0) => {
    const freshness = clamp(Number(freshnessRaw) || 0, 0, 100);
    if (freshness >= 95) return 1.0;
    if (freshness >= 85) return 0.97;
    if (freshness >= 70) return 0.91;
    if (freshness >= 55) return 0.82;
    if (freshness >= 40) return 0.7;
    return 0.55;
  };

  const smallApcFreshnessBucketOf = (freshnessRaw = 0) => {
    const freshness = clamp(Number(freshnessRaw) || 0, 0, 100);
    if (freshness >= 80) return '상';
    if (freshness >= 50) return '중';
    return '하';
  };

  const smallApcDeterministicUnitOf = (...parts) => {
    const source = parts
      .map((part) => String(part ?? '').trim())
      .join('::');
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 10000) / 10000;
  };

  const smallApcNpcFallbackFreshnessOf = ({
    ticketNo = '',
    shipmentDay = 0,
    settlementDay = 1,
    cargoType = '사과',
    cargoKg = 0,
  } = {}) => {
    const baseDay = Math.max(1, Math.floor(Number(shipmentDay) || Number(settlementDay) || 1));
    const month = monthOf(baseDay);
    const roll = smallApcDeterministicUnitOf(ticketNo, shipmentDay, settlementDay, cargoType, cargoKg);
    const rangeRoll = smallApcDeterministicUnitOf('range', ticketNo, shipmentDay, settlementDay, cargoType, cargoKg);
    const rangedLifeOf = (min, max) => Math.round(min + ((max - min) * rangeRoll));
    if (month === 9 || month === 10) {
      if (roll < 0.68) return rangedLifeOf(80, 89);
      if (roll < 0.9) return rangedLifeOf(72, 79);
      return rangedLifeOf(64, 71);
    }
    if (month === 8 || month === 11) {
      if (roll < 0.54) return rangedLifeOf(78, 86);
      if (roll < 0.84) return rangedLifeOf(68, 77);
      return rangedLifeOf(56, 67);
    }
    if (roll < 0.32) return rangedLifeOf(76, 84);
    if (roll < 0.76) return rangedLifeOf(60, 75);
    return rangedLifeOf(42, 59);
  };

  const smallApcStemFactorOf = (stemRemoved) => (stemRemoved ? 0.96 : 1.0);

  const createEmptySmallApcColdStorageByBuilding = () => (
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS.reduce((acc, key) => {
      acc[key] = Array.from({ length: SMALL_APC_COLD_STORAGE_SLOT_COUNT }, () => null);
      return acc;
    }, {})
  );

  const normalizeSmallApcColdStorageEntry = (entry = null) => {
    if (!entry || typeof entry !== 'object') return null;
    const normalizeLayerEntry = (layerEntry = null, fallback = {}) => {
      if (!layerEntry || typeof layerEntry !== 'object') return null;
      const layerTotalKg = Math.max(0, Number(layerEntry?.totalKg || 0));
      const layerBoxCount = Math.max(0, Math.floor(Number(layerEntry?.boxCount || 0)));
      if (layerTotalKg <= 0 && layerBoxCount <= 0) return null;
      return {
        rowKey: String(layerEntry?.rowKey || '').trim(),
        slotRowKey: String(layerEntry?.slotRowKey || fallback?.slotRowKey || fallback?.rowKey || '').trim(),
        sourceTicketNo: String(layerEntry?.sourceTicketNo || fallback?.sourceTicketNo || '').trim(),
        shipperName: String(layerEntry?.shipperName || fallback?.shipperName || '').trim(),
        vehicleName: String(layerEntry?.vehicleName || fallback?.vehicleName || '').trim(),
        vehiclePlateText: String(layerEntry?.vehiclePlateText || fallback?.vehiclePlateText || '').trim(),
        playerOwned: typeof layerEntry?.playerOwned === 'boolean' ? layerEntry.playerOwned : Boolean(fallback?.playerOwned),
        cropId: String(layerEntry?.cropId || fallback?.cropId || '').trim(),
        cropLabel: String(layerEntry?.cropLabel || fallback?.cropLabel || '수확물').trim() || '수확물',
        produceTypeLabel: String(layerEntry?.produceTypeLabel || fallback?.produceTypeLabel || '사과').trim() || '사과',
        qualityLabel: String(layerEntry?.qualityLabel || fallback?.qualityLabel || '보통').trim() || '보통',
        gradeLabel: normalizeHarvestGradeLabel(layerEntry?.gradeLabel ?? fallback?.gradeLabel, '미선별') || '미선별',
        sizeLabel: String(layerEntry?.sizeLabel || fallback?.sizeLabel || '미측정').trim() || '미측정',
        stemRemoved: normalizeHarvestStemRemoved(
          typeof layerEntry?.stemRemoved === 'boolean' ? layerEntry.stemRemoved : fallback?.stemRemoved
        ),
        life: clamp(
          Number(
            layerEntry?.life
            ?? fallback?.life
            ?? 0
          ) || 0,
          0,
          100
        ),
        harvestedDay: Math.max(0, Number(layerEntry?.harvestedDay || fallback?.harvestedDay || 0)),
        loadBoxKey: String(layerEntry?.loadBoxKey || fallback?.loadBoxKey || '').trim(),
        loadBoxImageSrc: String(layerEntry?.loadBoxImageSrc || fallback?.loadBoxImageSrc || '').trim(),
        detailText: String(layerEntry?.detailText || fallback?.detailText || '').trim(),
        detailLines: Array.isArray(layerEntry?.detailLines)
          ? layerEntry.detailLines.map((line) => String(line || '').trim()).filter(Boolean)
          : Array.isArray(fallback?.detailLines)
            ? fallback.detailLines.map((line) => String(line || '').trim()).filter(Boolean)
            : [],
        apcStorageStatus: String(layerEntry?.apcStorageStatus || fallback?.apcStorageStatus || '보관중').trim() || '보관중',
        apcStorageStatusUpdatedAt: Math.max(0, Number(layerEntry?.apcStorageStatusUpdatedAt || fallback?.apcStorageStatusUpdatedAt || fallback?.storedAt || 0)),
        apcPackTypeLabel: String(layerEntry?.apcPackTypeLabel || fallback?.apcPackTypeLabel || '').trim(),
        palletStackCount: 1,
        boxCount: layerBoxCount,
        totalKg: layerTotalKg,
        storedAt: Math.max(0, Number(layerEntry?.storedAt || fallback?.storedAt || 0)),
      };
    };
    const baseFallback = {
      rowKey: String(entry?.rowKey || '').trim(),
      slotRowKey: String(entry?.slotRowKey || entry?.rowKey || '').trim(),
      sourceTicketNo: String(entry?.sourceTicketNo || '').trim(),
      shipperName: String(entry?.shipperName || '').trim(),
      vehicleName: String(entry?.vehicleName || '').trim(),
      vehiclePlateText: String(entry?.vehiclePlateText || '').trim(),
      playerOwned: Boolean(entry?.playerOwned),
      cropId: String(entry?.cropId || '').trim(),
      cropLabel: String(entry?.cropLabel || '수확물').trim() || '수확물',
      produceTypeLabel: String(entry?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(entry?.qualityLabel || '보통').trim() || '보통',
      gradeLabel: normalizeHarvestGradeLabel(entry?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(entry?.sizeLabel || '미측정').trim() || '미측정',
      stemRemoved: normalizeHarvestStemRemoved(entry?.stemRemoved),
      life: clamp(Number(entry?.life) || 0, 0, 100),
      harvestedDay: Math.max(0, Number(entry?.harvestedDay) || 0),
      loadBoxKey: String(entry?.loadBoxKey || '').trim(),
      loadBoxImageSrc: String(entry?.loadBoxImageSrc || '').trim(),
      detailText: String(entry?.detailText || '').trim(),
      detailLines: Array.isArray(entry?.detailLines)
        ? entry.detailLines.map((line) => String(line || '').trim()).filter(Boolean)
        : [],
      apcStorageStatus: String(entry?.apcStorageStatus || '보관중').trim() || '보관중',
      apcStorageStatusUpdatedAt: Math.max(0, Number(entry?.apcStorageStatusUpdatedAt || entry?.storedAt || 0)),
      apcPackTypeLabel: String(entry?.apcPackTypeLabel || '').trim(),
      storedAt: Math.max(0, Number(entry?.storedAt) || 0),
    };
    const explicitLayerEntries = Array.isArray(entry?.layerEntries)
      ? entry.layerEntries
        .map((layerEntry) => normalizeLayerEntry(layerEntry, baseFallback))
        .filter(Boolean)
        .slice(0, SMALL_APC_PALLETS_PER_SLOT)
      : [];
    const synthesizedLayerEntries = explicitLayerEntries.length
      ? explicitLayerEntries
      : (() => {
          const totalKg = Math.max(0, Number(entry?.totalKg || 0));
          const boxCount = Math.max(0, Math.floor(Number(entry?.boxCount || 0)));
          if (totalKg <= 0 && boxCount <= 0) return [];
          const approxBoxKg = boxCount > 0 ? (totalKg / boxCount) : harvestBoxCapacityKg;
          let remainingBoxCount = boxCount;
          let remainingTotalKg = totalKg;
          const layers = [];
          while (remainingBoxCount > 0 && layers.length < SMALL_APC_PALLETS_PER_SLOT) {
            const layerBoxCount = Math.min(harvestBoxesPerPallet, remainingBoxCount);
            const layerTotalKg = remainingBoxCount === layerBoxCount
              ? remainingTotalKg
              : Math.min(remainingTotalKg, layerBoxCount * approxBoxKg);
            layers.push(normalizeLayerEntry({
              ...baseFallback,
              rowKey: `${baseFallback.rowKey || baseFallback.slotRowKey || 'small-apc-layer'}::layer-${layers.length + 1}`,
              slotRowKey: baseFallback.slotRowKey || baseFallback.rowKey,
              boxCount: layerBoxCount,
              totalKg: layerTotalKg,
            }, baseFallback));
            remainingBoxCount -= layerBoxCount;
            remainingTotalKg = Math.max(0, remainingTotalKg - layerTotalKg);
          }
          return layers.filter(Boolean);
        })();
    const totalKg = synthesizedLayerEntries.length
      ? synthesizedLayerEntries.reduce((sum, layerEntry) => sum + Math.max(0, Number(layerEntry?.totalKg || 0)), 0)
      : Math.max(0, Number(entry?.totalKg || 0));
    const boxCount = synthesizedLayerEntries.length
      ? synthesizedLayerEntries.reduce((sum, layerEntry) => sum + Math.max(0, Number(layerEntry?.boxCount || 0)), 0)
      : Math.max(0, Math.floor(Number(entry?.boxCount || 0)));
    if (totalKg <= 0 && boxCount <= 0) return null;
    const rowKey = String(entry?.rowKey || '');
    const slotRowKey = String(entry?.slotRowKey || rowKey).trim();
    const palletStackCount = clamp(
      Math.max(
        1,
        synthesizedLayerEntries.length
        || Math.floor(Number(entry?.palletStackCount || 0))
        || Math.ceil(boxCount / Math.max(1, harvestBoxesPerPallet))
      ),
      1,
      SMALL_APC_PALLETS_PER_SLOT
    );
    return {
      rowKey,
      slotRowKey: slotRowKey || rowKey,
      sourceTicketNo: String(entry?.sourceTicketNo || '').trim(),
      shipperName: String(entry?.shipperName || '').trim(),
      vehicleName: String(entry?.vehicleName || '').trim(),
      vehiclePlateText: String(entry?.vehiclePlateText || '').trim(),
      playerOwned: Boolean(entry?.playerOwned),
      cropId: String(entry?.cropId || '').trim(),
      cropLabel: String(entry?.cropLabel || '수확물').trim() || '수확물',
      produceTypeLabel: String(entry?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(entry?.qualityLabel || '보통').trim() || '보통',
      gradeLabel: normalizeHarvestGradeLabel(entry?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(entry?.sizeLabel || '미측정').trim() || '미측정',
      stemRemoved: normalizeHarvestStemRemoved(entry?.stemRemoved),
      life: clamp(Number(entry?.life) || 0, 0, 100),
      harvestedDay: Math.max(0, Number(entry?.harvestedDay) || 0),
      loadBoxKey: String(entry?.loadBoxKey || '').trim(),
      loadBoxImageSrc: String(entry?.loadBoxImageSrc || '').trim(),
      detailText: String(entry?.detailText || '').trim(),
      detailLines: Array.isArray(entry?.detailLines)
        ? entry.detailLines.map((line) => String(line || '').trim()).filter(Boolean)
        : [],
      apcStorageStatus: String(entry?.apcStorageStatus || '보관중').trim() || '보관중',
      apcStorageStatusUpdatedAt: Math.max(0, Number(entry?.apcStorageStatusUpdatedAt || entry?.storedAt || 0)),
      apcPackTypeLabel: String(entry?.apcPackTypeLabel || '').trim(),
      layerEntries: synthesizedLayerEntries,
      palletStackCount,
      boxCount,
      totalKg,
      storedAt: Math.max(0, Number(entry?.storedAt) || 0),
    };
  };

  const normalizeSmallApcColdStorageByBuilding = (rawValue = null) => {
    const normalized = createEmptySmallApcColdStorageByBuilding();
    const source = rawValue && typeof rawValue === 'object' ? rawValue : {};
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
      const sourceSlots = Array.isArray(source?.[buildingKey]) ? source[buildingKey] : [];
      normalized[buildingKey] = Array.from({ length: SMALL_APC_COLD_STORAGE_SLOT_COUNT }, (_, index) => (
        normalizeSmallApcColdStorageEntry(sourceSlots[index])
      ));
    });
    return normalized;
  };

  const splitSmallApcColdStorageEntryBySlotCapacity = (entry = null, maxBoxesPerSlot = harvestBoxesPerPallet * SMALL_APC_PALLETS_PER_SLOT) => {
    const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
    if (!normalizedEntry) return [];
    const safeMaxBoxesPerSlot = Math.max(1, Math.floor(Number(maxBoxesPerSlot) || harvestBoxesPerPallet));
    const totalBoxCount = Math.max(
      1,
      Math.floor(
        Number(normalizedEntry.boxCount)
        || Math.ceil(Math.max(0, Number(normalizedEntry.totalKg) || 0) / harvestBoxCapacityKg)
      )
    );
    const totalKg = Math.max(0, Number(normalizedEntry.totalKg) || 0);
    const approxBoxKg = totalBoxCount > 0 ? (totalKg / totalBoxCount) : harvestBoxCapacityKg;
    let remainingBoxes = totalBoxCount;
    let remainingKg = totalKg;
    const chunks = [];
    while (remainingBoxes > 0) {
      const chunkBoxCount = Math.min(safeMaxBoxesPerSlot, remainingBoxes);
      const fallbackChunkKg = chunkBoxCount * approxBoxKg;
      const chunkKg = remainingBoxes === chunkBoxCount
        ? remainingKg
        : Math.min(remainingKg, fallbackChunkKg);
      const chunkIndex = chunks.length + 1;
      const preservedSlotRowKey = remainingBoxes === totalBoxCount && chunkBoxCount === totalBoxCount
        ? String(normalizedEntry.slotRowKey || '').trim()
        : '';
      chunks.push(normalizeSmallApcColdStorageEntry({
        ...normalizedEntry,
        slotRowKey: preservedSlotRowKey || `${String(normalizedEntry.rowKey || 'small-apc-slot').trim() || 'small-apc-slot'}::slot-${chunkIndex}`,
        palletStackCount: Math.max(1, Math.ceil(chunkBoxCount / Math.max(1, harvestBoxesPerPallet))),
        boxCount: chunkBoxCount,
        totalKg: chunkKg,
      }));
      remainingBoxes -= chunkBoxCount;
      remainingKg = Math.max(0, remainingKg - chunkKg);
    }
    return chunks.filter(Boolean);
  };

  const buildSmallApcFallbackColdStorageRows = ({
    ticketNo = '',
    shipperName = '',
    vehicleName = '',
    vehiclePlateText = '',
    cargoKg = 0,
    cargoType = '사과',
  } = {}) => {
    const totalKg = Math.max(0, Number(cargoKg) || 0);
    if (totalKg <= 0) return [];
    const stemRemoved = Math.random() < SMALL_APC_PRETRIMMED_STEM_REMOVED_CHANCE;
    const stemStatusLabel = stemRemoved ? '꼭지 제거' : '꼭지 미제거';
    return [{
      rowKey: `small-apc-fallback-${ticketNo || vehicleName || 'cargo'}`,
      sourceTicketNo: String(ticketNo || '').trim(),
      shipperName: String(shipperName || '').trim(),
      vehicleName: String(vehicleName || '').trim(),
      vehiclePlateText: String(vehiclePlateText || '').trim(),
      cropId: 'apple',
      cropLabel: String(cargoType || '사과').trim() || '사과',
      produceTypeLabel: String(cargoType || '사과').trim() || '사과',
      qualityLabel: '보통',
      gradeLabel: '미선별',
      sizeLabel: '미측정',
      stemRemoved,
      life: 85,
      harvestedDay: 0,
      loadBoxKey: '',
      loadBoxImageSrc: '',
      detailText: `${String(cargoType || '사과').trim() || '사과'} · 미선별 · ${stemStatusLabel} · ${Math.max(1, Math.round(totalKg / 20))}상자`,
      detailLines: [],
      boxCount: Math.max(1, Math.round(totalKg / 20)),
      totalKg,
      storedAt: Date.now(),
    }];
  };

  const appendSmallApcColdStorageRows = ({
    coldStorageByBuilding = null,
    ticketNo = '',
    shipperName = '',
    vehicleName = '',
    vehiclePlateText = '',
    harvestRows = [],
    cargoKg = 0,
    playerOwned = false,
    preferredBuildingOrder = ['building-1', 'building-2', 'building-3'],
    returnPlacementResult = false,
    cargoType = '사과',
  } = {}) => {
    const sourceTicketNo = String(ticketNo || '').trim();
    const nextByBuilding = normalizeSmallApcColdStorageByBuilding(coldStorageByBuilding);
    if (sourceTicketNo) {
      const alreadyStored = SMALL_APC_COLD_STORAGE_BUILDING_KEYS.some((buildingKey) => (
        nextByBuilding[buildingKey].some((entry) => String(entry?.sourceTicketNo || '').trim() === sourceTicketNo)
      ));
      if (alreadyStored) {
        return returnPlacementResult
          ? { nextColdStorageByBuilding: nextByBuilding, placedRows: [], leftoverRows: [] }
          : nextByBuilding;
      }
    }
    const sourceRows = (Array.isArray(harvestRows) ? harvestRows : []).length
      ? harvestRows
      : buildSmallApcFallbackColdStorageRows({
          ticketNo: sourceTicketNo,
          shipperName,
          vehicleName,
          vehiclePlateText,
          cargoKg,
          cargoType,
        });
    const pendingRows = sourceRows
      .flatMap((row) => splitSmallApcColdStorageEntryBySlotCapacity({
        ...row,
        sourceTicketNo: sourceTicketNo || row?.sourceTicketNo || '',
        shipperName: String(shipperName || row?.shipperName || '').trim(),
        vehicleName: String(vehicleName || row?.vehicleName || '').trim(),
        vehiclePlateText: String(vehiclePlateText || row?.vehiclePlateText || '').trim(),
        playerOwned: typeof row?.playerOwned === 'boolean' ? row.playerOwned : Boolean(playerOwned),
        storedAt: Date.now(),
      }))
      .filter(Boolean);
    if (!pendingRows.length) {
      return returnPlacementResult
        ? { nextColdStorageByBuilding: nextByBuilding, placedRows: [], leftoverRows: [] }
        : nextByBuilding;
    }

    const maxBoxesPerSlot = Math.max(1, harvestBoxesPerPallet * SMALL_APC_PALLETS_PER_SLOT);
    const slotSignatureOf = (entry = null) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry) return '';
      return [
        String(normalizedEntry?.sourceTicketNo || '').trim(),
        String(normalizedEntry?.cropLabel || '수확물').trim(),
        String(normalizedEntry?.produceTypeLabel || '사과').trim(),
        String(normalizedEntry?.qualityLabel || '보통').trim(),
        normalizeHarvestGradeLabel(normalizedEntry?.gradeLabel, '미선별') || '미선별',
        String(normalizedEntry?.sizeLabel || '미측정').trim(),
        normalizeHarvestStemRemoved(normalizedEntry?.stemRemoved) ? 'removed' : 'attached',
        smallApcFreshnessBucketOf(normalizedEntry?.life),
        String(normalizedEntry?.apcStorageStatus || '보관중').trim() || '보관중',
        String(normalizedEntry?.apcPackTypeLabel || '').trim(),
      ].join('::');
    };
    const mergeColdStorageEntry = (baseEntry = null, incomingEntry = null) => {
      const base = normalizeSmallApcColdStorageEntry(baseEntry);
      const incoming = normalizeSmallApcColdStorageEntry(incomingEntry);
      if (!base || !incoming) return base || incoming || null;
      const mergedBoxCount = Math.max(0, Number(base?.boxCount || 0)) + Math.max(0, Number(incoming?.boxCount || 0));
      const mergedTotalKg = Math.max(0, Number(base?.totalKg || 0)) + Math.max(0, Number(incoming?.totalKg || 0));
      const weightedLife = mergedTotalKg > 0
        ? (
            ((Math.max(0, Number(base?.life || 0)) * Math.max(0, Number(base?.totalKg || 0)))
            + (Math.max(0, Number(incoming?.life || 0)) * Math.max(0, Number(incoming?.totalKg || 0))))
            / mergedTotalKg
          )
        : 0;
      return normalizeSmallApcColdStorageEntry({
        ...base,
        life: Math.round((weightedLife + Number.EPSILON) * 10) / 10,
        storedAt: Math.max(Math.max(0, Number(base?.storedAt || 0)), Math.max(0, Number(incoming?.storedAt || 0))),
        apcStorageStatusUpdatedAt: Math.max(
          Math.max(0, Number(base?.apcStorageStatusUpdatedAt || 0)),
          Math.max(0, Number(incoming?.apcStorageStatusUpdatedAt || 0))
        ),
        boxCount: mergedBoxCount,
        totalKg: mergedTotalKg,
        palletStackCount: Math.max(1, Math.ceil(mergedBoxCount / Math.max(1, harvestBoxesPerPallet))),
      });
    };

    let sourceIndex = 0;
    const placedRows = [];
    preferredBuildingOrder.forEach((buildingKey) => {
      const buildingSlots = Array.isArray(nextByBuilding?.[buildingKey]) ? [...nextByBuilding[buildingKey]] : [];
      while (sourceIndex < pendingRows.length) {
        const nextEntry = normalizeSmallApcColdStorageEntry(pendingRows[sourceIndex]);
        if (!nextEntry) {
          sourceIndex += 1;
          continue;
        }
        const mergeableIndex = buildingSlots.findIndex((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          if (!normalizedEntry) return false;
          if (slotSignatureOf(normalizedEntry) !== slotSignatureOf(nextEntry)) return false;
          const mergedBoxCount = Math.max(0, Number(normalizedEntry?.boxCount || 0)) + Math.max(0, Number(nextEntry?.boxCount || 0));
          return mergedBoxCount <= maxBoxesPerSlot;
        });
        if (mergeableIndex < 0) break;
        buildingSlots[mergeableIndex] = mergeColdStorageEntry(buildingSlots[mergeableIndex], nextEntry);
        placedRows.push(nextEntry);
        sourceIndex += 1;
      }
      nextByBuilding[buildingKey] = buildingSlots.map((entry) => {
        if (entry || sourceIndex >= pendingRows.length) return entry;
        const nextEntry = pendingRows[sourceIndex];
        placedRows.push(nextEntry);
        sourceIndex += 1;
        return nextEntry;
      });
    });
    if (returnPlacementResult) {
      return {
        nextColdStorageByBuilding: nextByBuilding,
        placedRows,
        leftoverRows: pendingRows.slice(sourceIndex),
      };
    }
    return nextByBuilding;
  };

  const normalizeSmallApcSortingJob = (job = null) => {
    if (!job || typeof job !== 'object') return null;
    const ticketNo = String(job?.ticketNo || '').trim();
    if (!ticketNo) return null;
    return {
      id: String(job?.id || `small-apc-sorting-${ticketNo}`),
      ticketNo,
      sourceRowKey: String(job?.sourceRowKey || '').trim(),
      sourceSlotRowKey: String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim(),
      lineNo: clamp(Math.floor(Number(job?.lineNo) || 1), 1, SMALL_APC_SORTING_LINE_COUNT),
      shipperName: String(job?.shipperName || '').trim(),
      vehicleName: String(job?.vehicleName || '').trim(),
      vehiclePlateText: String(job?.vehiclePlateText || '').trim(),
      cargoKg: Math.max(0, Number(job?.cargoKg || 0)),
      boxCount: Math.max(0, Math.floor(Number(job?.boxCount || 0))),
      produceTypeLabel: String(job?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(job?.qualityLabel || '보통').trim() || '보통',
      gradeLabel: normalizeHarvestGradeLabel(job?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(job?.sizeLabel || '미측정').trim() || '미측정',
      stemRemoved: normalizeHarvestStemRemoved(job?.stemRemoved),
      playerOwned: Boolean(job?.playerOwned),
      createdAt: Math.max(0, Number(job?.createdAt || 0)),
      outputCommittedAt: Math.max(0, Number(job?.outputCommittedAt || 0)),
      moveInStartedAt: Math.max(0, Number(job?.moveInStartedAt || 0)),
      moveInDurationMs: Math.max(100, Number(job?.moveInDurationMs || SMALL_APC_SORTING_MOVE_IN_DURATION_MS)),
      startedAt: Math.max(0, Number(job?.startedAt || 0)),
      durationMs: Math.max(100, Number(job?.durationMs || SMALL_APC_SORTING_BASE_DURATION_MS)),
      moveOutDurationMs: Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_SORTING_MOVE_OUT_DURATION_MS)),
      lastStaffCheckedAt: Math.max(0, Number(job?.lastStaffCheckedAt || 0)),
    };
  };

  const normalizeSmallApcSortingJobs = (rawValue = null) => (
    (Array.isArray(rawValue) ? rawValue : [])
      .map((job) => normalizeSmallApcSortingJob(job))
      .filter(Boolean)
      .sort((a, b) => Number(a?.startedAt || 0) - Number(b?.startedAt || 0))
  );

  const normalizeSmallApcSortingOutputBin = (entry = null) => {
    if (!entry || typeof entry !== 'object') return null;
    const lineNo = clamp(Math.floor(Number(entry?.lineNo || 1) || 1), 1, SMALL_APC_SORTING_LINE_COUNT);
    const ticketNo = String(entry?.ticketNo || '').trim();
    const gradeLabel = normalizeHarvestGradeLabel(entry?.gradeLabel, '미선별') || '미선별';
    const dieKey = String(entry?.dieKey || '').trim();
    const sizeLabel = String(entry?.sizeLabel || '미측정').trim() || '미측정';
    const totalKg = Math.max(0, Number(entry?.totalKg || 0));
    if (!ticketNo || !dieKey || totalKg <= 0) return null;
    const boxCount = Math.max(1, Math.ceil(totalKg / Math.max(1, Number(harvestBoxCapacityKg) || 20)));
    const life = clamp(Number(entry?.life) || 0, 0, 100);
    const freshnessBucketLabel = String(entry?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(life);
    const ticketNos = Array.from(new Set(
      [
        ...(Array.isArray(entry?.ticketNos) ? entry.ticketNos : []),
        ticketNo,
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    ));
    return {
      id: String(entry?.id || `small-apc-output-${lineNo}-${ticketNo}-${gradeLabel}-${dieKey}-${freshnessBucketLabel}`),
      lineNo,
      ticketNo,
      ticketNos,
      shipperName: String(entry?.shipperName || '').trim(),
      vehicleName: String(entry?.vehicleName || '').trim(),
      vehiclePlateText: String(entry?.vehiclePlateText || '').trim(),
      playerOwned: Boolean(entry?.playerOwned),
      cropId: String(entry?.cropId || '').trim(),
      cropLabel: String(entry?.cropLabel || '수확물').trim() || '수확물',
      produceTypeLabel: String(entry?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(entry?.qualityLabel || '보통').trim() || '보통',
      gradeLabel,
      dieKey,
      sizeLabel,
      stemRemoved: normalizeHarvestStemRemoved(entry?.stemRemoved),
      life,
      freshnessBucketLabel,
      totalKg,
      boxCount,
      updatedAt: Math.max(0, Number(entry?.updatedAt || entry?.createdAt || 0)),
    };
  };

  const normalizeSmallApcSortingOutputBins = (rawValue = null) => (
    (Array.isArray(rawValue) ? rawValue : [])
      .map((entry) => normalizeSmallApcSortingOutputBin(entry))
      .filter(Boolean)
      .sort((a, b) => {
        const lineDiff = Math.max(0, Number(a?.lineNo || 0)) - Math.max(0, Number(b?.lineNo || 0));
        if (lineDiff !== 0) return lineDiff;
        const gradeDiff = String(a?.gradeLabel || '').localeCompare(String(b?.gradeLabel || ''), 'ko');
        if (gradeDiff !== 0) return gradeDiff;
        return String(a?.dieKey || '').localeCompare(String(b?.dieKey || ''), 'ko');
      })
  );

  const normalizeSmallApcPackingJob = (job = null) => {
    if (!job || typeof job !== 'object') return null;
    const id = String(job?.id || '').trim();
    const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
    if (!id || !sourceSlotRowKey) return null;
    return {
      id,
      sourceSlotRowKey,
      workbenchNo: clamp(Math.floor(Number(job?.workbenchNo || 1) || 1), 1, 2),
      ticketNo: String(job?.ticketNo || '').trim(),
      shipperName: String(job?.shipperName || '').trim(),
      vehicleName: String(job?.vehicleName || '').trim(),
      produceTypeLabel: String(job?.produceTypeLabel || '사과').trim() || '사과',
      gradeLabel: normalizeHarvestGradeLabel(job?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(job?.sizeLabel || '미측정').trim() || '미측정',
      boxCount: Math.max(0, Math.floor(Number(job?.boxCount || 0))),
      totalKg: Math.max(0, Number(job?.totalKg || 0)),
      packTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
      status: String(job?.status || 'queued').trim() || 'queued',
      createdAt: Math.max(0, Number(job?.createdAt || 0)),
      startedAt: Math.max(0, Number(job?.startedAt || 0)),
      durationMs: Math.max(100, Number(job?.durationMs || 1000)),
      completedAt: Math.max(0, Number(job?.completedAt || 0)),
      lastStaffCheckedAt: Math.max(0, Number(job?.lastStaffCheckedAt || 0)),
    };
  };

  const normalizeSmallApcPackingJobs = (rawValue = null) => (
    (Array.isArray(rawValue) ? rawValue : [])
      .map((job) => normalizeSmallApcPackingJob(job))
      .filter(Boolean)
      .sort((a, b) => Math.max(0, Number(a?.createdAt || 0)) - Math.max(0, Number(b?.createdAt || 0)))
  );

  const normalizeSmallApcShippingJob = (job = null) => {
    if (!job || typeof job !== 'object') return null;
    const id = String(job?.id || '').trim();
    const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
    if (!id || !sourceSlotRowKey) return null;
    return {
      id,
      sourceSlotRowKey,
      ticketNo: String(job?.ticketNo || '').trim(),
      shipperName: String(job?.shipperName || '').trim(),
      vehicleName: String(job?.vehicleName || '').trim(),
      produceTypeLabel: String(job?.produceTypeLabel || '사과').trim() || '사과',
      gradeLabel: normalizeHarvestGradeLabel(job?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(job?.sizeLabel || '미측정').trim() || '미측정',
      boxCount: Math.max(0, Math.floor(Number(job?.boxCount || 0))),
      totalKg: Math.max(0, Number(job?.totalKg || 0)),
      packTypeLabel: String(job?.packTypeLabel || '').trim(),
      shippingParkingSlotNo: Math.max(0, Math.floor(Number(job?.shippingParkingSlotNo || 0))),
      dispatchVehicleName: String(job?.dispatchVehicleName || '').trim(),
      dispatchVehiclePlateText: String(job?.dispatchVehiclePlateText || '').trim(),
      dispatchVehicleSearchKeywords: Array.isArray(job?.dispatchVehicleSearchKeywords)
        ? job.dispatchVehicleSearchKeywords.map((value) => String(value || '').trim()).filter(Boolean)
        : [],
      status: String(job?.status || 'queued').trim() || 'queued',
      createdAt: Math.max(0, Number(job?.createdAt || 0)),
      startedAt: Math.max(0, Number(job?.startedAt || 0)),
      durationMs: Math.max(100, Number(job?.durationMs || 1000)),
      completedAt: Math.max(0, Number(job?.completedAt || 0)),
      lastStaffCheckedAt: Math.max(0, Number(job?.lastStaffCheckedAt || 0)),
    };
  };

  const normalizeSmallApcShippingJobs = (rawValue = null) => (
    (Array.isArray(rawValue) ? rawValue : [])
      .map((job) => normalizeSmallApcShippingJob(job))
      .filter(Boolean)
      .sort((a, b) => Math.max(0, Number(a?.createdAt || 0)) - Math.max(0, Number(b?.createdAt || 0)))
  );

  const normalizeSmallApcStemRemovalJob = (job = null) => {
    if (!job || typeof job !== 'object') return null;
    const ticketNo = String(job?.ticketNo || '').trim();
    const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
    const buildingKey = String(job?.buildingKey || '').trim();
    const slotIndex = Math.max(0, Math.floor(Number(job?.slotIndex) || 0));
    if (!ticketNo || !sourceSlotRowKey || !buildingKey || slotIndex < 0) return null;
    return {
      id: String(job?.id || `small-apc-stem-removal-${sourceSlotRowKey}`),
      ticketNo,
      sourceRowKey: String(job?.sourceRowKey || sourceSlotRowKey).trim(),
      sourceSlotRowKey,
      buildingKey,
      slotIndex,
      workbenchNo: clamp(Math.floor(Number(job?.workbenchNo || 1) || 1), 1, SMALL_APC_STEM_REMOVAL_WORKBENCH_COUNT),
      shipperName: String(job?.shipperName || '').trim(),
      vehicleName: String(job?.vehicleName || '').trim(),
      vehiclePlateText: String(job?.vehiclePlateText || '').trim(),
      cargoKg: Math.max(0, Number(job?.cargoKg || 0)),
      boxCount: Math.max(0, Math.floor(Number(job?.boxCount || 0))),
      produceTypeLabel: String(job?.produceTypeLabel || 'apple').trim() || 'apple',
      qualityLabel: String(job?.qualityLabel || 'normal').trim() || 'normal',
      gradeLabel: normalizeHarvestGradeLabel(job?.gradeLabel, 'mixed') || 'mixed',
      sizeLabel: String(job?.sizeLabel || 'mid').trim() || 'mid',
      stemRemoved: normalizeHarvestStemRemoved(job?.stemRemoved),
      playerOwned: Boolean(job?.playerOwned),
      createdAt: Math.max(0, Number(job?.createdAt || 0)),
      moveInStartedAt: Math.max(0, Number(job?.moveInStartedAt || 0)),
      moveInDurationMs: Math.max(100, Number(job?.moveInDurationMs || SMALL_APC_STEM_REMOVAL_MOVE_IN_DURATION_MS)),
      startedAt: Math.max(0, Number(job?.startedAt || 0)),
      durationMs: Math.max(100, Number(job?.durationMs || SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS)),
      moveOutDurationMs: Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS)),
      lastStaffCheckedAt: Math.max(0, Number(job?.lastStaffCheckedAt || 0)),
    };
  };

  const normalizeSmallApcStemRemovalJobs = (rawValue = null) => (
    (Array.isArray(rawValue) ? rawValue : [])
      .map((job) => normalizeSmallApcStemRemovalJob(job))
      .filter(Boolean)
      .sort((a, b) => Number(a?.startedAt || 0) - Number(b?.startedAt || 0))
  );

  const buildSmallApcStemRemovalJobsForTicket = ({
    stemRemovalJobs = null,
    coldStorageByBuilding = null,
    ticketNo = '',
  } = {}) => {
    const currentJobs = normalizeSmallApcStemRemovalJobs(stemRemovalJobs);
    const safeTicketNo = String(ticketNo || '').trim();
    if (!safeTicketNo) return currentJobs;
    const existingSourceSlotRowKeySet = new Set(
      currentJobs.map((job) => String(job?.sourceSlotRowKey || '').trim()).filter(Boolean)
    );
    const workbenchFinishTimes = Array.from({ length: SMALL_APC_STEM_REMOVAL_WORKBENCH_COUNT }, (_, index) => {
      const workbenchNo = index + 1;
      return currentJobs
        .filter((job) => Math.max(1, Number(job?.workbenchNo || 1)) === workbenchNo)
        .reduce((latest, job) => (
          Math.max(
            latest,
            Math.max(0, Number(job?.startedAt || 0))
            + Math.max(100, Number(job?.durationMs || 0))
            + Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS))
          )
        ), 0);
    });
    const sourceEntries = [];
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
      const rows = Array.isArray(coldStorageByBuilding?.[buildingKey]) ? coldStorageByBuilding[buildingKey] : [];
      rows.forEach((entry, slotIndex) => {
        const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
        const sourceSlotRowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
        if (
          !normalizedEntry
          || String(normalizedEntry?.sourceTicketNo || '').trim() !== safeTicketNo
          || normalizeHarvestStemRemoved(normalizedEntry?.stemRemoved)
          || !sourceSlotRowKey
          || existingSourceSlotRowKeySet.has(sourceSlotRowKey)
        ) {
          return;
        }
        sourceEntries.push({ buildingKey, slotIndex, entry: normalizedEntry });
      });
    });
    if (!sourceEntries.length) return currentJobs;
    const now = Date.now();
    const nextJobs = [...currentJobs];
    sourceEntries.forEach(({ buildingKey, slotIndex, entry }, index) => {
      const rowBoxCount = Math.max(1, Math.floor(Number(entry?.boxCount || 0)));
      const targetWorkbenchIndex = workbenchFinishTimes.findIndex((time) => time === Math.min(...workbenchFinishTimes));
      const workbenchNo = Math.max(1, targetWorkbenchIndex + 1);
      const moveInStartedAt = Math.max(now, workbenchFinishTimes[targetWorkbenchIndex] || 0);
      const moveInDurationMs = SMALL_APC_STEM_REMOVAL_MOVE_IN_DURATION_MS;
      const startedAt = moveInStartedAt + moveInDurationMs;
      const durationMs = SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS + (rowBoxCount * SMALL_APC_STEM_REMOVAL_BOX_DURATION_MS);
      const moveOutDurationMs = SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS;
      workbenchFinishTimes[targetWorkbenchIndex] = startedAt + durationMs + moveOutDurationMs;
      nextJobs.push({
        id: `small-apc-stem-removal-${safeTicketNo}-${index + 1}-${slotIndex + 1}`,
        ticketNo: safeTicketNo,
        sourceRowKey: String(entry?.rowKey || '').trim(),
        sourceSlotRowKey: String(entry?.slotRowKey || entry?.rowKey || '').trim(),
        buildingKey,
        slotIndex,
        workbenchNo,
        shipperName: String(entry?.shipperName || '').trim(),
        vehicleName: String(entry?.vehicleName || '').trim(),
        vehiclePlateText: String(entry?.vehiclePlateText || '').trim(),
        cargoKg: Math.max(0, Number(entry?.totalKg || 0)),
        boxCount: rowBoxCount,
        produceTypeLabel: String(entry?.produceTypeLabel || 'apple').trim() || 'apple',
        qualityLabel: String(entry?.qualityLabel || 'normal').trim() || 'normal',
        gradeLabel: normalizeHarvestGradeLabel(entry?.gradeLabel, 'mixed') || 'mixed',
        sizeLabel: String(entry?.sizeLabel || 'mid').trim() || 'mid',
        stemRemoved: false,
        playerOwned: Boolean(entry?.playerOwned),
        createdAt: now,
        moveInStartedAt,
        moveInDurationMs,
        startedAt,
        durationMs,
        moveOutDurationMs,
      });
    });
    return nextJobs;
  };

  const buildSmallApcSortingJobsForUnload = ({
    sortingJobs = null,
    ticketNo = '',
    shipperName = '',
    vehicleName = '',
    vehiclePlateText = '',
    shipmentDay = 0,
    harvestRows = [],
    cargoKg = 0,
    cargoType = '사과',
    playerOwned = false,
  } = {}) => {
    const currentJobs = normalizeSmallApcSortingJobs(sortingJobs);
    const safeTicketNo = String(ticketNo || '').trim();
    if (!safeTicketNo) return currentJobs;
    const sourceRows = (Array.isArray(harvestRows) ? harvestRows : []).length
      ? harvestRows
      : buildSmallApcFallbackColdStorageRows({
          ticketNo: safeTicketNo,
          shipperName,
          vehicleName,
          vehiclePlateText,
          cargoKg,
          cargoType,
        });
    const sourceSlotRows = sourceRows
      .flatMap((row) => splitSmallApcColdStorageEntryBySlotCapacity({
        ...row,
        sourceTicketNo: safeTicketNo || row?.sourceTicketNo || '',
        shipperName: String(shipperName || row?.shipperName || '').trim(),
        vehicleName: String(vehicleName || row?.vehicleName || '').trim(),
        vehiclePlateText: String(vehiclePlateText || row?.vehiclePlateText || '').trim(),
      }))
      .filter((row) => normalizeHarvestStemRemoved(row?.stemRemoved));
    const existingSourceSlotRowKeySet = new Set(
      currentJobs.map((job) => String(job?.sourceSlotRowKey || '').trim()).filter(Boolean)
    );
    const lineFinishTimes = Array.from({ length: SMALL_APC_SORTING_LINE_COUNT }, (_, index) => {
      const lineNo = index + 1;
      return currentJobs
        .filter((job) => Math.max(1, Number(job?.lineNo || 1)) === lineNo)
        .reduce((latest, job) => (
          Math.max(
            latest,
            Math.max(0, Number(job?.startedAt || 0))
            + Math.max(100, Number(job?.durationMs || 0))
            + Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_SORTING_MOVE_OUT_DURATION_MS))
            + SMALL_APC_SORTING_IDLE_GAP_MS
          )
        ), 0);
    });
    const now = Date.now();
    const nextJobs = [...currentJobs];
    sourceSlotRows.forEach((row, index) => {
      const sourceSlotRowKey = String(row?.slotRowKey || row?.rowKey || '').trim();
      if (!sourceSlotRowKey || existingSourceSlotRowKeySet.has(sourceSlotRowKey)) return;
      const rowBoxCount = Math.max(1, Math.floor(Number(row?.boxCount || 0)));
      const rowCargoKg = Math.max(0, Number(row?.totalKg || 0));
      const targetLineIndex = lineFinishTimes.findIndex((time) => time === Math.min(...lineFinishTimes));
      const lineNo = Math.max(1, targetLineIndex + 1);
      const moveInStartedAt = Math.max(now, lineFinishTimes[targetLineIndex] || 0);
      const moveInDurationMs = SMALL_APC_SORTING_MOVE_IN_DURATION_MS;
      const startedAt = moveInStartedAt + moveInDurationMs;
      const durationMs = SMALL_APC_SORTING_BASE_DURATION_MS + (rowBoxCount * SMALL_APC_SORTING_BOX_DURATION_MS);
      const moveOutDurationMs = SMALL_APC_SORTING_MOVE_OUT_DURATION_MS;
      lineFinishTimes[targetLineIndex] = startedAt + durationMs + moveOutDurationMs + SMALL_APC_SORTING_IDLE_GAP_MS;
      nextJobs.push({
        id: `small-apc-sorting-${safeTicketNo}-${index + 1}`,
        ticketNo: safeTicketNo,
        sourceRowKey: String(row?.rowKey || '').trim(),
        sourceSlotRowKey,
        lineNo,
        shipperName: String(shipperName || '').trim(),
        vehicleName: String(vehicleName || '').trim(),
        vehiclePlateText: String(vehiclePlateText || '').trim(),
        shipmentDay: Math.max(0, Math.floor(Number(shipmentDay) || 0)),
        cargoKg: rowCargoKg,
        boxCount: rowBoxCount,
        produceTypeLabel: String(row?.produceTypeLabel || cargoType || '사과').trim() || '사과',
        qualityLabel: String(row?.qualityLabel || '보통').trim() || '보통',
        gradeLabel: normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별',
        sizeLabel: String(row?.sizeLabel || '미측정').trim() || '미측정',
        stemRemoved: normalizeHarvestStemRemoved(row?.stemRemoved),
        playerOwned: typeof row?.playerOwned === 'boolean' ? row.playerOwned : Boolean(playerOwned),
        createdAt: now,
        moveInStartedAt,
        moveInDurationMs,
        startedAt,
        durationMs,
        moveOutDurationMs,
      });
    });
    return nextJobs;
  };

  const buildSmallApcSettlementGroup = (group = {}, settlementDay = 1) => {
    const totalKg = Math.max(0, Number(group?.totalKg || 0));
    const gradeLabel = normalizeHarvestGradeLabel(group?.gradeLabel, '미선별') || '미선별';
    const basePrice20Kg = smallApcGradeAuctionBase20KgOf(settlementDay, gradeLabel);
    const basePricePerKg = basePrice20Kg / 20;
    const sizeFactor = smallApcSizeFactorOf(group?.sizeLabel);
    const qualityFactor = smallApcQualityFactorOf(group?.qualityLabel);
    const freshnessFactor = smallApcFreshnessFactorOf(group?.life);
    const stemFactor = smallApcStemFactorOf(group?.stemRemoved);
    const grossAmount = Math.round(totalKg * basePricePerKg * sizeFactor * qualityFactor * freshnessFactor * stemFactor);
    const feeAmount = Math.round(grossAmount * SMALL_APC_SETTLEMENT_FEE_RATE);
    const netAmount = Math.max(0, grossAmount - feeAmount);
    return {
      rowKey: String(group?.rowKey || ''),
      cropLabel: String(group?.cropLabel || '수확물'),
      produceTypeLabel: String(group?.produceTypeLabel || '사과'),
      qualityLabel: String(group?.qualityLabel || '보통'),
      gradeLabel,
      freshnessBucketLabel: String(group?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(group?.life),
      sizeLabel: String(group?.sizeLabel || '미측정'),
      stemRemoved: Boolean(group?.stemRemoved),
      life: Math.max(0, Number(group?.life || 0)),
      boxCount: Math.max(0, Number(group?.boxCount || 0)),
      totalKg,
      basePrice20Kg,
      sizeFactor,
      qualityFactor,
      freshnessFactor,
      stemFactor,
      grossAmount,
      feeAmount,
      netAmount,
    };
  };

  const buildSmallApcSettlementDraft = ({
    ticketNo = '',
    shipperName = '',
    vehicleName = '',
    vehiclePlateText = '',
    shipmentDay = 0,
    harvestRows = [],
    fallbackCargoKg = 0,
    receivedBoxCount = 0,
    fallbackCargoType = '사과',
    settlementDay = 1,
  } = {}) => {
    const distributeRowBoxCountsByWeight = (rows = [], totalBoxesRaw = 0) => {
      const sourceRows = (Array.isArray(rows) ? rows : [])
        .map((row) => ({
          ...row,
          totalKg: Math.max(0, Number(row?.totalKg || 0)),
          boxCount: Math.max(0, Math.floor(Number(row?.boxCount || 0))),
        }))
        .filter((row) => row.totalKg > 0.001);
      const totalBoxes = Math.max(0, Math.floor(Number(totalBoxesRaw) || 0));
      if (!sourceRows.length || totalBoxes <= 0) return sourceRows;
      const totalKg = sourceRows.reduce((sum, row) => sum + row.totalKg, 0);
      if (totalKg <= 0.001) return sourceRows;
      const baseRows = sourceRows.length <= totalBoxes
        ? sourceRows.map((row) => ({ ...row, boxCount: 1 }))
        : sourceRows.map((row) => ({ ...row, boxCount: 0 }));
      let assignedBoxes = baseRows.reduce((sum, row) => sum + row.boxCount, 0);
      let remainingBoxes = Math.max(0, totalBoxes - assignedBoxes);
      const weightedRows = baseRows
        .map((row) => {
          const weight = row.totalKg / totalKg;
          const rawExtra = remainingBoxes * weight;
          return {
            ...row,
            __weight: weight,
            __fraction: rawExtra - Math.floor(rawExtra),
            boxCount: row.boxCount + Math.floor(rawExtra),
          };
        })
        .sort((a, b) => {
          const fractionDiff = Number(b?.__fraction || 0) - Number(a?.__fraction || 0);
          if (Math.abs(fractionDiff) > 0.000001) return fractionDiff;
          return Number(b?.__weight || 0) - Number(a?.__weight || 0);
        });
      assignedBoxes = weightedRows.reduce((sum, row) => sum + row.boxCount, 0);
      remainingBoxes = Math.max(0, totalBoxes - assignedBoxes);
      for (let index = 0; index < weightedRows.length && remainingBoxes > 0; index += 1) {
        weightedRows[index].boxCount += 1;
        remainingBoxes -= 1;
      }
      return weightedRows.map(({ __weight, __fraction, ...row }) => row);
    };
    const scaleRowWeightsToCargoKg = (rows = [], targetCargoKgRaw = 0) => {
      const sourceRows = (Array.isArray(rows) ? rows : [])
        .map((row) => ({
          ...row,
          totalKg: Math.max(0, Number(row?.totalKg || 0)),
        }))
        .filter((row) => row.totalKg > 0.001);
      const targetCargoKg = Math.max(0, Number(targetCargoKgRaw) || 0);
      if (!sourceRows.length || targetCargoKg <= 0) return sourceRows;
      const currentTotalKg = sourceRows.reduce((sum, row) => sum + row.totalKg, 0);
      if (currentTotalKg <= 0.001) return sourceRows;
      const ratio = targetCargoKg / currentTotalKg;
      if (ratio <= 1.02) return sourceRows;
      let allocatedKg = 0;
      return sourceRows.map((row, index) => {
        const nextTotalKg = index === sourceRows.length - 1
          ? Math.max(0, Math.round(((targetCargoKg - allocatedKg) + Number.EPSILON) * 1000) / 1000)
          : Math.max(0, Math.round(((row.totalKg * ratio) + Number.EPSILON) * 1000) / 1000);
        allocatedKg += nextTotalKg;
        return {
          ...row,
          totalKg: nextTotalKg,
        };
      });
    };
    const fallbackLife = smallApcNpcFallbackFreshnessOf({
      ticketNo,
      shipmentDay,
      settlementDay,
      cargoType: fallbackCargoType,
      cargoKg: fallbackCargoKg,
    });
    const sourceRows = (Array.isArray(harvestRows) ? harvestRows : []).length
      ? harvestRows
      : (Math.max(0, Number(fallbackCargoKg) || 0) > 0
        ? [{
            rowKey: `${ticketNo}-fallback`,
            cropLabel: fallbackCargoType,
            produceTypeLabel: fallbackCargoType,
            qualityLabel: '보통',
            gradeLabel: '미선별',
            sizeLabel: '미측정',
            stemRemoved: false,
            life: fallbackLife,
            boxCount: Math.max(1, Math.round((Number(fallbackCargoKg) || 0) / 20)),
            totalKg: Math.max(0, Number(fallbackCargoKg) || 0),
          }]
        : []);
    const sourceTotalKg = sourceRows.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0);
    const sourceBoxCount = sourceRows.reduce((sum, row) => sum + Math.max(0, Number(row?.boxCount || 0)), 0);
    const safeReceivedBoxCount = Math.max(
      sourceBoxCount,
      Math.floor(Number(receivedBoxCount) || 0)
    );
    const estimatedReceivedCargoKg = safeReceivedBoxCount * Math.max(1, Number(harvestBoxCapacityKg) || 20);
    const resolvedFallbackCargoKg = (
      safeReceivedBoxCount > 0
      && sourceTotalKg > 0.001
      && sourceTotalKg < (estimatedReceivedCargoKg * 0.5)
    )
      ? Math.max(
          Math.max(0, Number(fallbackCargoKg) || 0),
          estimatedReceivedCargoKg
        )
      : Math.max(0, Number(fallbackCargoKg) || 0);
    const shouldRebalanceToReceivedCargo = (
      resolvedFallbackCargoKg > 0.001
      && sourceTotalKg > 0.001
      && sourceTotalKg < (resolvedFallbackCargoKg * 0.5)
    );
    const normalizedRows = distributeRowBoxCountsByWeight(
      shouldRebalanceToReceivedCargo
        ? scaleRowWeightsToCargoKg(sourceRows, resolvedFallbackCargoKg)
        : sourceRows,
      safeReceivedBoxCount
    );
    const boxGroups = normalizedRows
      .map((row) => buildSmallApcSettlementGroup(row, settlementDay))
      .filter((row) => Math.max(0, Number(row?.totalKg || 0)) > 0);
    const cargoKg = boxGroups.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0);
    const grossAmount = boxGroups.reduce((sum, row) => sum + Math.max(0, Number(row?.grossAmount || 0)), 0);
    const feeAmount = boxGroups.reduce((sum, row) => sum + Math.max(0, Number(row?.feeAmount || 0)), 0);
    const netAmount = boxGroups.reduce((sum, row) => sum + Math.max(0, Number(row?.netAmount || 0)), 0);
    const boxCount = boxGroups.reduce((sum, row) => sum + Math.max(0, Number(row?.boxCount || 0)), 0);
    return {
      id: `small-apc-settlement-${ticketNo}`,
      ticketNo,
      playerOwned: true,
      shipperName,
      vehicleName,
      vehiclePlateText,
      cargoType: '사과',
      receivedCargoKg: resolvedFallbackCargoKg,
      cargoKg,
      receivedBoxCount: safeReceivedBoxCount,
      boxCount,
      boxGroups,
      shipmentDay: Math.max(0, Math.floor(Number(shipmentDay) || 0)),
      settlementDay: Math.max(1, Math.floor(Number(settlementDay) || 1)),
      grossAmount,
      feeAmount,
      netAmount,
      status: 'pending',
      createdAt: Date.now(),
    };
  };

  const buildSmallApcHarvestRowsForSettlementTicket = ({
    coldStorageByBuilding = null,
    sortingOutputBins = [],
    ticketNo = '',
  } = {}) => {
    const safeTicketNo = String(ticketNo || '').trim();
    if (!safeTicketNo) return [];
    const grouped = new Map();
    const appendGroupedRow = ({
      rowKey = '',
      cropLabel = '수확물',
      produceTypeLabel = '사과',
      qualityLabel = '보통',
      gradeLabel = '미선별',
      sizeLabel = '미측정',
      stemRemoved = false,
      life = 0,
      freshnessBucketLabel = '',
      boxCount = 0,
      totalKg = 0,
    } = {}) => {
      const safeTotalKg = Math.max(0, Number(totalKg || 0));
      const safeBoxCount = Math.max(0, Number(boxCount || 0));
      if (safeTotalKg <= 0 || safeBoxCount <= 0) return;
      const safeLife = Math.max(0, Number(life) || 0);
      const safeFreshnessBucketLabel = String(freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(safeLife);
      const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel, '미선별') || '미선별';
      const safeSizeLabel = String(sizeLabel || '미측정').trim() || '미측정';
      const safeStemRemoved = normalizeHarvestStemRemoved(stemRemoved);
      const groupKey = [
        String(rowKey || '').trim() || 'settlement-row',
        String(cropLabel || '수확물').trim(),
        String(produceTypeLabel || '사과').trim(),
        String(qualityLabel || '보통').trim(),
        safeGradeLabel,
        safeSizeLabel,
        safeStemRemoved ? 'removed' : 'attached',
        safeFreshnessBucketLabel,
      ].join('::');
      const current = grouped.get(groupKey) || {
        rowKey: String(rowKey || '').trim() || `small-apc-settlement-${safeTicketNo}-${grouped.size + 1}`,
        cropLabel: String(cropLabel || '수확물').trim() || '수확물',
        produceTypeLabel: String(produceTypeLabel || '사과').trim() || '사과',
        qualityLabel: String(qualityLabel || '보통').trim() || '보통',
        gradeLabel: safeGradeLabel,
        sizeLabel: safeSizeLabel,
        stemRemoved: safeStemRemoved,
        life: 0,
        freshnessBucketLabel: safeFreshnessBucketLabel,
        harvestedDay: 0,
        loadBoxKey: '',
        boxCount: 0,
        totalKg: 0,
        lifeWeightTotalKg: 0,
      };
      current.boxCount += safeBoxCount;
      current.totalKg += safeTotalKg;
      current.life += safeLife * safeTotalKg;
      current.lifeWeightTotalKg += safeTotalKg;
      grouped.set(groupKey, current);
    };
    (Array.isArray(sortingOutputBins) ? sortingOutputBins : [])
      .filter((entry) => {
        const primaryTicketNo = String(entry?.ticketNo || '').trim();
        if (primaryTicketNo === safeTicketNo) return true;
        const relatedTicketNos = Array.isArray(entry?.ticketNos) ? entry.ticketNos : [];
        return relatedTicketNos.some((value) => String(value || '').trim() === safeTicketNo);
      })
      .forEach((entry) => {
        appendGroupedRow({
          rowKey: String(entry?.id || '').trim() || String(entry?.rowKey || '').trim(),
          cropLabel: entry?.cropLabel,
          produceTypeLabel: entry?.produceTypeLabel,
          qualityLabel: entry?.qualityLabel,
          gradeLabel: entry?.gradeLabel,
          sizeLabel: entry?.sizeLabel,
          stemRemoved: true,
          life: entry?.life,
          freshnessBucketLabel: entry?.freshnessBucketLabel,
          boxCount: entry?.boxCount,
          totalKg: entry?.totalKg,
        });
      });
    const settlementStorageBuildingKeys = SMALL_APC_COLD_STORAGE_BUILDING_KEYS.filter((buildingKey) => (
      String(buildingKey || '').trim() !== 'building-1'
    ));
    settlementStorageBuildingKeys.forEach((buildingKey) => {
      const rows = Array.isArray(coldStorageByBuilding?.[buildingKey]) ? coldStorageByBuilding[buildingKey] : [];
      rows
        .filter((entry) => String(entry?.sourceTicketNo || '').trim() === safeTicketNo)
        .forEach((entry) => {
          appendGroupedRow({
            rowKey: String(entry?.rowKey || '').trim(),
            cropLabel: entry?.cropLabel,
            produceTypeLabel: entry?.produceTypeLabel,
            qualityLabel: entry?.qualityLabel,
            gradeLabel: entry?.gradeLabel,
            sizeLabel: entry?.sizeLabel,
            stemRemoved: entry?.stemRemoved,
            life: entry?.life,
            freshnessBucketLabel: entry?.freshnessBucketLabel,
            boxCount: entry?.boxCount,
            totalKg: entry?.totalKg,
          });
        });
    });
    return Array.from(grouped.values())
      .map((row) => {
        const weightKg = Math.max(0, Number(row?.lifeWeightTotalKg || 0));
        const { lifeWeightTotalKg, ...rest } = row || {};
        return {
          ...rest,
          life: weightKg > 0 ? Math.round((Number(row?.life || 0) / weightKg) * 10) / 10 : 0,
        };
      })
      .filter((row) => Math.max(0, Number(row?.boxCount || 0)) > 0 && Math.max(0, Number(row?.totalKg || 0)) > 0);
  };

  const buildSmallApcHarvestRowsForVehicle = ({
    storage = [],
    vehicleId = '',
  } = {}) => {
    const safeVehicleId = String(vehicleId || '').trim();
    if (!safeVehicleId) return [];
    const resolveBatchHarvestMeta = (batch = null) => {
      const rawQtyKg = Math.max(0, Number(batch?.qty) || 0);
      const boxCapacityKg = Math.max(1, Number(batch?.storageBoxCapacityKg) || 20);
      const explicitFullBoxCount = Math.max(
        0,
        Math.floor(Number(batch?.boxCount ?? batch?.storageBoxCount) || 0)
      );
      const explicitPartialBoxCount = Math.max(
        0,
        Math.floor(Number(batch?.partialBoxCount ?? batch?.storagePartialBoxCount) || 0)
      );
      const batchBoxCount = explicitFullBoxCount + explicitPartialBoxCount;
      if (batchBoxCount <= 0) {
        return {
          qtyKg: rawQtyKg,
          boxCount: rawQtyKg > 0 ? 1 : 0,
        };
      }
      if (rawQtyKg > 0) {
        return {
          qtyKg: rawQtyKg,
          boxCount: batchBoxCount,
        };
      }
      const fullBoxKg = explicitFullBoxCount * boxCapacityKg;
      const remainderKgMeta = Math.max(
        0,
        Number(batch?.storageRemainderKg ?? batch?.remainderKg) || 0
      );
      const partialBoxKg = explicitPartialBoxCount > 0
        ? (
            explicitPartialBoxCount === 1 && remainderKgMeta > 0.001
              ? remainderKgMeta
              : Math.max(0, rawQtyKg - fullBoxKg)
          )
        : 0;
      return {
        qtyKg: fullBoxKg + partialBoxKg,
        boxCount: batchBoxCount,
      };
    };
    const harvestGroupMap = new Map();
    (Array.isArray(storage) ? storage : [])
      .filter((batch) => String(batch?.storageVehicleInstanceId || '') === safeVehicleId)
      .forEach((batch) => {
        const { qtyKg, boxCount: batchBoxCount } = resolveBatchHarvestMeta(batch);
        if (qtyKg <= 0) return;
        const cropId = String(batch?.cropId || '');
        const cropLabel = String(crops?.[cropId]?.name || cropId || '수확물');
        const produceTypeLabel = String(batch?.produceTypeLabel || '사과').trim() || '사과';
        const qualityLabel = String(qualityStateText(clamp(Number(batch?.quality) || 0, 0, 100)) || '보통');
        const gradeLabel = normalizeHarvestGradeLabel(batch?.gradeLabel, '미선별') || '미선별';
        const sizeLabel = String(batch?.sizeLabel || '').trim() || '미측정';
        const stemRemoved = normalizeHarvestStemRemoved(batch?.stemRemoved);
        const life = Math.max(0, Number(batch?.life) || 0);
        const harvestedDay = Math.max(0, Number(batch?.harvestedDay) || 0);
        const loadBoxKey = String(batch?.loadBoxKey || '');
        const freshnessBucketLabel = smallApcFreshnessBucketOf(life);
        const groupKey = [
          cropId,
          cropLabel,
          produceTypeLabel,
          qualityLabel,
          gradeLabel,
          sizeLabel,
          stemRemoved ? 'removed' : 'attached',
          freshnessBucketLabel,
        ].join('::');
        const current = harvestGroupMap.get(groupKey) || {
          rowKey: `small-apc-harvest-${safeVehicleId}-${groupKey}`,
          cropId,
          cropLabel,
          produceTypeLabel,
          qualityLabel,
          gradeLabel,
          sizeLabel,
          stemRemoved,
          life: 0,
          freshnessBucketLabel,
          harvestedDay,
          loadBoxKey,
          boxCount: 0,
          totalKg: 0,
          lifeWeightTotalKg: 0,
        };
        current.boxCount += batchBoxCount;
        current.totalKg += qtyKg;
        current.life += life * qtyKg;
        current.lifeWeightTotalKg += qtyKg;
        harvestGroupMap.set(groupKey, current);
      });

    return Array.from(harvestGroupMap.values())
      .map((row) => {
        const weightKg = Math.max(0, Number(row?.lifeWeightTotalKg || 0));
        const averagedLife = weightKg > 0 ? Math.round((Number(row?.life || 0) / weightKg) * 10) / 10 : 0;
        const detailParts = buildHarvestBoxStateLabelParts({
          produceTypeLabel: row.produceTypeLabel,
          cropLabel: row.cropLabel,
          qualityLabel: row.qualityLabel,
          gradeLabel: row.gradeLabel,
          sizeLabel: row.sizeLabel,
          qtyKg: row.totalKg,
          life: averagedLife,
          harvestedDay: row.harvestedDay,
          loadBoxKey: row.loadBoxKey,
          stemRemoved: row.stemRemoved,
        });
        const { lifeWeightTotalKg, ...rest } = row || {};
        return {
          ...rest,
          life: averagedLife,
          loadBoxImageSrc: String(toolImageSrcOf(String(row.loadBoxKey || '')) || ''),
          detailText: String(detailParts?.text || '').trim(),
          detailLines: String(detailParts?.text || '').split('\n').map((line) => String(line || '').trim()).filter(Boolean),
        };
      })
      .sort((a, b) => Math.max(0, Number(b?.totalKg) || 0) - Math.max(0, Number(a?.totalKg) || 0));
  };

  const buildSmallApcUnloadTempStorageEntries = ({
    storage = [],
    vehicleCargoByInstance = {},
    vehicleId = '',
  } = {}) => {
    const safeVehicleId = String(vehicleId || '').trim();
    if (!safeVehicleId) return [];
    const qtyByItemKey = new Map();
    const loadedPalletKeys = new Set();
    (Array.isArray(storage) ? storage : [])
      .filter((batch) => String(batch?.storageVehicleInstanceId || '').trim() === safeVehicleId)
      .forEach((batch) => {
        const qtyKg = Math.max(0, Number(batch?.qty) || 0);
        if (qtyKg <= 0) return;
        if (batch?.palletized) {
          const slotNo = Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0));
          const layerNo = Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1)));
          if (slotNo > 0) {
            loadedPalletKeys.add(`${slotNo}:${layerNo}`);
          }
        }
        const itemKey = normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg';
        const itemMeta = shopItemMetaByKey?.[itemKey] || null;
        if (!itemMeta?.key) return;
        qtyByItemKey.set(itemKey, Math.max(0, Number(qtyByItemKey.get(itemKey)) || 0) + 1);
      });
    const emptyPalletQtyFromCargo = Math.max(
      0,
      Math.floor(Number(vehicleCargoByInstance?.[safeVehicleId]?.plasticPallet1100) || 0)
    );
    const loadedPalletQtyFromStorage = loadedPalletKeys.size;
    const palletQty = loadedPalletQtyFromStorage + emptyPalletQtyFromCargo;
    if (palletQty > 0) {
      qtyByItemKey.set(
        'plasticPallet1100',
        Math.max(0, Number(qtyByItemKey.get('plasticPallet1100')) || 0) + palletQty
      );
    }
    return Array.from(qtyByItemKey.entries())
      .map(([itemKey, qty]) => {
        const itemMeta = shopItemMetaByKey?.[String(itemKey || '')] || null;
        if (!itemMeta?.key || qty <= 0) return null;
        return {
          qty,
          item: { ...itemMeta },
          itemCategory: String(itemMeta?.category || 'container'),
          sourceKind: 'small-apc-unload-return',
        };
      })
      .filter(Boolean);
  };

  const sortingOutputRuleOptions = Object.freeze([
    ...appleSortSizeTableRows.flatMap(([dieLabel]) => ([
      { gradeLabel: 'A급', dieKey: `die${String(dieLabel).replace(/[^0-9]/g, '')}`, sizeLabel: String(dieLabel) },
      { gradeLabel: 'B급', dieKey: `die${String(dieLabel).replace(/[^0-9]/g, '')}`, sizeLabel: String(dieLabel) },
      { gradeLabel: processingGradeKey, dieKey: `die${String(dieLabel).replace(/[^0-9]/g, '')}`, sizeLabel: String(dieLabel) },
    ])),
  ]);

  const sortingMixedOutputRule = Object.freeze({
    ruleType: 'mixed',
    gradeLabel: '혼합배출칸',
    dieKey: 'mixed',
    sizeLabel: '규칙 무시 적재',
  });

  const sortingOutputGradeLabels = Object.freeze(['A급', 'B급', processingGradeKey]);

  const workbenchMixedOutputRule = Object.freeze({
    ruleType: 'mixed',
    gradeLabel: '혼합배출칸',
  });

  return {
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_COLD_STORAGE_SLOT_COUNT,
    SMALL_APC_STEM_REMOVAL_WORKBENCH_COUNT,
    SMALL_APC_STEM_REMOVAL_MOVE_IN_DURATION_MS,
    SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS,
    SMALL_APC_STEM_REMOVAL_BOX_DURATION_MS,
    SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS,
    SMALL_APC_SORTING_LINE_COUNT,
    SMALL_APC_SORTING_BASE_DURATION_MS,
    SMALL_APC_SORTING_BOX_DURATION_MS,
    SMALL_APC_SORTING_MOVE_IN_DURATION_MS,
    SMALL_APC_SORTING_MOVE_OUT_DURATION_MS,
    SMALL_APC_SORTING_IDLE_GAP_MS,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcColdStorageByBuilding,
    appendSmallApcColdStorageRows,
    normalizeSmallApcSortingJob,
    normalizeSmallApcSortingJobs,
    normalizeSmallApcSortingOutputBin,
    normalizeSmallApcSortingOutputBins,
    normalizeSmallApcPackingJob,
    normalizeSmallApcPackingJobs,
    normalizeSmallApcShippingJob,
    normalizeSmallApcShippingJobs,
    normalizeSmallApcStemRemovalJob,
    normalizeSmallApcStemRemovalJobs,
    buildSmallApcStemRemovalJobsForTicket,
    buildSmallApcSortingJobsForUnload,
    buildSmallApcSettlementDraft,
    buildSmallApcHarvestRowsForSettlementTicket,
    buildSmallApcHarvestRowsForVehicle,
    buildSmallApcUnloadTempStorageEntries,
    SMALL_APC_STAFF_FACILITY_RULES,
    SMALL_APC_STAFF_ROLE_LABEL_BY_KEY,
    SMALL_APC_STAFF_ATTENDANCE_LABEL_BY_KEY,
    SMALL_APC_STAFF_ACTIVITY_LABEL_BY_KEY,
    createDefaultSmallApcStaffState,
    normalizeSmallApcStaffState,
    rebalanceSmallApcStaffAssignments,
    rollSmallApcStaffDailyState,
    buildSmallApcStaffingProfile,
    SORTING_OUTPUT_RULE_OPTIONS: sortingOutputRuleOptions,
    SORTING_MIXED_OUTPUT_RULE: sortingMixedOutputRule,
    SORTING_OUTPUT_GRADE_LABELS: sortingOutputGradeLabels,
    WORKBENCH_MIXED_OUTPUT_RULE: workbenchMixedOutputRule,
  };
}
