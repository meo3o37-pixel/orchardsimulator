import React from 'react';

export default function FuelStationKioskPanel({
  isLpgMode = false,
  started,
  step,
  pressedUiKey,
  pressedKey,
  pressedAmountKey,
  pressedAmountAction,
  customUnit,
  customValue,
  payType,
  lastReceipt,
  item,
  displayedRemainingLiters,
  fuelTone,
  fueling,
  fuelingDone,
  fuelApplied,
  directTargetMachine,
  directTargetAnimatedFillRatio,
  selectedCanState,
  canVisualSnapshot,
  selectedCanSizeClass,
  animatedFillRatio,
  snapshotAnimatedFillRatio,
  selectedCanDisplayLabel,
  isComplete,
  confirmBlockedReason,
  stagedCan,
  mapTransferSelectedCarrier,
  fillLitersDraft,
  maxFillLiters,
  directTargetFuelMismatch,
  formatLiterText,
  won,
  machineFuelTypeLabelOf,
  setPressedUiKey,
  onStart,
  onBack,
  chooseType,
  setPressedKey,
  purchaseByManwon,
  setPresetManwon,
  selectLiters,
  fullLiters,
  fullPresetManwon = 15,
  setPressedAmountKey,
  setPressedAmountAction,
  setCustomUnit,
  setCustomValue,
  setStep,
  pushCustomDigit,
  customBackspace,
  customClear,
  submitCustom,
  setPayType,
  onSettleConfirm,
  onClearDirectTarget,
  onConfirmFueling,
  onResetComplete,
  onExtractStagedCan,
  onChangeFillLitersDraft
}) {
  const stationLabel = isLpgMode ? 'LPG 충전소' : '셀프주유소';
  const introTitle = isLpgMode ? '충전을 하시려면' : '주유를 하시려면';
  const fuelTypeOptions = isLpgMode
    ? [{ key: 'fuelLpg1L', label: 'LPG', tone: 'lpg' }]
    : [
        { key: 'fuelDiesel1L', label: '경유', tone: 'diesel' },
        { key: 'fuelGasoline1L', label: '무연휘발유', tone: 'gasoline' },
        { key: 'fuelKerosene1L', label: '등유', tone: 'kerosene' }
      ];

  return (
    <div className="fuel-kiosk fuel-kiosk--compact">
      {!started ? (
        <div className="fuel-kiosk__screen fuel-kiosk__screen--compact">
          <div className="fuel-kiosk__intro">
            <div className="fuel-kiosk__intro-brand">{`${stationLabel}입니다.`}</div>
            <div className="fuel-kiosk__intro-title">{introTitle}</div>
            <button
              type="button"
              className={`fuel-kiosk__intro-start ${pressedUiKey === 'start' ? 'is-pressed' : ''}`}
              onPointerDown={() => setPressedUiKey('start')}
              onPointerUp={() => {
                if (pressedUiKey === 'start') onStart();
                setPressedUiKey('');
              }}
              onPointerLeave={() => setPressedUiKey('')}
              onPointerCancel={() => setPressedUiKey('')}
              onKeyUp={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onStart();
              }}
            >
              시작
            </button>
          </div>
        </div>
      ) : (
        <div className="fuel-kiosk__screen fuel-kiosk__screen--compact">
          <div className="fuel-kiosk__header">
            <strong>{stationLabel}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className={`fuel-kiosk__back-btn ${pressedUiKey === 'back' ? 'is-pressed' : ''}`}
                onPointerDown={() => setPressedUiKey('back')}
                onPointerUp={() => {
                  if (pressedUiKey === 'back') onBack();
                  setPressedUiKey('');
                }}
                onPointerLeave={() => setPressedUiKey('')}
                onPointerCancel={() => setPressedUiKey('')}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onBack();
                }}
              >
                {(step === 'confirm' || step === 'settle') ? '남은주유량 결제취소' : '뒤로'}
              </button>
            </div>
          </div>
          <div className="fuel-kiosk__guide">
            {step === 'type'
              ? isLpgMode
                ? '충전하실 유종을 선택해 주세요'
                : '주유하실 유종을 선택해주세요'
              : (step === 'amount' || step === 'amountCustom')
                ? isLpgMode
                  ? '충전 금액/용량을 선택해 주세요'
                  : '주유 금액/용량을 선택해 주세요'
                : step === 'settle'
                  ? '결제 완료 내역을 확인해 주세요'
                  : isLpgMode
                    ? '충전을 실행해 주세요'
                    : '주유를 실행해 주세요'}
          </div>
          <div className="fuel-kiosk__layout">
            <div className="fuel-kiosk__side fuel-kiosk__side--steps">
              {[
                { key: 'type', label: '유종 선택' },
                { key: 'amount', label: '주유량 결정' },
                { key: 'settle', label: '결제' },
                { key: 'confirm', label: '주유' }
              ].map((stepEntry) => (
                <div
                  key={`fuel-step-${stepEntry.key}`}
                  className={`fuel-kiosk__side-btn ${(stepEntry.key === 'amount' && step === 'amountCustom') || step === stepEntry.key ? 'is-active' : ''}`}
                >
                  {stepEntry.label}
                </div>
              ))}
            </div>
            <div className={`fuel-kiosk__content ${step === 'amount' ? 'fuel-kiosk__content--amount' : ''} ${step === 'payment' ? 'fuel-kiosk__content--payment' : ''}`}>
              {step === 'type' ? (
                <div className={`fuel-kiosk__type-buttons fuel-kiosk__type-buttons--kiosk fuel-kiosk__type-buttons--offset ${isLpgMode ? 'fuel-kiosk__type-buttons--single' : ''}`.trim()}>
                  {fuelTypeOptions.map((fuel) => (
                    <button
                      key={`fuel-type-${fuel.key}`}
                      className={`fuel-kiosk__tile fuel-kiosk__tile--${fuel.tone} ${pressedKey === fuel.key ? 'is-pressed' : ''}`}
                      onPointerDown={() => setPressedKey(fuel.key)}
                      onPointerUp={() => {
                        if (pressedKey === fuel.key) chooseType(fuel.key);
                        setPressedKey('');
                      }}
                      onPointerLeave={() => setPressedKey('')}
                      onPointerCancel={() => setPressedKey('')}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') chooseType(fuel.key);
                      }}
                    >
                      {fuel.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {step === 'amount' ? (
                <div className="fuel-kiosk-paypad fuel-kiosk-paypad--solo fuel-kiosk-paypad--amount">
                  <div className="fuel-kiosk-paypad__quick">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={`fuel-quick-${n}`}
                        type="button"
                        className={`fuel-kiosk-paypad__chip ${pressedAmountKey === String(n) ? 'is-pressed' : ''}`}
                        onPointerDown={() => setPressedAmountKey(String(n))}
                        onClick={() => {
                          setPresetManwon(n);
                          purchaseByManwon(n);
                        }}
                        onPointerUp={() => {
                          setPressedAmountKey('');
                        }}
                        onPointerLeave={() => setPressedAmountKey('')}
                        onPointerCancel={() => setPressedAmountKey('')}
                        onKeyUp={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setPresetManwon(n);
                            purchaseByManwon(n);
                          }
                        }}
                      >
                        {`${n}만원`}
                      </button>
                    ))}
                  </div>
                  <div className="fuel-kiosk-paypad__actions fuel-kiosk-paypad__actions--two">
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${pressedAmountAction === 'custom' ? 'is-pressed' : ''}`}
                      onPointerDown={() => setPressedAmountAction('custom')}
                      onClick={() => {
                        setCustomUnit('manwon');
                        setCustomValue('');
                        setStep('amountCustom');
                      }}
                      onPointerUp={() => {
                        setPressedAmountAction('');
                      }}
                      onPointerLeave={() => setPressedAmountAction('')}
                      onPointerCancel={() => setPressedAmountAction('')}
                    >
                      기타(만원/리터)
                    </button>
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${pressedAmountAction === 'full' ? 'is-pressed' : ''}`}
                      onPointerDown={() => setPressedAmountAction('full')}
                      onClick={() => {
                        setPresetManwon(fullPresetManwon);
                        purchaseByManwon(fullPresetManwon);
                      }}
                      onPointerUp={() => {
                        setPressedAmountAction('');
                      }}
                      onPointerLeave={() => setPressedAmountAction('')}
                      onPointerCancel={() => setPressedAmountAction('')}
                    >
                      {`가득(${fullPresetManwon}만원)`}
                    </button>
                  </div>
                </div>
              ) : null}
              {step === 'amountCustom' ? (
                <div className="fuel-kiosk-paypad fuel-kiosk-paypad--solo">
                  <div className="fuel-kiosk-paypad__actions fuel-kiosk-paypad__actions--two fuel-kiosk-custom__unit-row">
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${customUnit === 'manwon' ? 'is-active' : ''}`}
                      onClick={() => setCustomUnit('manwon')}
                    >
                      만원
                    </button>
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${customUnit === 'liter' ? 'is-active' : ''}`}
                      onClick={() => setCustomUnit('liter')}
                    >
                      리터
                    </button>
                  </div>
                  <div className="fuel-kiosk-custom__display">
                    <strong>{(customValue || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong>
                    <span>{customUnit === 'manwon' ? '만원' : 'L'}</span>
                  </div>
                  <div className="fuel-kiosk-custom__calc">
                    <div className="fuel-kiosk-custom__pad">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <button
                          key={`fuel-custom-${n}`}
                          type="button"
                          className="fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide fuel-kiosk-custom__digit"
                          onClick={() => pushCustomDigit(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide fuel-kiosk-custom__digit"
                        onClick={customBackspace}
                      >
                        지움
                      </button>
                      <button
                        type="button"
                        className="fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide fuel-kiosk-custom__digit"
                        onClick={() => pushCustomDigit(0)}
                      >
                        0
                      </button>
                      <button
                        type="button"
                        className="fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide fuel-kiosk-custom__digit"
                        onClick={customClear}
                      >
                        초기화
                      </button>
                    </div>
                    <button
                      type="button"
                      className="fuel-kiosk-custom__next"
                      onClick={submitCustom}
                    >
                      다음
                    </button>
                  </div>
                </div>
              ) : null}
              {step === 'payment' ? (
                <div className="fuel-kiosk-paypad fuel-kiosk-paypad--solo fuel-kiosk-paypad--payment">
                  <div className="fuel-kiosk-paypad__actions fuel-kiosk-paypad__actions--two">
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${payType === 'lump' ? 'is-active' : ''} ${pressedAmountAction === 'pay-lump' ? 'is-pressed' : ''}`}
                      onPointerDown={() => setPressedAmountAction('pay-lump')}
                      onClick={() => {
                        setPayType('lump');
                        setStep('settle');
                      }}
                      onPointerUp={() => {
                        setPressedAmountAction('');
                      }}
                      onPointerLeave={() => setPressedAmountAction('')}
                      onPointerCancel={() => setPressedAmountAction('')}
                    >
                      일시불
                    </button>
                    <button
                      type="button"
                      className={`fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide ${payType === 'installment' ? 'is-active' : ''} ${pressedAmountAction === 'pay-installment' ? 'is-pressed' : ''}`}
                      onPointerDown={() => setPressedAmountAction('pay-installment')}
                      onClick={() => {
                        setPayType('installment');
                        setStep('settle');
                      }}
                      onPointerUp={() => {
                        setPressedAmountAction('');
                      }}
                      onPointerLeave={() => setPressedAmountAction('')}
                      onPointerCancel={() => setPressedAmountAction('')}
                    >
                      할부
                    </button>
                  </div>
                </div>
              ) : null}
              {step === 'settle' ? (
                <div className="fuel-kiosk-paypad fuel-kiosk-paypad--solo fuel-kiosk-paypad--settle">
                  {lastReceipt ? (
                    <>
                      <div className="fuel-kiosk-paypad__summary fuel-kiosk-paypad__summary--kiosk">
                        <div><strong>결제 완료</strong></div>
                        <div>{`${lastReceipt.fuelName} ${formatLiterText(lastReceipt?.liters)}L`}</div>
                        <div>{`${won(lastReceipt.amount)} 결제 완료`}</div>
                      </div>
                      <div className="fuel-kiosk-paypad__actions fuel-kiosk-paypad__actions--settle">
                        <button
                          type="button"
                          className="fuel-kiosk-paypad__chip fuel-kiosk-paypad__chip--wide"
                          onClick={onSettleConfirm}
                        >
                          주유
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="fuel-kiosk-paypad__summary fuel-kiosk-paypad__summary--kiosk">
                      <div><strong>결제 대기</strong></div>
                      <div>주유량을 먼저 선택해 주세요.</div>
                    </div>
                  )}
                </div>
              ) : null}
              {step === 'confirm' ? (
                <div className="fuel-kiosk-paypad fuel-kiosk-paypad--solo fuel-kiosk-paypad--confirm">
                  <div className="fuel-kiosk-paypad__summary fuel-kiosk-paypad__summary--confirm">
                    <div><strong>주유 준비 완료</strong></div>
                    <div>{`${lastReceipt?.fuelName || (item?.name || '-')} ${formatLiterText(lastReceipt?.liters)}L`}</div>
                    <div>{`남은 주유량 ${formatLiterText(displayedRemainingLiters)}L`}</div>
                    <div>{`${won(Math.max(0, Number(lastReceipt?.amount) || 0))} 결제 완료`}</div>
                  </div>
                  <div className={`fuel-kiosk-fill-anim fuel-kiosk-fill-anim--${fuelTone} ${fueling ? 'is-running' : ''} ${fuelingDone ? 'is-done' : ''}`}>
                    <div className="fuel-kiosk-fill-anim__pump">
                      <div className="fuel-kiosk-fill-anim__pump-icon" aria-hidden="true">
                        <span className="fuel-kiosk-fill-anim__pump-nozzle" />
                      </div>
                      <span>주유기</span>
                    </div>
                    <div className="fuel-kiosk-fill-anim__tube" />
                    <div className="fuel-kiosk-fill-anim__can">
                      {directTargetMachine ? (
                        <>
                          <button
                            type="button"
                            className="fuel-kiosk-selected-can-btn"
                            onClick={onClearDirectTarget}
                            disabled={fueling}
                            title="눌러서 선택 해제"
                            aria-label="차량 주유 대상 선택 해제"
                          >
                            <div className={`fuel-kiosk-vehicle-tank fuel-kiosk-vehicle-tank--${fuelTone} ${fueling ? 'fuel-kiosk-vehicle-tank--filling' : ''}`.trim()}>
                              <div className="fuel-kiosk-vehicle-tank__cap" />
                              <div className="fuel-kiosk-vehicle-tank__neck" />
                              <div className="fuel-kiosk-vehicle-tank__shell">
                                <div
                                  className="fuel-kiosk-fill-anim__liquid"
                                  style={{
                                    '--fuel-fill-ratio': `${directTargetAnimatedFillRatio}`
                                  }}
                                />
                                <div className="fuel-kiosk-vehicle-tank__overlay" />
                                <div className="fuel-kiosk-vehicle-tank__shine" />
                                <div className="fuel-kiosk-vehicle-tank__percent">
                                  {`${Math.round(directTargetAnimatedFillRatio * 100)}%`}
                                </div>
                              </div>
                            </div>
                          </button>
                          <span>{`${directTargetMachine.item?.name || directTargetMachine.machineKey} #${directTargetMachine.unitNo}`}</span>
                        </>
                      ) : (!selectedCanState && !canVisualSnapshot) ? (
                        <div className="fuel-kiosk-can-select-placeholder">
                          적재함에서 선택해주세요
                        </div>
                      ) : null}
                      {!directTargetMachine && (selectedCanState || canVisualSnapshot) ? (
                        <>
                          <div
                            className="fuel-kiosk-selected-can-btn"
                            aria-label="선택된 말통"
                          >
                            <div className={`fuel-jerrycan fuel-jerrycan--${fuelTone} ${selectedCanState ? selectedCanSizeClass : String(canVisualSnapshot?.sizeClass || '')}`.trim()}>
                              <div className="fuel-jerrycan__spout" />
                              <div className="fuel-jerrycan__handle" />
                              <div className="fuel-jerrycan__cap" />
                              <div className="fuel-jerrycan__body">
                                <div
                                  className="fuel-kiosk-fill-anim__liquid"
                                  style={{
                                    '--fuel-fill-ratio': `${selectedCanState ? animatedFillRatio : snapshotAnimatedFillRatio}`
                                  }}
                                />
                                <div className="fuel-jerrycan__panel" />
                                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--a" />
                                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--b" />
                              </div>
                            </div>
                          </div>
                          <span>
                            {selectedCanState
                              ? (selectedCanDisplayLabel || selectedCanState.displayLabel || selectedCanState.label)
                              : String(canVisualSnapshot?.label || '주유 말통')}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="fuel-kiosk-paypad__confirm">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => {
                        if (isComplete) {
                          onResetComplete();
                          return;
                        }
                        onConfirmFueling(fillLitersDraft);
                      }}
                      disabled={
                        !lastReceipt
                        || fueling
                        || directTargetFuelMismatch
                        || (!isComplete && ((!directTargetMachine && !selectedCanState && !canVisualSnapshot) || maxFillLiters <= 0))
                      }
                      title={confirmBlockedReason}
                    >
                      {fueling
                        ? '주유중...'
                        : (isComplete ? '주유완료' : '주유')}
                    </button>
                    {stagedCan ? (
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={onExtractStagedCan}
                        disabled={!mapTransferSelectedCarrier || fueling}
                        title={!mapTransferSelectedCarrier ? '먼저 적재함을 선택해 주세요.' : (fueling ? '주유 중에는 꺼낼 수 없습니다.' : '')}
                      >
                        적재함으로 꺼내기
                      </button>
                    ) : null}
                    {!isComplete ? (
                      <div className="fuel-kiosk-fill-input-wrap">
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          max={maxFillLiters || 0.01}
                          inputMode="decimal"
                          className="fuel-kiosk-fill-input"
                          value={fillLitersDraft}
                          onChange={(e) => onChangeFillLitersDraft(e.target.value)}
                          disabled={!lastReceipt || fueling || directTargetFuelMismatch || (!directTargetMachine && !selectedCanState) || maxFillLiters <= 0}
                          aria-label="주유 리터 입력"
                        />
                        <span>L</span>
                      </div>
                    ) : null}
                    {directTargetFuelMismatch ? (
                      <div className="meter__hint" style={{ color: '#b0523a' }}>
                        {`선택 차량은 ${machineFuelTypeLabelOf(directTargetMachine?.item?.fuelType)}만 주유할 수 있습니다.`}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
