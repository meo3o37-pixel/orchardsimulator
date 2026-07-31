export const calcTaskUiLaborNeed = ({
  baseLabor = 10,
  partialLabor = null,
  weatherLaborMultiplier = 1
}) => {
  const base = Math.max(0.1, Number(partialLabor) || Number(baseLabor) || 10);
  const mul = Math.max(0, Number(weatherLaborMultiplier) || 0);
  return Math.round((base * mul + Number.EPSILON) * 10) / 10;
};

export const resolveLaborPromptState = ({
  availableLabor = 0,
  laborNeed = 0,
  bypassLaborPrompt = false
}) => {
  const available = Math.max(0, Number(availableLabor) || 0);
  const needed = Math.max(0, Number(laborNeed) || 0);
  if (available >= needed) return { canProceed: true, shouldPrompt: false, reasonCode: '' };
  if (bypassLaborPrompt) return { canProceed: true, shouldPrompt: false, reasonCode: '' };
  if (available <= 0) return { canProceed: false, shouldPrompt: false, reasonCode: 'INSUFFICIENT_LABOR', available, needed };
  return { canProceed: false, shouldPrompt: true, reasonCode: 'INSUFFICIENT_LABOR', available, needed };
};
