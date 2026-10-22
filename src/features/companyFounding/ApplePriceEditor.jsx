import React, { useEffect, useState } from 'react';
import { validateApplePriceTabs } from './applePriceData.mjs';

const newKey = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
const move = (items, index, delta) => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export default function ApplePriceEditor({ session, canEdit, onDirtyChange }) {
  const [draft, setDraft] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');
  const [revision, setRevision] = useState(0);
  const [savedAt, setSavedAt] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    const handler = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const load = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/__apple-price-board', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || '가격표를 불러오지 못했습니다.');
      setDraft(result.tabs);
      setSelectedKey((current) => result.tabs.some((tab) => tab.key === current) ? current : result.tabs[0].key);
      setRevision(result.revision);
      setSavedAt(result.updatedAt || '');
      setDirty(false);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);

  const change = (update) => {
    if (!canEdit || busy) return;
    setDraft((current) => update(current));
    setDirty(true);
    setMessage('');
  };
  const tab = draft?.find((entry) => entry.key === selectedKey) || draft?.[0];
  const updateTab = (patch) => change((tabs) => tabs.map((entry) => entry.key === tab.key ? { ...entry, ...patch } : entry));
  const updateSection = (key, update) => updateTab({ sections: tab.sections.map((section) => section.key === key ? update(section) : section) });
  const field = (name, label, maxLength = 200) => (
    <label key={name}><span>{label}</span><input className="text-input" value={tab[name] || ''} maxLength={maxLength} onChange={(event) => updateTab({ [name]: event.target.value })} /></label>
  );
  const save = async () => {
    let tabs;
    try { tabs = validateApplePriceTabs(draft); }
    catch (error) { setMessage(error.message); return; }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/__apple-price-board', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ tabs, revision })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || '가격표를 저장하지 못했습니다.');
      setDraft(result.tabs);
      setRevision(result.revision);
      setSavedAt(result.updatedAt);
      setDirty(false);
      setMessage('저장했습니다. 공개 사과 가격표에 반영됐습니다.');
      window.dispatchEvent(new Event('apple-price-board-saved'));
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  const reload = () => {
    if (dirty && !window.confirm('저장하지 않은 변경을 버리고 최신 가격표를 불러올까요?')) return;
    void load();
  };
  const addTab = () => {
    const key = newKey('apple');
    change((tabs) => [...tabs, {
      key, label: '새 품종', title: '', year: String(new Date().getFullYear()), farmName: '바람한조각', address: '', summary: '', footnote: '',
      sections: [{ key: newKey('section'), title: '상품', columns: ['품목·규격', '갯수', '가격'], rows: [] }]
    }]);
    setSelectedKey(key);
  };
  const removeTab = () => {
    if (draft.length <= 1 || !window.confirm(`“${tab.label}” 품종과 모든 품목을 삭제할까요? 저장하면 공개 가격표에서도 삭제됩니다.`)) return;
    change((tabs) => tabs.filter((entry) => entry.key !== tab.key));
    setSelectedKey(draft.find((entry) => entry.key !== tab.key).key);
  };

  return (
    <section className="apple-price-editor">
      <div className="company-founding-room__section-head">
        <div><strong>바람한조각 사과 가격표 조정</strong><span>{canEdit ? '가격·품목을 편집한 뒤 공개 가격표에 저장하세요.' : '가격표 조회 전용입니다. 방장이 수정하고 저장할 수 있습니다.'}</span></div>
      </div>
      <div className="apple-price-editor__toolbar">
        <span>{dirty ? '저장하지 않은 변경 있음' : savedAt ? `최근 저장 ${new Date(savedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` : '기존 가격표'}</span>
        <button type="button" className="button button--ghost button--compact" disabled={busy} onClick={reload}>다시 불러오기</button>
        <button type="button" className="button button--ghost button--compact" onClick={() => setPreview(!preview)}>{preview ? '편집 화면' : '미리보기'}</button>
        {canEdit ? <button type="button" className="button button--primary button--compact" disabled={busy || !dirty} onClick={save}>{busy ? '처리 중…' : '공개 가격표에 저장'}</button> : null}
      </div>
      {message ? <p className="apple-price-editor__message" role="status">{message}</p> : null}
      {!draft ? <p>{busy ? '가격표를 불러오는 중입니다.' : '다시 불러오기를 눌러주세요.'}</p> : (
        <>
          <div className="apple-price-editor__varieties">
            {draft.map((entry) => <button type="button" key={entry.key} className={`button button--compact ${entry.key === tab.key ? 'button--primary' : 'button--ghost'}`} onClick={() => setSelectedKey(entry.key)}>{entry.label || '이름 없는 품종'}</button>)}
            {canEdit ? <button type="button" className="button button--ghost button--compact" disabled={busy || draft.length >= 20} onClick={addTab}>+ 품종 추가</button> : null}
          </div>
          {preview ? (
            <div className="apple-price-editor__preview">
              <small>{tab.farmName} · {tab.year}</small><h3>{tab.title || `사과 가격표 (${tab.label})`}</h3><p>{tab.summary}</p>
              {tab.sections.map((section) => <section key={section.key}><h4>{section.title}</h4><div className="apple-price-editor__table-wrap"><table><thead><tr>{section.columns.map((column, i) => <th key={i}>{column}</th>)}</tr></thead><tbody>{section.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell || '—'}</td>)}</tr>)}</tbody></table></div></section>)}
              <p className="apple-price-editor__footnote">{tab.footnote}</p>
            </div>
          ) : (
            <fieldset disabled={!canEdit || busy} className="apple-price-editor__fields">
              <legend className="apple-price-editor__legend">품종·품목 편집</legend>
              <div className="apple-price-editor__metadata">
                {field('label', '품종명', 60)}{field('year', '연도', 20)}{field('title', '가격표 제목 (빈칸이면 품종명으로 자동 표시)', 150)}{field('farmName', '농원·회사명', 150)}{field('address', '주소')}{field('summary', '가격표 요약', 300)}
              </div>
              <label><span>하단 안내문 · 배송비 · 가격 기준</span><textarea value={tab.footnote} maxLength={2000} onChange={(event) => updateTab({ footnote: event.target.value })} /></label>
              <div className="apple-price-editor__actions">
                <button type="button" className="button button--ghost button--compact" disabled={draft.indexOf(tab) === 0} onClick={() => change((tabs) => move(tabs, tabs.indexOf(tab), -1))}>품종 앞으로</button>
                <button type="button" className="button button--ghost button--compact" disabled={draft.indexOf(tab) === draft.length - 1} onClick={() => change((tabs) => move(tabs, tabs.indexOf(tab), 1))}>품종 뒤로</button>
                <button type="button" className="button button--ghost button--compact" disabled={draft.length <= 1} onClick={removeTab}>이 품종 삭제</button>
              </div>
              <p className="apple-price-editor__help">마지막 열은 가격입니다. 예: 65,000 / 126,000, 가격 미정·판매 중지는 - 를 입력하세요. 행·열 추가와 삭제는 저장 전까지 공개 가격표에 반영되지 않습니다.</p>
              {tab.sections.map((section, index) => (
                <section className="apple-price-editor__section" key={section.key}>
                  <div className="apple-price-editor__section-head">
                    <label><span>상품 분류명</span><input className="text-input" value={section.title} maxLength={100} onChange={(event) => updateSection(section.key, (value) => ({ ...value, title: event.target.value }))} /></label>
                    <div className="apple-price-editor__actions">
                      <button type="button" className="button button--ghost button--compact" disabled={index === 0} onClick={() => updateTab({ sections: move(tab.sections, index, -1) })}>위로</button>
                      <button type="button" className="button button--ghost button--compact" disabled={index === tab.sections.length - 1} onClick={() => updateTab({ sections: move(tab.sections, index, 1) })}>아래로</button>
                      <button type="button" className="button button--ghost button--compact" disabled={tab.sections.length <= 1} onClick={() => { if (window.confirm(`“${section.title}” 분류와 품목을 모두 삭제할까요?`)) updateTab({ sections: tab.sections.filter((value) => value.key !== section.key) }); }}>분류 삭제</button>
                    </div>
                  </div>
                  <div className="apple-price-editor__table-wrap"><table><thead><tr>
                    {section.columns.map((column, columnIndex) => <th key={columnIndex}>
                      <input aria-label={`${section.title} ${columnIndex + 1}번째 열 제목`} value={column} maxLength={40} onChange={(event) => updateSection(section.key, (value) => ({ ...value, columns: value.columns.map((cell, i) => i === columnIndex ? event.target.value : cell) }))} />
                      {columnIndex === section.columns.length - 1 ? <small>가격 열</small> : <button type="button" disabled={section.columns.length <= 2} onClick={() => { if (window.confirm(`“${column}” 열과 해당 내용을 삭제할까요?`)) updateSection(section.key, (value) => ({ ...value, columns: value.columns.filter((_, i) => i !== columnIndex), rows: value.rows.map((row) => row.filter((_, i) => i !== columnIndex)) })); }} aria-label={`${column} 열 삭제`}>열 삭제</button>}
                    </th>)}<th>품목 관리</th>
                  </tr></thead><tbody>
                    {section.rows.map((row, rowIndex) => <tr key={rowIndex}>
                      {row.map((cell, columnIndex) => <td key={columnIndex}><input aria-label={`${section.title} ${rowIndex + 1}행 ${section.columns[columnIndex]}`} value={cell} maxLength={150} onChange={(event) => updateSection(section.key, (value) => ({ ...value, rows: value.rows.map((r, ri) => ri === rowIndex ? r.map((c, ci) => ci === columnIndex ? event.target.value : c) : r) }))} /></td>)}
                      <td><div className="apple-price-editor__row-actions">
                        <button type="button" disabled={rowIndex === 0} aria-label={`${rowIndex + 1}행 위로`} onClick={() => updateSection(section.key, (value) => ({ ...value, rows: move(value.rows, rowIndex, -1) }))}>↑</button>
                        <button type="button" disabled={rowIndex === section.rows.length - 1} aria-label={`${rowIndex + 1}행 아래로`} onClick={() => updateSection(section.key, (value) => ({ ...value, rows: move(value.rows, rowIndex, 1) }))}>↓</button>
                        <button type="button" disabled={section.rows.length >= 200} onClick={() => updateSection(section.key, (value) => ({ ...value, rows: [...value.rows.slice(0, rowIndex + 1), [...row], ...value.rows.slice(rowIndex + 1)] }))}>복제</button>
                        <button type="button" onClick={() => { if (window.confirm(`“${row[0] || '빈 품목'}” 행을 삭제할까요?`)) updateSection(section.key, (value) => ({ ...value, rows: value.rows.filter((_, i) => i !== rowIndex) })); }}>삭제</button>
                      </div></td>
                    </tr>)}
                  </tbody></table></div>
                  <div className="apple-price-editor__actions">
                    <button type="button" className="button button--ghost button--compact" disabled={section.rows.length >= 200} onClick={() => updateSection(section.key, (value) => ({ ...value, rows: [...value.rows, value.columns.map(() => '')] }))}>+ 품목 추가</button>
                    <button type="button" className="button button--ghost button--compact" disabled={section.columns.length >= 8} onClick={() => updateSection(section.key, (value) => ({ ...value, columns: [...value.columns.slice(0, -1), '새 항목', value.columns.at(-1)], rows: value.rows.map((row) => [...row.slice(0, -1), '', row.at(-1)]) }))}>+ 가격 앞에 열 추가</button>
                  </div>
                </section>
              ))}
              <button type="button" className="button button--ghost" disabled={tab.sections.length >= 20} onClick={() => updateTab({ sections: [...tab.sections, { key: newKey('section'), title: '새 상품 분류', columns: ['품목·규격', '갯수', '가격'], rows: [] }] })}>+ 상품 분류 추가</button>
            </fieldset>
          )}
        </>
      )}
    </section>
  );
}
