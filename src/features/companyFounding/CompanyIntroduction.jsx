import React, { useEffect, useRef } from 'react';

const stages = [
  ['지금부터', '먼저 같이 팔아보기', '기존 사과와 택배시설로 주문 연결부터 경험합니다. 작은 물량으로 판매와 정산의 흐름을 확인합니다.'],
  ['준비 기간', '수익구조 다듬기', '판매 경험을 공유하며 비용·보상·출하·정산 기준을 보완합니다. 해마다 합의할 기본 출하량도 검토합니다.'],
  ['약 3년 후', '본격적인 공동사업 검토', '대화에서 생각한 준비 시점입니다. 판매 실적과 참여 의사를 확인해 설립·확대를 판단하고, 시설 투자는 이후 수요에 맞춰 검토합니다.']
];
const settlement = [
  ['20', '직접 판매비', '택배·포장·결제수수료·반품'],
  ['12', '회사 운영비', '선별·보관·판매 업무보수'],
  ['5', '손실충당금', '감모·부패·가격인하 대비'],
  ['63', '해당 차수 정산풀', '그 차수에 출하한 농가에 배분']
];

function SectionTitle({ number, eyebrow, children }) {
  return <header className="company-intro__section-title"><span>{number}</span><div><small>{eyebrow}</small><h3>{children}</h3></div></header>;
}

