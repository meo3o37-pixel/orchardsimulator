import React from 'react';

export default function HarvestBreakdownModal({
  modalData,
  onClose,
  harvestBoxCapacityKg
}) {
  if (!modalData) return null;

  const sections = Array.isArray(modalData?.sections) ? modalData.sections : [];

  return (
    <>
      <div className="confirm-modal-backdrop" onClick={onClose} />
      <div className="confirm-modal confirm-modal--harvest-picker confirm-modal--harvest-breakdown">
        <div className="confirm-modal__title">{modalData.title || '수확 산출식'}</div>
        <div className="confirm-modal__desc">{modalData.desc || '이번 작업 예상 수량의 계산 근거입니다.'}</div>
        <div className="harvest-breakdown-body">
          <div className="harvest-breakdown-summary-grid">
            <div className="harvest-breakdown-summary-card">
              <span>예상 수확량</span>
              <strong>{`${Math.max(0, Math.round(Number(modalData?.summary?.qtyKg) || 0)).toLocaleString()}kg`}</strong>
            </div>
            <div className="harvest-breakdown-summary-card">
              <span>예상 박스 수</span>
              <strong>{`${Math.max(0, Math.floor(Number(modalData?.summary?.boxCount) || 0)).toLocaleString()}박스`}</strong>
              <small>{`${harvestBoxCapacityKg}kg/박스`}</small>
            </div>
            <div className="harvest-breakdown-summary-card">
              <span>결정 요인</span>
              <strong>{modalData?.summary?.limiterText || '없음'}</strong>
            </div>
          </div>
          {sections.map((section) => (
            <div key={section.key} className="harvest-breakdown-stage-card">
              <div className="harvest-breakdown-stage-card__title">{section.title}</div>
              <div className="harvest-breakdown-summary-grid harvest-breakdown-summary-grid--stage">
                <div className="harvest-breakdown-summary-card">
                  <span>예상 수확량</span>
                  <strong>{`${Math.max(0, Math.round(Number(section?.summary?.qtyKg) || 0)).toLocaleString()}kg`}</strong>
                </div>
                <div className="harvest-breakdown-summary-card">
                  <span>예상 박스 수</span>
                  <strong>{`${Math.max(0, Math.floor(Number(section?.summary?.boxCount) || 0)).toLocaleString()}박스`}</strong>
                  <small>{`${harvestBoxCapacityKg}kg/박스`}</small>
                </div>
                <div className="harvest-breakdown-summary-card">
                  <span>결정 요인</span>
                  <strong>{section?.summary?.limiterText || '없음'}</strong>
                </div>
              </div>
              {String(section?.zeroQtyReason || '') ? (
                <div className="harvest-breakdown-note">
                  {`0kg 사유: ${String(section.zeroQtyReason)}`}
                </div>
              ) : null}
              <div className="harvest-breakdown-section">
                <div className="harvest-breakdown-section__title">선택 인원</div>
                {Array.isArray(section?.selectedWorkers) && section.selectedWorkers.length ? (
                  <div className="harvest-breakdown-worker-grid">
                    {section.selectedWorkers.map((worker) => (
                      <div key={worker.id} className="harvest-breakdown-worker-card">
                        <strong>{worker.name}</strong>
                        <span>{`${Math.max(0, Number(worker?.laborPoints) || 0).toFixed(1)} 노동력`}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="meter__hint">선택된 인원이 없습니다.</div>
                )}
              </div>
              <div className="harvest-breakdown-section">
                <div className="harvest-breakdown-section__title">인원별 1노동력당 수확량</div>
                {Array.isArray(section?.workerBreakdowns) && section.workerBreakdowns.length ? (
                  <div className="harvest-breakdown-detail-grid">
                    {section.workerBreakdowns.map((row) => (
                      <div key={row.id} className="harvest-breakdown-detail-card">
                        <div className="harvest-breakdown-detail-card__head">
                          <strong>{row.name}</strong>
                          <span>{`${Math.max(0, Number(row?.laborPoints) || 0).toFixed(1)} 노동력`}</span>
                        </div>
                        <div className="harvest-breakdown-detail-card__line">
                          <span>1노동력당 수확</span>
                          <strong>{`${Math.max(0, Number(row?.perPointFinal) || 0).toFixed(2)}kg`}</strong>
                        </div>
                        <div className="harvest-breakdown-detail-card__line">
                          <span>예상 기여량</span>
                          <strong>{`${Math.max(0, Number(row?.estimatedWorkerQtyKg) || 0).toFixed(1)}kg`}</strong>
                        </div>
                        {Math.max(0, Number(row?.fixedBonusKg) || 0) > 0 ? (
                          <div className="harvest-breakdown-detail-card__line">
                            <span>고정 보너스</span>
                            <strong>{`+${Math.max(0, Number(row?.fixedBonusKg) || 0).toFixed(1)}kg`}</strong>
                          </div>
                        ) : null}
                        <small>{row.reasonText}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="meter__hint">인원별 산출 근거가 없습니다.</div>
                )}
              </div>
              <div className="harvest-breakdown-final-card">
                <div className="harvest-breakdown-section__title">최종 계산</div>
                <div className="harvest-breakdown-final-card__formula">
                  {`${Math.max(0, Math.round(Number(section?.summary?.qtyKg) || 0)).toLocaleString()}kg = min(노동력 ${Math.floor(Math.max(0, Number(section?.final?.laborCapacityKg) || 0)).toLocaleString()}kg, 박스 ${section?.final?.boxCapacityKg == null ? '무제한' : `${Math.floor(Math.max(0, Number(section.final.boxCapacityKg) || 0)).toLocaleString()}kg`}, 남은 수확 ${Math.floor(Math.max(0, Number(section?.final?.remainingQtyKg) || 0)).toLocaleString()}kg)`}
                </div>
                <div className="meter__hint">
                  {`박스 보유: ${Math.max(0, Math.floor(Number(section?.final?.boxUnitsAvailable) || 0)).toLocaleString()}개`}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="footer-actions">
          <button className="button button--primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </>
  );
}
