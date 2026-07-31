import React from 'react';

const ANIMATION_LAB_UI_WORKSHOP_SECTIONS = Object.freeze([
  {
    key: 'phone',
    title: '휴대폰 앱 실험',
    badge: '모바일',
    description: '설정앱, 홈화면, 위젯, 앱 상세 화면처럼 손이 자주 가는 모바일 UI를 따로 모아 검증합니다.',
    tasks: ['앱 진입 플로우 점검', '슬라이더/토글 체감 확인', '잠금화면-홈 전환 연출 정리']
  },
  {
    key: 'field',
    title: '농장 패널 실험',
    badge: '인게임',
    description: '토지 카드, 작업 카드, 상태 미터처럼 플레이어가 오래 보는 본게임 UI를 이곳에서 시안화합니다.',
    tasks: ['작업 버튼 밀도 조정', '수치 읽기 쉬운 순서 점검', '현실감 있는 농장 톤 유지']
  },
  {
    key: 'modal',
    title: '모달/팝업 실험',
    badge: '인터랙션',
    description: '확인 모달, 구매 모달, 결과 팝업처럼 순간 판단이 필요한 UI를 빠르게 비교합니다.',
    tasks: ['닫기 동선 점검', '위험/경고 표현 분리', '모바일 세로폭 대응']
  },
  {
    key: 'hud',
    title: '계기판/요약 바 실험',
    badge: '대시보드',
    description: '상단 바, 날씨 배너, 작업 진행 요약처럼 한눈에 판단해야 하는 정보를 가볍게 실험합니다.',
    tasks: ['정보 우선순위 재배치', '계절/날씨 상태 강조', '좁은 해상도 축약 규칙 정리']
  }
]);
const ANIMATION_LAB_UI_SAMPLE_TERM_GROUPS = Object.freeze([
  {
    key: 'structure',
    title: '구조/이동',
    terms: ['캐러셀', '커버 플로우', '슬라이더', '탭', '사이드바', '서랍 메뉴', '하단 메뉴', '단계 표시', '이동 경로']
  },
  {
    key: 'selection',
    title: '선택/강조',
    terms: ['카드', '타일', '칩', '배지', '선택 상태', '강조 상태', '활성 상태', '포커스 표시']
  },
  {
    key: 'info',
    title: '정보 표시',
    terms: ['대시보드', '패널', '위젯', '목록형 보기', '격자형 보기', '상세 보기', '요약 보기', '상태판']
  },
  {
    key: 'motion',
    title: '동작/전환',
    terms: ['모달', '팝오버', '도움말 말풍선', '아코디언', '펼치기', '접기', '넘기기', '전환 효과']
  },
  {
    key: 'style',
    title: '스타일/느낌',
    terms: ['미니멀', '유리 질감', '입체 버튼형', '복고 미래형', '산업 장비형', '기계 조작형', '현장 장비형']
  }
]);

export default function AnimationLabUiWorkshop() {
  return (
    <div className="animation-lab-ui">
      <section className="animation-lab-ui__hero">
        <div className="animation-lab-ui__eyebrow">UI WORKSHOP</div>
        <h3>실험용 화면 시안을 모아두는 전용 제작소</h3>
        <p>
          휴대폰 앱, 농장 패널, 모달, 상단 요약 바처럼 자주 다듬는 UI를 한곳에 모아
          빠르게 비교하고 다음 시안을 정리할 수 있게 분리했습니다.
        </p>
        <div className="animation-lab-ui__hero-chips">
          <span>HTML 실험실과 분리된 보드</span>
          <span>모바일/데스크톱 혼합 검토</span>
          <span>농장 톤 유지용 메모 공간</span>
        </div>
      </section>
      <div className="animation-lab-ui__grid">
        {ANIMATION_LAB_UI_WORKSHOP_SECTIONS.map((section) => (
          <article key={section.key} className="animation-lab-ui__card panel-card">
            <div className="animation-lab-ui__card-head">
              <span>{section.badge}</span>
              <strong>{section.title}</strong>
            </div>
            <p>{section.description}</p>
            <ul className="animation-lab-ui__task-list">
              {section.tasks.map((task) => (
                <li key={`${section.key}-${task}`}>{task}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="animation-lab-ui__board">
        <section className="animation-lab-ui__note-card panel-card">
          <div className="animation-lab-ui__section-title">제작 기준</div>
          <ul className="animation-lab-ui__bullet-list">
            <li>현실 농장 시뮬레이터 톤을 유지하면서 과장된 장식은 줄입니다.</li>
            <li>버튼은 누를 이유가 분명해야 하고, 작업 흐름을 막는 장식은 배제합니다.</li>
            <li>모바일에서 먼저 읽히고 데스크톱에서 정보가 확장되는 구조를 우선합니다.</li>
          </ul>
        </section>
        <section className="animation-lab-ui__note-card panel-card">
          <div className="animation-lab-ui__section-title">추천 다음 작업</div>
          <div className="animation-lab-ui__timeline">
            <div>
              <strong>1. 휴대폰 앱</strong>
              <span>설정앱, 날씨앱, 홈 위젯을 시안별로 묶어서 비교</span>
            </div>
            <div>
              <strong>2. 인게임 패널</strong>
              <span>토지 카드와 작업 패널의 정보 밀도를 조정</span>
            </div>
            <div>
              <strong>3. 모달 체계</strong>
              <span>구매/경고/확인 모달을 역할별로 분리</span>
            </div>
          </div>
        </section>
      </div>
      <section className="animation-lab-ui__sample-card panel-card">
        <div className="animation-lab-ui__section-title">샘플 UI 단어</div>
        <div className="animation-lab-ui__sample-grid">
          {ANIMATION_LAB_UI_SAMPLE_TERM_GROUPS.map((group) => (
            <article key={group.key} className="animation-lab-ui__sample-group">
              <strong>{group.title}</strong>
              <div className="animation-lab-ui__term-chips">
                {group.terms.map((term) => (
                  <span key={`${group.key}-${term}`}>{term}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
