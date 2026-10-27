import { randIntInclusive } from './common';
import { selfLaborAvailable } from './overwork.js';

const LEGACY_CREW_TYPE_MAP = {
  simple: 'worker',
  expert: 'agriTechnician'
};

export const normalizeCrewTypeKey = (type) => LEGACY_CREW_TYPE_MAP[String(type || '')] || String(type || '');

const EXTERNAL_CREW_LABOR_RANGE = {
  beginner: { min: 60, max: 70 },
  worker: { min: 75, max: 85 },
  skilledWorker: { min: 90, max: 100 },
  agriTechnician: { min: 80, max: 95 }
};

const CREW_TYPE_KEYS = Object.keys(EXTERNAL_CREW_LABOR_RANGE);
const createEmptyCrewCountMap = () => CREW_TYPE_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

export const availableLaborBySource = (game, source = 'work') => {
  if (source === 'workOrder') return Math.max(0, Number(game?.externalLaborRemaining) || 0);
  return selfLaborAvailable(game);
};

export const activeWorkersByType = (game, day) =>
  (game?.crewRents || [])
    .filter((rent) => rent.status === 'approved' && !Boolean(rent?.paymentPending) && rent.startDay <= day && day <= rent.endDay)
    .reduce(
      (acc, rent) => {
        const type = normalizeCrewTypeKey(rent.type);
        return { ...acc, [type]: (acc[type] || 0) + rent.count };
      },
      createEmptyCrewCountMap()
    );

const crewLaborRange = (type) => EXTERNAL_CREW_LABOR_RANGE[type] || { min: 70, max: 90 };

const sanitizeLaborList = (list) =>
  Array.isArray(list)
    ? list.map((v) => Math.max(0, Math.floor(Number(v) || 0))).filter((v) => v > 0)
    : [];

const sanitizeRemainingLaborList = (list) =>
  Array.isArray(list)
    ? list.map((v) => Math.max(0, Math.floor(Number(v) || 0)))
    : [];

const assignedLaborListOfRent = (rent) =>
  sanitizeLaborList(rent?.assignedLaborPerWorker);

const remainingLaborListOfRent = (rent) =>
  sanitizeRemainingLaborList(rent?.remainingLaborPerWorker);

export const assignedLaborTotalOfRent = (rent) => {
  const list = assignedLaborListOfRent(rent);
  if (list.length > 0) return list.reduce((sum, v) => sum + v, 0);
  return Math.max(0, Math.floor(Number(rent?.assignedLaborTotal) || 0));
};

export const assignCrewLaborForContract = (rent, day) => {
  const normalizedCount = Math.max(1, Math.floor(Number(rent?.count) || 0));
  const existing = assignedLaborListOfRent(rent);
  if (existing.length === normalizedCount) {
    return {
      ...rent,
      type: normalizeCrewTypeKey(rent?.type),
      assignedLaborPerWorker: existing,
      remainingLaborPerWorker: existing,
      assignedLaborTotal: existing.reduce((sum, v) => sum + v, 0),
      assignedDay: Number(rent?.assignedDay) || day
    };
  }
  const normalizedType = normalizeCrewTypeKey(rent?.type);
  const range = crewLaborRange(normalizedType);
  const assigned = Array.from({ length: normalizedCount }, () => randIntInclusive(range.min, range.max));
  return {
    ...rent,
    type: normalizedType,
    assignedLaborPerWorker: assigned,
    remainingLaborPerWorker: assigned,
    assignedLaborTotal: assigned.reduce((sum, v) => sum + v, 0),
    assignedDay: day
  };
};

export const normalizeCrewRent = (rent = {}) => {
  const assignedLaborPerWorker = assignedLaborListOfRent(rent);
  const remainingLaborPerWorkerRaw = remainingLaborListOfRent(rent);
  const remainingLaborPerWorker =
    remainingLaborPerWorkerRaw.length === assignedLaborPerWorker.length && assignedLaborPerWorker.length > 0
      ? remainingLaborPerWorkerRaw
      : assignedLaborPerWorker;
  return {
    ...rent,
    type: normalizeCrewTypeKey(rent.type),
    status: rent.status || 'approved',
    requestedDay: Number(rent.requestedDay) || 1,
    reviewDay: Number(rent.reviewDay) || Number(rent.startDay) || 1,
    approvedDay: Number(rent.approvedDay) || 0,
    paymentPending: Boolean(rent.paymentPending),
    paidDay: Number(rent.paidDay) || 0,
    approvalRoll: Number(rent.approvalRoll) || 0,
    extraFee: Number(rent.extraFee) || 0,
    urgentFee: Number(rent.urgentFee) || 0,
    urgentLeadDays: Number.isFinite(Number(rent.urgentLeadDays)) ? Math.floor(Number(rent.urgentLeadDays)) : -1,
    rejectedDay: Number(rent.rejectedDay) || 0,
    autoCancelDay: Number(rent.autoCancelDay) || 0,
    assignedDay: Number(rent.assignedDay) || 0,
    assignedLaborTotal: Math.max(0, Number(rent.assignedLaborTotal) || 0),
    assignedLaborPerWorker,
    remainingLaborPerWorker
  };
};

export const crewRentSignature = (type, startDay, endDay) => `${normalizeCrewTypeKey(type)}:${startDay}:${endDay}`;
