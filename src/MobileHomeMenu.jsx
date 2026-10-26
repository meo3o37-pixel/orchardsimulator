import React from 'react';
import { FirstVisitFrame } from './systems/loading/GameBootLoader';

export default function MobileHomeMenu({ plannerUrl, onPrice, onCompany, onGame }) {
  return <FirstVisitFrame className="mobile-home-menu" label="모바일 서비스 선택" title="무엇을 이용할까요?" subtitle="바람한조각에서 원하시는 서비스를 선택해주세요.">
    <nav className="mobile-home-menu__actions" aria-label="바람한조각 서비스">
      <a className="mobile-home-menu__action" href={plannerUrl} download="OrchardPlanner-Setup-1.0.0.exe"><span aria-hidden="true">✦</span><span><strong>재식 프로그램</strong><small>Windows PC 설치파일 다운로드</small></span><b aria-hidden="true">↗</b></a>
      <button type="button" className="mobile-home-menu__action" onClick={onPrice}><span aria-hidden="true">₩</span><span><strong>사과 가격표</strong><small>품종별 가격과 재고 확인</small></span><b aria-hidden="true">›</b></button>
      <button type="button" className="mobile-home-menu__action" onClick={onCompany}><span aria-hidden="true">㈜</span><span><strong>법인설립 준비실</strong><small>승인된 멤버 전용 공간</small></span><b aria-hidden="true">›</b></button>
      <button type="button" className="mobile-home-menu__action mobile-home-menu__action--game" onClick={onGame}><span aria-hidden="true">▶</span><span><strong>웹게임 시작</strong><small>과수 타이쿤 새로 시작 · 불러오기</small></span><b aria-hidden="true">›</b></button>
    </nav>
  </FirstVisitFrame>;
}
