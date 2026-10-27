export const OVERWORK_LIMIT = 10;
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const round = (value) => Math.round((value + Number.EPSILON) * 10000) / 10000;

export function overworkOf(game) {
  const saved = game?.laborOverwork;
  const used = saved && saved.day === game?.day ? number(saved.used) : 0;
  // Old negative saves still owe the labor that was already borrowed.
  return { day: game?.day, used: Math.min(OVERWORK_LIMIT, Math.max(0, used, -number(game?.labor))) };
}

export function selfLaborAvailable(game) {
  if (!game) return 0;
  const labor = number(game?.labor), { used } = overworkOf(game);
  return round(Math.max(0, labor) + Math.max(0, Math.min(OVERWORK_LIMIT - used, OVERWORK_LIMIT + Math.min(0, labor))));
}

export function overworkPenalty(used) {
  const debt = Math.min(OVERWORK_LIMIT, Math.max(0, number(used)));
  const fatigue = debt > 7 ? 5 : debt > 3 ? 3 : debt > 0 ? 1 : 0;
  return { debt, fatigue, total: round(debt + fatigue) };
}

export function normalizeOverworkGame(game) {
  if (!game) return game;
  return { ...game, labor: Math.max(-OVERWORK_LIMIT, number(game.labor)), laborOverwork: overworkOf(game) };
}

// Atomic final gate for all resource transactions, including asynchronous ones.
// Rejected/cancelled proposals never commit money, inventory, fields or logs.
export function evaluateLaborTransition(previous, proposed) {
  if (!previous || !proposed) return { ok: true, state: normalizeOverworkGame(proposed), extra: 0 };
  if (proposed === previous) return { ok: true, state: previous, extra: 0 };
  const ledger = overworkOf(previous);
  if (number(proposed.day) > number(previous.day)) {
    const settlement = overworkPenalty(ledger.used);
    const labor = Math.max(0, round(number(proposed.labor) - settlement.total));
    return { ok: true, extra: 0, settlement, state: { ...proposed, labor,
      laborOverwork: { day: proposed.day, used: 0 },
      lastOverworkSettlement: { day: proposed.day, ...settlement },
      ...(proposed.externalCrewLaborToday ? { externalCrewLaborToday: { ...proposed.externalCrewLaborToday, self: labor } } : {}) } };
  }
  const before = number(previous.labor), after = number(proposed.labor);
  const spend = round(before - after);
  if (after < -OVERWORK_LIMIT - .00001 || (spend > 0 && spend > selfLaborAvailable(previous) + .00001)) {
    return { ok: false, state: previous, error: '자가 노동력은 -10까지, 하루 초과 사용은 누적 10까지만 가능합니다.' };
  }
  const extra = round(Math.max(0, Math.max(0, -after) - Math.max(0, -before)));
  const used = round(ledger.used + extra);
  const penalty = overworkPenalty(used);
  return { ok: true, extra, penalty, state: { ...proposed, labor: Math.max(-10, after), laborOverwork: { day: previous.day, used } } };
}

export function overworkConfirmation(result) {
  return `무리 작업을 진행할까요?\n작업 후 자가 노동력 ${result.state.labor.toFixed(1)}\n오늘 초과 사용 ${result.state.laborOverwork.used.toFixed(1)}/10\n다음 날 노동력 차감 ${result.penalty.total.toFixed(1)} (당겨 쓴 노동력 ${result.penalty.debt.toFixed(1)} + 피로 ${result.penalty.fatigue})\n회복하거나 야간으로 넘어가도 오늘의 누적 초과 사용은 유지됩니다.`;
}

// Kept pure for transaction/cancellation tests and the React state adapter.
export function createLaborStateController(initial, { commit, confirm, alert, onSettlement } = {}) {
  let current = normalizeOverworkGame(initial);
  const publish = (next) => { current = next; commit?.(next); };
  return {
    get: () => current,
    replace: (next) => { publish(normalizeOverworkGame(next)); return true; },
    update: (update) => {
      const proposed = typeof update === 'function' ? update(current) : update;
      const result = evaluateLaborTransition(current, proposed);
      if (!result.ok) { alert?.(result.error); return false; }
      if (result.extra > 0 && !confirm?.(overworkConfirmation(result))) return false;
      let next = result.state;
      if (result.settlement?.total > 0 && onSettlement) next = onSettlement(next, result.settlement);
      const changed = next !== current;
      publish(next);
      return changed;
    }
  };
}
