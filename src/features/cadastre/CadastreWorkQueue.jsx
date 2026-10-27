import React, { useState } from 'react';
import { HardHat, Sprout, GitBranch, CheckCircle2, ArrowUpRight } from 'lucide-react';
import './CadastreWorkQueue.css';

const number = (n, unit) => `${Number(n||0).toLocaleString('ko-KR',{maximumFractionDigits:unit==='주'?0:1})}${unit}`;
export default function CadastreWorkQueue({ jobs, panel, machines=[], bindings=[], getQuote, onExecute, onDesign }) {
 const visible=jobs.filter(j=>j.panel===panel),pending=visible.filter(j=>j.done+.001<j.total),completed=visible.filter(j=>j.done+.001>=j.total);
 if(!visible.length)return null;
 return <section className="cadastre-work-queue" aria-label="지적도 확정 작업">
  <header><div><h4>지적도 확정 계획</h4><span>대기·진행 {pending.length}건 · 완료 {completed.length}건</span></div><button type="button" onClick={onDesign}>설계 보기 <ArrowUpRight size={15}/></button></header>
  {pending.map(job=><JobCard key={job.id} job={job} machines={machines} bindings={bindings} getQuote={getQuote} onExecute={onExecute}/>)}
  {completed.length>0&&<details className="cadastre-work-queue__completed"><summary>완료한 계획 {completed.length}건</summary>{completed.map(job=><div key={job.id}><CheckCircle2 size={17}/><strong>{job.label}</strong><span>{number(job.total,job.unit)} 완료</span></div>)}</details>}
 </section>;
}
function JobCard({job,machines,bindings,getQuote,onExecute}) {
 const [mode,setMode]=useState(job.kind==='infrastructure'?'manual':job.kind==='plant'?'shovel':'contractor'),[machineId,setMachineId]=useState(''),[bindingKey,setBindingKey]=useState(bindings[0]?.key||''),[quantity,setQuantity]=useState(''),[notice,setNotice]=useState('');
 const options={mode,machineId,bindingKey,quantity,expectedDone:job.done},quote=getQuote(job.id,options);
 const progress=Math.min(100,job.done/job.total*100);
 const execute=()=>{
  if(!quote.ok)return;
  if(!window.confirm(`${job.label}\n이번 작업 ${number(quote.amount,quote.unit)}\n작업비 ${number(quote.cost,'원')} · 노동력 ${(quote.labor||0).toFixed(1)} · 연료 ${(quote.fuel||0).toFixed(2)}L\n실행할까요?`))return;
  const result=onExecute(job.id,options);setNotice(result?.message||'작업 결과를 확인해 주세요.');
 };
 return <article className="cadastre-work-card" aria-label={job.label}>
  <div className="cadastre-work-card__heading"><span className="cadastre-work-card__icon">{job.kind==='plant'?<Sprout size={20}/>:job.kind.startsWith('pipes')?<GitBranch size={20}/>:<HardHat size={20}/>}</span><div><h5>{job.label}</h5><span>{job.kind==='plant'?`${job.plan.planting.rootstock} · 3~4월 식재`:job.kind==='pipes'?'실제 나무 열 아래 · 유공관 매설':'설계 확정 · 설치작업'}</span></div><b>{job.done>0?'진행 중':'작업 대기'}</b></div>
  <div className="cadastre-work-card__progress-label"><span>완료 {number(job.done,job.unit)} / {number(job.total,job.unit)}</span><strong>{progress.toFixed(0)}%</strong></div>
  <progress value={job.done} max={job.total} aria-label={`${job.label} 진행률`}/>
  <div className="cadastre-work-card__controls">
   <label>작업 방식<select value={mode} onChange={e=>setMode(e.target.value)}>{job.kind==='infrastructure'&&<option value="manual">내 노동력 · 보유 자재</option>}{job.kind==='plant'&&<option value="shovel">내 노동력 · 삽</option>}<option value="contractor">전문 외주{['drainage','pipes'].includes(job.kind)?' · 하루 200m':job.kind==='plant'?' · 하루 200주':''}</option>{job.kind!=='infrastructure'&&<option value="excavator">내 굴삭기</option>}</select></label>
   {mode==='excavator'&&<label>굴삭기<select value={machineId} onChange={e=>setMachineId(e.target.value)}><option value="">장비 선택</option>{machines.map(m=><option key={m.id} value={m.id}>{m.name} · {m.fuel.toFixed(1)}L</option>)}</select></label>}
   {job.kind==='plant'&&<><label>결속재<select value={bindingKey} onChange={e=>setBindingKey(e.target.value)}>{bindings.map(b=><option key={b.key} value={b.key}>{b.name} · {b.stock}개</option>)}</select></label><label>이번 식재 수량<input type="number" min="1" max={Math.max(1,job.total-job.done)} placeholder="가능한 만큼" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label></>}
  </div>
  {quote.ok?<><div className="cadastre-work-card__quote"><strong>이번 작업 {number(quote.amount,quote.unit)}</strong><span>{number(quote.cost,'원')} · 노동력 {(quote.labor||0).toFixed(1)} · {(quote.fuel||0).toFixed(2)}L</span></div>{job.kind==='plant'&&<p className="cadastre-work-card__materials">묘목 재고 {quote.stock}주 · 결속재 {quote.bindingStock}개 · 이번 사용 각 {quote.amount}개</p>}{quote.remainingCost>0&&<p className="cadastre-work-card__materials">남은 전체 작업비 약 {number(quote.remainingCost,'원')} · 자재 보유분 별도</p>}</>:<p className="cadastre-work-card__blocked" role="status">{quote.message}</p>}
  <div className="cadastre-work-card__actions"><span>남은 작업 {number(job.total-job.done,job.unit)}</span><button type="button" disabled={!quote.ok} onClick={execute}>{job.kind==='infrastructure'?'공정 진행':job.kind==='plant'?'계획대로 식재':job.kind==='pipes'?'매설 진행':job.kind.endsWith('Clean')?'세척 진행':'시공 진행'}</button></div>
  {quote.ok&&quote.pipeMaterials?.rows.some(r=>r.used>0)&&<p className="cadastre-work-card__materials">보유 관 {quote.pipeMaterials.rows.reduce((s,r)=>s+r.used,0).toFixed(1)}m 사용 · 자재비 {number(quote.pipeMaterials.credit,'원')} 차감 · 남은 관 보관</p>}
  {notice&&<p className="cadastre-work-card__notice" role="status">{notice}</p>}
 </article>;
}
