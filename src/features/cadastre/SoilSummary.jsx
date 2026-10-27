import React, { useId, useState } from 'react';
import { SOIL_TYPES, soilProfileOf, soilCompositionText } from '../../utils/soil';
import { rootWaterStressEffects } from '../../utils/rootWaterStress.js';
import './SoilSummary.css';

const COLORS = { sand: '#d5b16d', sandyLoam: '#a8b879', loam: '#438569', clayLoam: '#ac8264', clay: '#827890' };
const SOIL_VISUALS = {
  sand: { file: 'sand', texture: '거친 모래 알갱이', alt: '사질토 예시: 느슨하게 쌓인 굵은 모래 알갱이' },
  sandyLoam: { file: 'sandy-loam', texture: '모래와 잔흙이 섞인 질감', alt: '사양토 예시: 모래 알갱이와 고운 흙이 섞인 모습' },
  loam: { file: 'loam', texture: '잘 부스러지는 작은 흙알', alt: '양토 예시: 작고 부스러지는 흙알이 모인 모습' },
  clayLoam: { file: 'clay-loam', texture: '고운 흙과 단단한 흙덩이', alt: '식양토 예시: 고운 흙과 비교적 단단한 덩어리가 섞인 모습' },
  clay: { file: 'clay', texture: '촘촘하게 뭉친 찰진 흙덩이', alt: '점질토 예시: 치밀하고 매끈한 면을 가진 큰 흙덩이' }
};
const SOIL_NOTES = {
  sand: '물이 빠르게 빠지고 가장 빨리 마릅니다. 건조할 때 수분 관리가 중요합니다.',
  sandyLoam: '배수가 좋은 편이며 양토보다 빨리 마릅니다. 비가 적을 때 수분을 살펴주세요.',
  loam: '건조 속도와 배수 능력의 기준 토양입니다. 수분 유지와 배수가 균형을 이룹니다.',
  clayLoam: '천천히 마르고 자연 배수가 느립니다. 비가 이어지면 과습에 주의하세요.',
  clay: '수분을 가장 오래 유지하며 자연 배수가 가장 느립니다. 배수시설 관리가 중요합니다.'
};
const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
function Gauge({ title, value, percent, low, high, water, children }) {
  return <div className="soil-summary__gauge">
    <div className="soil-summary__gauge-heading"><span>{title}</span><strong>{value}</strong></div>
    <div className={`soil-summary__track${water ? ' soil-summary__track--water' : ''}`} role="meter" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamp(percent))} aria-valuetext={value}>
      {water ? <i className="soil-summary__pointer" style={{ left: `${clamp(percent)}%` }} /> : <span style={{ width: `${clamp(percent)}%` }} />}
    </div>
    <div className="soil-summary__scale"><span>{low}</span><span>{high}</span></div>{children}
  </div>;
}
export default function SoilSummary({ field }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const soil = soilProfileOf(field), effects = rootWaterStressEffects(field), water = clamp(field?.water);
  const waterLabel = water < 25 ? '건조' : water < 75 ? '적정' : water < 80 ? '수분 많음' : water < 90 ? '과습 주의' : '습해 위험';
  const tone = water >= 80 ? 'warning' : water < 25 ? 'dry' : 'healthy';
  let offset = 0;
  const slices = SOIL_TYPES.map((type) => { const percent = soil.composition[type.key], start = offset; offset += percent; return { ...type, percent, start }; });
  const dominant = slices.find((type) => type.name === soil.dominant);
  const drainageLabel = soil.excess >= 1.6 ? '빠름' : soil.excess >= .8 ? '보통' : '느림';
  return <section className="action-section cadastre-panel soil-summary" aria-label="토양 구성과 배수 특성">
    <header className="soil-summary__header"><h3 className="soil-summary__heading">토양 구성 <span>· {soil.dominant} 중심</span></h3><span className={`soil-summary__badge soil-summary__badge--${tone}`}>{waterLabel}</span></header>
    <div className="soil-summary__composition">
      <svg className="soil-summary__donut" viewBox="0 0 136 136" role="img" aria-label={`토양 면적 구성: ${soilCompositionText(field)}`}>
        <circle cx="68" cy="68" r="51" fill="none" stroke="#e9eee7" strokeWidth="15" />
        <g transform="rotate(-90 68 68)">{slices.filter((t) => t.percent > 0).map((t) => <circle key={t.key} cx="68" cy="68" r="51" fill="none" stroke={COLORS[t.key]} strokeWidth="15" pathLength="100" strokeDasharray={`${t.percent} ${100 - t.percent}`} strokeDashoffset={-t.start} />)}</g>
        <text className="soil-summary__donut-value" x="68" y="68" textAnchor="middle">{dominant.percent}<tspan className="soil-summary__donut-unit">%</tspan></text><text className="soil-summary__donut-label" x="68" y="88" textAnchor="middle">{soil.dominant}</text>
      </svg>
      <ul className="soil-summary__legend" aria-label="토양별 면적 비율">{slices.map((t) => <li key={t.key} style={{ '--soil-color': COLORS[t.key] }}><span className="soil-summary__soil-name"><i />{t.name}</span><span className="soil-summary__soil-track" aria-hidden="true"><i style={{ width: `${t.percent}%` }} /></span><strong>{t.percent}<small>%</small></strong></li>)}</ul>
    </div>
    <div className="soil-summary__gauges">
      <Gauge title="자연 배수" value={`${soil.excess.toFixed(2)} /일`} percent={soil.excess / 2.4 * 100} low="느림" high="빠름"><small className="soil-summary__gauge-note">배수 속도 {drainageLabel} · 과습 시 최대치</small></Gauge>
      <Gauge title="건조 속도" value={`×${soil.drying.toFixed(2)}`} percent={(soil.drying - .72) / .63 * 100} low="느림" high="빠름"><small className="soil-summary__gauge-note">양토 ×1.00 기준</small></Gauge>
      <Gauge title="현재 토양 수분" value={`${water.toFixed(1)} /100`} percent={water} low="건조" high="과습" water><small className={`soil-summary__gauge-note soil-summary__gauge-note--${tone}`}>{waterLabel}{effects.state.wetDays > 0 ? ` · 연속 과습 ${effects.state.wetDays}일` : ''}</small></Gauge>
    </div>
    {effects.vigorPenalty > 0 && <div className="soil-summary__damage" role="status"><strong>{effects.label}</strong><span>수세 최소 −{effects.vigorPenalty.toFixed(2)}/일 · 품질 −{effects.qualityPenalty.toFixed(2)}/일</span></div>}
    <div className="soil-summary__details">
      <button type="button" className="soil-summary__details-toggle" aria-expanded={detailsOpen} aria-controls={detailsId} onClick={() => setDetailsOpen(!detailsOpen)}><span aria-hidden="true">▸</span>수분·배수 특성 보기</button>
      <div id={detailsId} className={`soil-summary__reveal${detailsOpen ? ' is-open' : ''}`} aria-hidden={!detailsOpen} {...(!detailsOpen ? { inert: '' } : {})}>
      <div className="soil-summary__details-content">
      <div className="soil-summary__types">
        {SOIL_TYPES.map((type) => <article className="soil-summary__type" key={type.key} style={{ '--soil-color': COLORS[type.key] }}>
          <h4>{type.name}<span>이 토지 {soil.composition[type.key]}%</span></h4>
          <figure className="soil-summary__sample">
            <img src={`/images/soil/${SOIL_VISUALS[type.key].file}.png`} alt={SOIL_VISUALS[type.key].alt} width="256" height="256" loading="lazy" decoding="async" />
            <figcaption>{SOIL_VISUALS[type.key].texture}</figcaption>
          </figure>
          <p>{SOIL_NOTES[type.key]}</p>
          <dl>
            <div><dt>건조 속도</dt><dd>×{type.drying.toFixed(2)}</dd></div>
            <div><dt>자연 배수 최대</dt><dd>{type.excess.toFixed(2)}/일</dd></div>
            <div><dt>배수로 효율</dt><dd>×{type.channel.toFixed(2)}</dd></div>
          </dl>
        </article>)}
      </div>
      <p>이미지는 입자와 뭉침 차이를 보여주는 예시이며 실제 흙의 색은 다를 수 있습니다. 각 수치는 해당 토양 100%일 때의 게임 기준입니다. 이 토지는 면적 비율대로 가중 평균하며, 건조 속도와 배수로 효율은 양토 ×1.00이 기준입니다.</p>
      <p>자연 배수는 수분 75 초과분에 작용하며 90부터 최대치입니다. 현재 완공 배수로 효율 ×{soil.channel.toFixed(2)} · 누적 뿌리 스트레스 {effects.state.load.toFixed(1)}/100.</p>
    </div>
      </div>
    </div>
  </section>;
}
