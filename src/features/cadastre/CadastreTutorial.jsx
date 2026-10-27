import React, { useId, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import './CadastreTutorial.css';

// Add feature explanations and ordered instructions here for each design tab.
const GUIDES = {
  farm: {
    title: '재배구역·식재 설계',
    description: '토지 안에 재배구역을 정하고 품목·품종, 대목과 식재 간격을 설정합니다.',
    steps: ['재배구역을 만들거나 선택하고 경계를 정하세요. 토지 전체를 쓰려면 토지 그대로 사용을 선택하세요.', '품목·품종과 대목, 열 간격·주 간격, 식재 방향과 경계 여백을 설정하고 지도에서 배치를 확인하세요.', '식재 계획을 확정한 뒤 작업 탭에서 실제 식재를 진행하세요.'],
    note: '설계 확정과 실제 작업은 별개입니다. 계획만 저장해도 나무가 심어지는 것은 아닙니다.'
  },
  drainage: {
    title: '배수로 설계',
    description: '지표 배수로: 300평당 30m(최소 12m), 1,500평당 외부 배출구 1개.',
    steps: ['토지 하경사 방향과 필요한 최소 길이·배출구 수를 확인하세요.', '배수로 종류를 고르고 지도에 수로를 그리세요. 낮은 쪽 토지 밖 배출구까지 연결하세요.', '배수 계획을 확정한 뒤 작업 탭에서 시공 방식을 선택하고 작업을 진행하세요.'],
    note: '지표 배수로 시공과 나무 아래 유공관 매설은 별도 작업입니다.'
  },
  pipes: {
    title: '유공관 매설 설계',
    description: '실제로 심은 나무 한 줄 아래에 한 줄씩 매설합니다.',
    steps: ['실제 식재된 나무 열이 지도에 연결되어 있는지 확인하세요.', '연결할 배수로를 선택하고 유공관을 매설할 나무 열을 고르세요.', '선택한 열 아래로 관로를 생성해 확인한 뒤 유공관 계획을 확정하세요. 실제 매설은 작업 탭에서 진행합니다.'],
    note: '나무 열의 위치와 연결할 배수로가 먼저 필요합니다.'
  },
  parking: {
    title: '노지 주차장',
    description: '주차 1칸은 4평입니다. 옆의 회차 공간은 별도로 면적을 사용하며 주차장과 회차 공간 안에는 식재하지 않습니다.',
    steps: ['주차 칸 수와 배치 방향을 선택하세요.', '지도에서 위치 선택을 누르고 주차장 시작 모서리를 지정하세요.', '토지 경계와 다른 시설의 겹침을 확인한 뒤 주차장 계획을 확정하세요. 실제 시공은 작업 탭에서 진행합니다.'],
    note: '토지를 고르거나 새로 구매했다면 식재 전에 주차장을 배치해 주세요. 기존 저장은 배치 전까지 기존 주차 용량을 유지합니다.'
  }
};

export default function CadastreTutorial({ topic, title }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const guide = GUIDES[topic];
  return <div className="cadastre-tutorial">
    <div className="cadastre-tutorial__heading">
      <h3>{title || guide.title}</h3>
      <button type="button" className="cadastre-tutorial__toggle" aria-expanded={open} aria-controls={id} aria-label={`${guide.title} 튜토리얼`} onClick={() => setOpen(!open)}>
        <BookOpen size={17} aria-hidden="true" />튜토리얼<ChevronDown size={15} aria-hidden="true" />
      </button>
    </div>
    <div id={id} className={`cadastre-tutorial__reveal${open ? ' is-open' : ''}`} aria-hidden={!open} {...(!open ? { inert: '' } : {})}>
      <div className="cadastre-tutorial__clip">
      <section className="cadastre-tutorial__content" aria-label={`${guide.title} 사용법`}>
      <h4>{guide.title} 사용법</h4>
      <p>{guide.description}</p>
      <ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="cadastre-tutorial__note">{guide.note}</p>
    </section>
      </div>
    </div>
  </div>;
}