import { useRef, useState } from 'react';
import { pushDiary } from './common';
import { createLaborStateController } from './overwork.js';

export default function useOverworkGameState(initial = null) {
  const [game, commit] = useState(initial);
  const controller = useRef(null);
  if (!controller.current) controller.current = createLaborStateController(initial, {
    commit,
    confirm: (message) => window.confirm(message),
    alert: (message) => window.alert(message),
    onSettlement: (next, penalty) => ({ ...next, logs: pushDiary(next,
      `무리 작업 정산: 당겨 쓴 노동력 ${penalty.debt.toFixed(1)} + 피로 ${penalty.fatigue} = 자가 노동력 -${penalty.total.toFixed(1)} / 오늘 ${next.labor.toFixed(1)}`) })
  });
  return [game, controller.current.update, controller.current.replace];
}
