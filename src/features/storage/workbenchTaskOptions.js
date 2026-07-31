export const WORKBENCH_TASK_OPTIONS = Object.freeze([
  {
    key: 'stemRemovalOnly',
    label: '✂️ 꼭지 제거',
    description: '작업대 투입칸의 꼭지 있는 박스를 꼭지 제거 상태로 바꿉니다.',
  },
  {
    key: 'partialSortOnly',
    label: '🥝 부분선별',
    description: '꼭지는 그대로 두고 일부를 A급, B급, 가공급으로 나눕니다.',
  },
  {
    key: 'stemRemovalPartialSort',
    label: '✂️ 꼭지 제거 + 부분선별',
    description: '꼭지를 제거한 뒤 A급, B급, 가공급으로 나눕니다.',
  },
]);

export const workbenchTaskLabelOf = (taskKeyRaw) => {
  const taskKey = String(taskKeyRaw || '');
  return WORKBENCH_TASK_OPTIONS.find((option) => option.key === taskKey)?.label || '';
};

export const workbenchTaskIconOf = (taskKeyRaw) => {
  const label = workbenchTaskLabelOf(taskKeyRaw).trim();
  if (!label) return '';
  return label.split(/\s+/)[0] || '';
};