export default function CompanyIntroduction({ onDiscuss }) {
  const introRef = useRef(null);
  useEffect(() => { introRef.current?.closest('main')?.scrollTo({ top: 0 }); }, []);
  return (
    <article className="company-intro" aria-label="바람한조각 사업 소개" ref={introRef}>
      <header className="company-intro__hero">
        <div className="company-intro__hero-top"><span>바람한조각</span><span>법인설립 구상안 · 함께 논의하는 방향</span></div>
        <p className="company-intro__eyebrow">우리가 함께 만들 사업</p>
        <h2>각자 농장은 그대로,<br /><em>판매는 함께.</em></h2>
        <p className="company-intro__lead">우리가 키운 사과를 우리가 더 잘 팔기 위해.<br />농가의 선택권은 지키고, 모두가 판매에 참여하며 브랜드와 고객을 함께 키웁니다.</p>
        <div className="company-intro__hero-bottom"><span>독립 경영</span><span>하나의 판매팀</span><span>투명한 정산</span></div>
      </header>

      <section className="company-intro__heritage">
        <p>가게 운영과 직접 판매로 쌓아온 바람한조각의 경험.<br /><strong>이미 갖춘 선별·포장·주문·고객관리 기준</strong>을 공동판매의 기반으로 이어갑니다.</p>
      </section>

      <section className="company-intro__section">
        <SectionTitle number="01" eyebrow="사업 방향">농사의 독립성, 판매의 연결</SectionTitle>
        <p className="company-intro__copy">각자 흩어진 고객과 판매창구를 연결해 품종과 물량을 보완합니다. 안정적인 판로와 꾸준한 수익을 함께 만들고, 농가 혼자 감당하던 판매·경영 부담을 나누는 것이 목표입니다. 초기에는 큰 시설 투자보다 작게 같이 팔아보는 경험부터 쌓습니다.</p>
        <ol className="company-intro__flow">
          <li><small>생산</small><strong>각자의 농장</strong><p>재배·수확·품질관리<br />출하 가능한 물량 공유</p></li>
          <li><small>공동판매</small><strong>바람한조각 법인</strong><p>브랜드·주문·고객관리<br />택배판매와 농가 정산</p></li>
          <li><small>고객</small><strong>하나의 브랜드</strong><p>일관된 품질과 구성<br />직거래와 재구매</p></li>
        </ol>
        <p className="company-intro__note">농지·농기계·농사 방식은 각 농가가 유지합니다. 초기 목표는 공판장보다 나은 정산이며, 실제 판매가격과 비용·손실을 반영해 결정합니다.</p>
      </section>

      <section className="company-intro__section">
        <SectionTitle number="02" eyebrow="함께 일하는 방식">역할은 분명하게, 기준은 함께</SectionTitle>
        <div className="company-intro__roles">
          <div><h4>농가가 맡는 일</h4><ul><li>자기 농장 독립 경영과 재배·수확</li><li>기본 출하량 합의와 품질·물량 정보 공유</li><li>공통 기준에 맞는 선별·공급</li><li>주문 연결·홍보 등 함께 판매 경험 쌓기</li></ul></div>
          <div><h4>법인이 맡는 일</h4><ul><li>상품등록·판매·홍보와 고객 응대</li><li>브랜드·택배 주문·매출 관리</li><li>농가별 정산과 회계자료 정리</li></ul></div>
        </div>
        <div className="company-intro__agreement"><strong>모두가 판매를 아는 팀</strong><p>사과를 납품하는 데서 끝내지 않고, 각자 가능한 방식으로 주문·홍보·판로 개척에 참여합니다. 포장·발송은 기존 시설에 모으되, 판매 방법과 고객 반응은 함께 공유합니다.</p></div>
        <p className="company-intro__note">함께 정할 것: 기본 출하량, 품질·정산 기준, 판매 기여 보상, 회사에 남길 돈, 신규 투자와 참여 조건.</p>
      </section>

      <section className="company-intro__section company-intro__section--settlement">
        <SectionTitle number="03" eyebrow="기본 출하량 합의와 추가 출하 검토">기본 출하와 차수별 정산 검토안</SectionTitle>
        <ol className="company-intro__standards">
          <li><span>01</span><div><strong>수확기에 기본 출하량 합의</strong><p>그해 회사에 최소 얼마를 공급할지 함께 정합니다. 전 물량을 묶지 않고, 나머지 사과의 출하처는 각 농가가 선택합니다.</p></div></li>
          <li><span>02</span><div><strong>기본 물량 판매와 1차 정산</strong><p>합의한 물량을 확보하고 함께 판매합니다. 비용 등을 차감한 정산금을 해당 차수의 출하 농가에 배분합니다.</p></div></li>
          <li><span>03</span><div><strong>필요한 물량만 추가 출하</strong><p>판매 속도·남은 재고·보관비를 확인한 뒤 추가 물량을 정합니다. 추가 출하는 각 농가가 참여 여부를 선택합니다.</p></div></li>
          <li><span>04</span><div><strong>차수별로 참여 농가에 정산</strong><p>추가 물량의 판매대금·비용·재고를 구분해 기록하고, 그 차수에 출하한 농가끼리 추가 정산하는 방식을 논의합니다.</p></div></li>
        </ol>
        <div className="company-intro__example-head"><strong>미확정 검토안 · 차수별 참여와 정산 예시</strong><span>물량 확보·보관·품질·정산 문제 해결이 전제</span></div>
        <ol className="company-intro__flow">
          <li><small>1차 · 기본 출하</small><strong>A·B·C 각 400상자</strong><p>해당 차수 정산금을<br />각 ⅓씩 배분하는 예</p></li>
          <li><small>2차 · 자율 추가</small><strong>A·C 각 200상자</strong><p>2차 정산금은 A·C만<br />각 ½씩, B는 참여 없음</p></li>
          <li><small>3차 · 단독 추가</small><strong>A만 출하</strong><p>3차 물량의 농가 정산금은 A에게.<br />공동 브랜드 판매는 이어가기</p></li>
        </ol>
        <p className="company-intro__note">이 비율은 회사 주식 지분이 아닙니다. 같은 상자 수라도 품종·중량·등급이 다르면 판매가치가 다르므로, 상자 수만으로 균등 정산할지 품질을 어떻게 보정할지는 추가 합의가 필요합니다. 차수별 물량과 실제 정산 지급 주기는 구분해서 정합니다.</p>
        <SectionTitle number="!" eyebrow="예시를 검토할 때 반드시 확인할 문제">차수별 출하는 아직 확정하지 않았습니다</SectionTitle>
        <p className="company-intro__copy">초기에는 농가 사과를 선매입할 목돈이 부족하므로, 먼저 출하하고 판매 후 정산하는 위탁 방식으로 시작하는 방향입니다. 수확기에 그해 회사에 넣을 최소 물량을 먼저 합의하자는 데 대화가 모였습니다. 추가 출하와 차수별 정산은 아래 문제를 해결해야 하는 검토안입니다.</p>
        <aside className="company-intro__risks" aria-label="차수별 출하의 미해결 문제">
          <strong>중요 · 사과는 필요할 때마다 꺼내 쓸 수 있는 재고가 아닙니다</strong>
          <p>추가 출하를 기다리는 동안에도 보관비가 들고 품질이 떨어질 수 있습니다. 자유롭게 추가 납품한다는 장점만으로 운영방식을 확정하면 안 됩니다.</p>
          <ul>
            <li><b>추가 물량 확보 불확실</b> 공판장 가격이 좋으면 농가가 먼저 출하할 수 있어, 회사가 기대한 2차 물량이 남아 있지 않을 수 있습니다.</li>
            <li><b>보관비·감모·부패 부담</b> 추가 출하를 기다리는 사과를 어디에 보관하고, 비용과 손실은 누가 부담할지 정하지 않았습니다.</li>
            <li><b>같은 상자 수가 같은 가치는 아님</b> 품종·중량·등급·판매 시점이 다르면 같은 수량을 내도 똑같이 나누기 어렵습니다.</li>
            <li><b>차수가 겹치면 정산이 복잡</b> 이전 차수 재고가 남은 채 다음 물량이 들어오면 판매대금·공통비용·반품을 어느 차수에 반영할지 구분해야 합니다.</li>
          </ul>
          <p><b>먼저 합의할 기준:</b> 수확기에 연간 최소 공급량을 정하고, 추가 공급 가능 물량·보관 책임·차수 구분·비용 및 손실 배분 기준을 함께 검토합니다. 추가 물량은 확보가 보장된 것으로 가정하지 않습니다.</p>
        </aside>
        <div className="company-intro__example-head"><strong>판매대금 <b>100원</b>을 나누는 예</strong><span>설명용 예시 · 확정 비율 아님</span></div>
        <div className="company-intro__settlement">
          {settlement.map(([amount, title, detail]) => <div key={title}><strong>{amount}<small>원</small></strong><h4>{title}</h4><p>{detail}</p></div>)}
        </div>
        <p className="company-intro__note">매출을 그대로 나누는 것이 아니라 실제 직접비·운영비·충당금을 구분한 뒤 농가 정산금을 계산하는 예입니다. 위 수치는 PPT의 설명용 예시로, 확정 수수료나 약정 수익이 아닙니다. 차수별 비용 배분, 반품·잔여재고·남은 충당금의 최종 처리도 함께 정해야 합니다.</p>
        <details className="company-intro__details"><summary>품질 차이 보정과 손실 기준 · 추가 검토안</summary>
          <p>PPT의 정산포인트는 서로 다른 품질을 보정하기 위한 검토안입니다. 차수별 정산에 이를 적용할지, 품종·규격별로 물량을 따로 묶을지 아직 결정하지 않았습니다. 어느 방식이든 농가별 입고·선별·재고 기록은 유지합니다.</p>
          <p><strong>포인트 예시</strong> 정상품 1.00 / 흠과 0.45 / 가공용 0.15. 확정 기준이 아니며, 최근의 차수별 정산 방향과 어떻게 연결할지 합의해야 합니다.</p>
          <p><strong>계산 예시</strong> A농가 735점 ÷ 전체 2,100점 = 35%. 정산풀 630만원이면 A농가 몫은 220만5천원입니다.</p>
          <dl><div><dt>입고 선별 손실</dt><dd>농가별 선별 결과에 반영합니다.</dd></div><div><dt>정상 보관 손실</dt><dd>정상 입고 뒤의 감모·부패·할인판매는 공동 풀에서 충당하는 구상입니다.</dd></div><div><dt>관리상 과실</dt><dd>회사 과실은 회사, 특정 농가의 품질 문제는 해당 농가가 부담하는 기준을 합의합니다.</dd></div></dl>
          <p>로트번호·선별표·사진·폐기량을 공유하고, 이의제기 기간과 시즌 종료 재고처리는 계약서에 정리합니다.</p>
        </details>
      </section>

      <section className="company-intro__section">
        <SectionTitle number="04" eyebrow="공통 운영표준">판매창구가 바뀌어도, 품질은 그대로</SectionTitle>
        <ol className="company-intro__standards">{[
          ['입고 기록', '농가·품종·수확일·원물중량'], ['기존 선별기준', '정품·흠과·크기·과수 구분'], ['기존 포장기준', '판매규격과 박스·구성·표시방식'], ['품질 기록', '선별표·사진·폐기·재고 이동'], ['기준 변경', '함께 합의한 날짜부터 적용']
        ].map(([title, detail], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}</ol>
      </section>

      <section className="company-intro__section">
        <SectionTitle number="05" eyebrow="단계별 계획">시설보다 먼저, 팔리는 구조부터</SectionTitle>
        <ol className="company-intro__roadmap">{stages.map(([period, title, body]) => <li key={period}><span>{period}</span><div><h4>{title}</h4><p>{body}</p></div></li>)}</ol>
        <details className="company-intro__details"><summary>법인 설립과 기존 사업 이전 검토사항</summary>
          <p>PPT는 농업회사법인 주식회사를 시작 방향으로 제안합니다. 처음부터 공동창업하는 방식과 먼저 설립한 뒤 출하·지분 참여를 넓히는 방식을 함께 검토합니다. 지분율은 아직 확정하지 않습니다.</p>
          <p>기존 판매사업은 새 법인의 통장·쇼핑몰·결제·택배 계약과 연결하고, 이전일을 기준으로 매출과 비용을 구분하는 계획입니다. 브랜드·재고·고객정보의 이전 범위도 따로 정해야 합니다.</p>
          <p>세부 설립 조건, 사업 이전·개인정보 처리·세무와 매출 인식은 실제 진행 시점에 법무사·세무사·관할 기관의 확인이 필요합니다. 참여 농가와 공동시설 수요가 늘면 영농조합법인 등 추가 협업 방식도 검토합니다.</p>
        </details>
      </section>

      <footer className="company-intro__closing">
        <small>우리가 함께 지킬 약속</small><h3>농장은 각자 지키고,<br />판매와 신뢰는 함께 키웁니다.</h3>
        <p>누가 무엇을 얼마나 냈고, 어떻게 팔려 얼마가 남았는지 함께 확인합니다.<br />어느 한쪽에 부담이 몰리지 않도록 기준을 합의하고, 함께 팔아본 경험으로 오래갈 구조를 만듭니다.</p>
        <button type="button" onClick={onDiscuss}>이 방향으로 함께 논의하기 <span aria-hidden="true">↗</span></button>
        <div className="company-intro__source">법인설립 구상 PPT와 공유된 대화의 사업 관련 내용을 바탕으로 정리했습니다. 최근 대화의 방향과 기존 PPT의 검토 예시를 구분했으며, 이 화면은 확정된 계약·정관·수익 보장이 아닙니다.</div>
      </footer>
    </article>
  );
}
