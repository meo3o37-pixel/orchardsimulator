import React from 'react';

export function OwnedSprayerPickerModal({
  open,
  taskKey,
  rows,
  selectedKey,
  game,
  machineItemMap,
  machineImageSrcOf,
  sprayMixStateOf,
  sprayMachineTankCapacityLitersOfKey,
  onSelect,
  onOpenMix,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="slot-picker-backdrop" onClick={onClose} />
      <div className="slot-picker slot-picker--modal">
        <div className="slot-picker__title">
          {taskKey === 'herbicideSpray' ? '제초제살포기 선택' : '현재 토지 주차 SS기 선택'}
        </div>
        <div className="slot-picker__hint">
          {taskKey === 'herbicideSpray'
            ? '주차된 제초 옵션 승용예초기, 현재 토지 창고 등짐펌프를 선택할 수 있습니다.'
            : '현재 토지에 주차된 SS기만 선택할 수 있습니다.'}
        </div>
        <div className="option-grid" style={{ marginTop: 10, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {rows.map((row) => {
            const key = String(row?.machineKey || row?.machine?.machineKey || '');
            if (!key) return null;
            const machine = row?.machine || null;
            const mix = sprayMixStateOf(game, key);
            const cap = sprayMachineTankCapacityLitersOfKey(game, key);
            const status = mix.ready ? '배합완료' : '미배합';
            const isSelected = selectedKey === key;
            const imageSrc = machine ? String(machineImageSrcOf?.(machine) || '') : '';

            return (
              <div
                key={String(row?.key || `sprayer-${key}`)}
                className="option-card age-task-equip-card"
                role="button"
                tabIndex={0}
                style={{
                  padding: 14,
                  minHeight: 132,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#2f7d46' : undefined,
                  boxShadow: isSelected ? '0 0 0 1px rgba(47,125,70,0.35) inset' : undefined
                }}
                onClick={() => onSelect(key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(key);
                  }
                }}
              >
                <div className="harvest-equip-option-content">
                  {imageSrc ? (
                    <div className="harvest-equip-option-thumb" aria-hidden="true">
                      <img src={imageSrc} alt="" loading="lazy" />
                    </div>
                  ) : null}
                  <div className="harvest-equip-option-copy">
                    <div className="option-card__row">
                      <strong>{String(row?.title || machineItemMap[key]?.name || key)}</strong>
                      <span>{isSelected ? '선택됨' : String(row?.rightText || '')}</span>
                    </div>
                    <div className="option-card__meta">{String(row?.hint || '')}</div>
                    <div className="option-card__meta">{`상태 ${status} · 액체 ${Math.floor(mix.waterLiters || 0)}L / ${cap}L`}</div>
                  </div>
                </div>
                <div className="footer-actions" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMix(key);
                    }}
                  >
                    약제배합
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>취소</button>
        </div>
      </div>
    </>
  );
}

export function MowMachinePickerModal({
  open,
  rows,
  selectedId,
  game,
  machineImageSrcOf,
  equipmentDurabilityOf,
  isUnderRepair,
  parseMachineParkingInstanceId,
  isCombustionMachineItem,
  machineFuelLitersOfInstance,
  machineTankCapacityLitersOfItem,
  machineDisplayNameWithRentTag,
  onSelect,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="slot-picker-backdrop" onClick={onClose} />
      <div className="slot-picker slot-picker--modal">
        <div className="slot-picker__title">사용 예초기 고르기</div>
        <div className="slot-picker__hint">현재 토지 주차칸/창고/차량 적재함의 예초기를 선택할 수 있습니다.</div>
        {rows.length ? (
          <div className="slot-picker__tabs">
            {rows.map((row) => {
              const machine = row.machine;
              const key = String(machine.machineKey || '');
              const durability = equipmentDurabilityOf(game, key);
              const repairing = isUnderRepair(game, key);
              const disabled = repairing || durability <= 0;
              const isTrackedFuelMachine = Boolean(parseMachineParkingInstanceId(machine.id)?.id);
              const fuelText = isCombustionMachineItem(machine.item)
                ? (isTrackedFuelMachine
                  ? `${machineFuelLitersOfInstance(game, machine.id, machine.item).toFixed(1)}L / ${machineTankCapacityLitersOfItem(machine.item).toFixed(1)}L`
                  : `연료탱크 ${machineTankCapacityLitersOfItem(machine.item).toFixed(1)}L`)
                : '전기/수동 장비';
              const imageSrc = String(machineImageSrcOf?.(machine) || '');

              return (
                <button
                  key={`mow-machine-${row.id}`}
                  className={`option-card age-task-equip-card ${selectedId === row.id ? 'age-task-equip-card--active' : ''}`.trim()}
                  onClick={() => onSelect(row.id)}
                  disabled={disabled}
                  title={repairing ? '수리 중 장비는 선택할 수 없습니다.' : (durability <= 0 ? '내구도 0% 장비는 선택할 수 없습니다.' : '')}
                  style={{ textAlign: 'left' }}
                >
                  <div className="harvest-equip-option-content">
                    {imageSrc ? (
                      <div className="harvest-equip-option-thumb" aria-hidden="true">
                        <img src={imageSrc} alt="" loading="lazy" />
                      </div>
                    ) : null}
                    <div className="harvest-equip-option-copy">
                      <div className="option-card__row">
                        <strong>{machineDisplayNameWithRentTag(machine)}</strong>
                        <span>{`내구도 ${durability.toFixed(1)}%`}</span>
                      </div>
                      <div className="option-card__meta">{`${fuelText}${row.qtyText ? ` · 보유 ${row.qtyText}` : ''}${repairing ? ' · 수리중' : ''}`}</div>
                      <div className="option-card__meta">{row.sourceHint}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="meter__hint" style={{ marginTop: 10 }}>선택 가능한 예초기가 없습니다.</div>
        )}
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}

export function ParkingPickerModal({
  open,
  slotNo,
  selectedOpenParkingCapacity,
  selectedMachine,
  machineDisplayNameWithRentTag,
  assignableMachines,
  occupiedMachineInstanceMap,
  onAssign,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="slot-picker-backdrop" onClick={onClose} />
      <div className="slot-picker slot-picker--modal">
        <div className="slot-picker__title">주차 슬롯 P{slotNo}</div>
        <div className="slot-picker__hint">
          {slotNo > selectedOpenParkingCapacity
            ? '보호시설 주차칸: 자연 내구도 감소 80% 감량'
            : '노지주차: 일반 주차 (내구도 감량 혜택 없음)'}
        </div>
        {selectedMachine ? (
          <div className="meter__hint" style={{ marginBottom: 8 }}>
            현재: {machineDisplayNameWithRentTag(selectedMachine)}
          </div>
        ) : null}
        <div className="slot-picker__tabs">
          {assignableMachines.map((machine) => {
            const occupied = occupiedMachineInstanceMap[machine.id];
            const occupiedLabel = occupied
              ? `${occupied.fieldName} P${occupied.slotNo} 주차중`
              : '주차 가능';
            return (
              <button
                key={machine.id}
                className="focus-tab slot-button"
                onClick={() => onAssign(machine.id)}
              >
                <strong>{machineDisplayNameWithRentTag(machine)}</strong>
                <span>{occupiedLabel}</span>
              </button>
            );
          })}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>취소</button>
        </div>
      </div>
    </>
  );
}
