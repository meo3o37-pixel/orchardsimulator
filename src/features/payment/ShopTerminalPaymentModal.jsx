import React from 'react';

export default function ShopTerminalPaymentModal({
  open,
  amount,
  card,
  isCash,
  isCredit,
  installmentMonths,
  done,
  renderCardVisual,
  won
}) {
  if (!open) return null;

  const formattedAmount = won(amount);
  const cardName = String(card?.name || card?.label || '카드');
  const cardLastDigits = String(card?.id || '')
    .replace(/\D/g, '')
    .slice(-4);
  const receiptInstallmentText = isCredit && installmentMonths > 1
    ? `${installmentMonths}개월`
    : '일시불';

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--shop-pay" style={{ zIndex: 6002 }} />
      <div className={`confirm-modal shop-terminal-modal ${isCash ? 'shop-terminal-modal--cash-new' : 'shop-terminal-modal--card-new'}`.trim()} style={{ zIndex: 6003 }}>
        <div className="confirm-modal__title">{isCash ? '현금 결제중' : '카드 결제중'}</div>
        <div className="confirm-modal__desc">
          {isCash
            ? '현금 지폐를 투입구에 넣고 결제하는 중입니다.'
            : '카드를 단말기에 그어 결제하는 중입니다.'}
        </div>
        <div className="shop-terminal-stage">
          {isCash ? <CashPaymentScene /> : null}
          {!isCash ? <CardPaymentEffects /> : null}
          {!isCash ? (
            <div className="shop-terminal-card-swipe">
              {card ? renderCardVisual(card) : null}
            </div>
          ) : null}
          <div className="shop-terminal-device">
            <div className="terminal-top">
              <span>{isCash ? 'CASH PAY' : 'FARM POS'}</span>
              <span className="terminal-led" />
            </div>
            <div className="shop-terminal-screen">
              {!isCash ? <CardScreenDetails /> : null}
              {isCash ? (
                <>
                  <div className="shop-terminal-screen__label">
                    {done ? '결제 상태' : '결제금액'}
                  </div>
                  <div className="shop-terminal-screen__amount">
                    {done ? '결제완료!' : formattedAmount}
                  </div>
                </>
              ) : (
                <CardScreenStates
                  amount={formattedAmount}
                  doneText={isCredit && installmentMonths > 1
                    ? `결제완료! ${installmentMonths}개월 할부!`
                    : '결제완료!'}
                />
              )}
            </div>
            {isCash ? <CashTerminalOutput /> : (
              <CardTerminalOutput
                amount={formattedAmount}
                cardName={cardName}
                cardLastDigits={cardLastDigits}
                installmentText={receiptInstallmentText}
                done={done}
              />
            )}
          </div>
        </div>
        <div className="meter__hint" style={{ marginTop: 8, textAlign: 'center' }}>
          {done
            ? '영수증 출력 중...'
            : isCash
              ? '현금 결제중...'
              : '카드 결제중...'}
        </div>
      </div>
    </>
  );
}

function CashPaymentScene() {
  return (
    <>
      <section className="cash-wallet-zone" aria-hidden="true">
        <div className="cash-wallet-title">현금 꺼내는 중</div>
        <div className="cash-wallet">
          <div className="cash-wallet__id-pocket">
            <div className="cash-wallet__id-card">
              <span /><span /><span />
            </div>
          </div>
          <div className="cash-wallet__coin-pocket" />
          <div className="cash-wallet__strap">
            <span />
          </div>
        </div>
      </section>
      <section className="cash-payment-lane" aria-hidden="true">
        <div className="cash-payment-label">현금 전달 중</div>
        <div className="cash-payment-line" />
        <div className="cash-flying-bill cash-flying-bill--one">
          <span>KR 10000</span>
          <strong>₩10,000</strong>
        </div>
        <div className="cash-flying-bill cash-flying-bill--two">
          <span>KR 05000</span>
          <strong>₩5,000</strong>
        </div>
        <span className="cash-coin cash-coin--one">₩</span>
        <span className="cash-coin cash-coin--two">₩</span>
      </section>
      <div className="cash-done-toast" aria-hidden="true">
        <span />
        현금 결제 완료
      </div>
    </>
  );
}

function CardPaymentEffects() {
  return (
    <>
      <span className="pay-spark" />
      <span className="pay-spark" />
      <span className="pay-spark" />
      <span className="pay-spark" />
      <span className="pay-spark" />
    </>
  );
}

function CardScreenDetails() {
  return (
    <>
      <div className="shop-terminal-screen__meta">
        <span>ONLINE</span>
        <span>POS-03</span>
      </div>
      <div className="shop-terminal-screen__lines">
        <span />
        <span />
      </div>
    </>
  );
}

function CardScreenStates({ amount, doneText }) {
  return (
    <>
      <div className="shop-terminal-screen__state shop-terminal-screen__state--processing">
        <div className="shop-terminal-screen__label">결제금액</div>
        <div className="shop-terminal-screen__amount">{amount}</div>
        <div className="screen-loader" />
      </div>
      <div className="shop-terminal-screen__state shop-terminal-screen__state--auth">
        <div className="shop-terminal-screen__label">카드사 승인 요청</div>
        <div className="shop-terminal-screen__amount">승인 확인중</div>
        <div className="signal-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="shop-terminal-screen__state shop-terminal-screen__state--done">
        <div className="screen-check" />
        <div className="shop-terminal-screen__label">결제 상태</div>
        <div className="shop-terminal-screen__amount">{doneText}</div>
      </div>
    </>
  );
}

function CashTerminalOutput() {
  return (
    <>
      <div className="shop-terminal-cash-slot" />
      <div className="shop-terminal-cash-slot-label">RECEIPT</div>
      <div className="shop-terminal-bill-insert">
        <div className="shop-terminal-bill" />
      </div>
      <div className="shop-terminal-cash-receipt" />
    </>
  );
}

function CardTerminalOutput({
  amount,
  cardName,
  cardLastDigits,
  installmentText,
  done
}) {
  return (
    <>
      <div className="shop-terminal-slot-label">CARD READER</div>
      <div className="shop-terminal-slot" />
      <div className={`receipt receipt--card ${done ? 'is-printed' : ''}`.trim()}>
        <div className="receipt__brand">ORCHARD POS</div>
        <div className="receipt__row">
          <span>승인</span>
          <strong>{amount}</strong>
        </div>
        <div className="receipt__row">
          <span>카드</span>
          <strong>{cardLastDigits ? `**** ${cardLastDigits}` : cardName}</strong>
        </div>
        <div className="receipt__row">
          <span>구분</span>
          <strong>{installmentText}</strong>
        </div>
        <div className="receipt__stamp">PAID</div>
      </div>
      <div className="terminal-body-row">
        <div className="terminal-input-stack">
          <div className="terminal-keypad">
            <span /><span /><span />
            <span /><span /><span />
            <span /><span /><span />
          </div>
          <div className="terminal-function-row">
            <span /><span /><span />
          </div>
        </div>
        <div className="contactless-mark">
          <div className="contactless-icon">
            <span className="contactless-icon__dot" />
            <span className="contactless-icon__wave contactless-icon__wave--sm" />
            <span className="contactless-icon__wave contactless-icon__wave--md" />
            <span className="contactless-icon__wave contactless-icon__wave--lg" />
          </div>
        </div>
      </div>
    </>
  );
}
