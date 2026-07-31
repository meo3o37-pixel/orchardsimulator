import React from 'react';

export function CardIssueModal({
  activeTab,
  onSelectTab,
  cards,
  issuedCardSet,
  creditScore,
  won,
  renderCardVisual,
  onIssueCard,
  onClose
}) {
  return (
    <div className="confirm-modal card-modal">
      <div className="confirm-modal__title">카드 선택</div>
      <div className="confirm-modal__desc">발급할 카드를 바로 선택해 주세요.</div>
      <div className="focus-tabs" role="tablist" aria-label="카드 유형 선택">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'check'}
          className={`focus-tab focus-tab--farm-main-animate ${activeTab === 'check' ? 'focus-tab--active' : ''}`}
          onClick={() => onSelectTab('check')}
        >
          체크
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'credit'}
          className={`focus-tab focus-tab--farm-main-animate ${activeTab === 'credit' ? 'focus-tab--active' : ''}`}
          onClick={() => onSelectTab('credit')}
        >
          신용
        </button>
      </div>
      <div className="card-issue-scroll-box">
        <div className="card-issue-grid">
          {cards.map((card) => {
            const cardType = activeTab === 'credit' ? 'credit' : 'check';
            const isIssued = issuedCardSet.has(card.id);
            const minScore = Math.max(1, Number(card.minScore) || 1);
            const scoreBlocked = cardType === 'credit' && creditScore < minScore;
            const disabled = isIssued || scoreBlocked;

            return (
              <article key={card.id} className="card-issue-item">
                <div className="card-issue-head">
                  <strong>{card.name}</strong>
                  <span>{card.brand}</span>
                </div>
                <div className="card-issue-art">
                  {renderCardVisual(card)}
                </div>
                <div className="card-issue-fee">
                  {Number(card.annualFee) > 0 ? `연회비 ${won(card.annualFee || 0)}` : '연회비 없음'}
                </div>
                {cardType === 'credit' ? (
                  <div className="card-issue-score">신용카드 기준: {minScore}점 이상</div>
                ) : (
                  <div className="card-issue-score">체크카드</div>
                )}
                <div className="card-issue-benefits">
                  {card.benefits.map((benefit) => (
                    <div key={`${card.id}-${benefit}`}>• {benefit}</div>
                  ))}
                </div>
                <button
                  className="button button--primary day-transition-animate-button"
                  disabled={disabled}
                  onClick={() => onIssueCard(card, cardType)}
                >
                  {isIssued ? '발급완료' : (scoreBlocked ? '점수부족' : '발급')}
                </button>
              </article>
            );
          })}
        </div>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export function AccountIssueModal({
  accounts,
  issuedAccountSet,
  accountNumberById,
  primaryAccountId,
  won,
  onIssueAccount,
  onSetPrimaryAccount,
  onClose
}) {
  return (
    <div className="confirm-modal card-modal">
      <div className="confirm-modal__title">통장발급</div>
      <div className="confirm-modal__desc">원하는 통장 상품을 선택해 발급해 주세요.</div>
      <div className="card-issue-grid">
        {accounts.map((account) => {
          const isIssued = issuedAccountSet.has(account.id);
          const isPrimary = String(primaryAccountId || '') === account.id;
          const accountNumber = String(accountNumberById?.[account.id] || '').trim();

          return (
            <article key={account.id} className="card-issue-item">
              <div className="card-issue-head">
                <strong>{account.name}</strong>
                <span>{account.bank} · {account.type}</span>
              </div>
              <div className="card-issue-score">{isIssued ? `계좌번호 ${accountNumber || '미발급'}` : '계좌번호 발급 전'}</div>
              <div className="card-issue-fee">
                {Number(account.openingFee) > 0 ? `개설수수료 ${won(account.openingFee)}` : '개설수수료 없음'}
              </div>
              <div className="card-issue-score">{account.desc}</div>
              <div className="card-issue-benefits">
                {(account.perks || []).map((perk) => (
                  <div key={`${account.id}-${perk}`}>• {perk}</div>
                ))}
              </div>
              <div className="footer-actions" style={{ marginTop: 4 }}>
                <button
                  className="button button--primary day-transition-animate-button"
                  disabled={isIssued}
                  onClick={() => onIssueAccount(account)}
                >
                  {isIssued ? '개설완료' : '개설'}
                </button>
                <button
                  className="button button--ghost day-transition-animate-button"
                  disabled={!isIssued || isPrimary}
                  onClick={() => onSetPrimaryAccount(account.id)}
                >
                  {isPrimary ? '주통장' : '주통장 설정'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
