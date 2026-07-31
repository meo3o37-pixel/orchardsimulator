export const TASK_BLOCK_REASON = Object.freeze({
  MACHINE_NOT_SELECTED: 'MACHINE_NOT_SELECTED',
  MACHINE_UNDER_REPAIR: 'MACHINE_UNDER_REPAIR',
  MACHINE_DURABILITY_EMPTY: 'MACHINE_DURABILITY_EMPTY',
  NO_FUEL: 'NO_FUEL',
  INSUFFICIENT_FUEL: 'INSUFFICIENT_FUEL',
  INSUFFICIENT_LABOR: 'INSUFFICIENT_LABOR',
  WORKLOAD_EXHAUSTED: 'WORKLOAD_EXHAUSTED',
});

export const buildTaskBlock = ({
  reasonCode = '',
  message = '',
  details = null
} = {}) => ({
  ok: false,
  reasonCode: String(reasonCode || ''),
  reason: String(message || ''),
  details: details && typeof details === 'object' ? details : null
});

