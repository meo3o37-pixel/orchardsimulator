import React, { useEffect, useRef, useState } from 'react';

const ENDPOINT = '/__company-founding-room/attachments';
const ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.hwpx,.zip';
const sizeLabel = (size) => size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;

export function useRoomAttachments(session) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const filesRef = useRef([]);
  const replace = (next) => { filesRef.current = next; setFiles(next); };
  useEffect(() => () => filesRef.current.forEach((item) => item.preview && URL.revokeObjectURL(item.preview)), []);
  useEffect(() => {
    if (!files.length) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [files.length]);
  const add = (selected) => {
    const incoming = Array.from(selected || []);
    if (incoming.length + filesRef.current.length > 5) { setError('첨부파일은 최대 5개까지 선택해주세요.'); return; }
    if (incoming.some((file) => !file.size || file.size > 10 * 1024 * 1024)) { setError('빈 파일은 제외하고 파일 하나당 10MB 이하로 선택해주세요.'); return; }
    if (incoming.some((file) => !ACCEPT.split(',').some((ext) => file.name.toLowerCase().endsWith(ext)))) { setError('사진·PDF·한글·오피스·텍스트·ZIP 파일을 선택해주세요.'); return; }
    replace([...filesRef.current, ...incoming.map((file, index) => ({ key: `${Date.now()}-${Math.random()}-${index}`, file, preview: /^image\/(png|jpeg|gif|webp)$/.test(file.type) ? URL.createObjectURL(file) : '' }))]);
    setError('');
  };
  const remove = (key) => {
    const item = filesRef.current.find((file) => file.key === key);
    if (item?.preview) URL.revokeObjectURL(item.preview);
    replace(filesRef.current.filter((file) => file.key !== key));
  };
  const clear = () => { filesRef.current.forEach((item) => item.preview && URL.revokeObjectURL(item.preview)); replace([]); setError(''); };
  const upload = async () => {
    const ids = [];
    for (const item of filesRef.current) {
      if (!item.uploadedId) {
        const response = await fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${session?.token || ''}`, 'X-File-Name': encodeURIComponent(item.file.name), 'Content-Type': 'application/octet-stream' }, body: item.file });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.detail || '파일 업로드에 실패했습니다. 다시 시도해주세요.');
        item.uploadedId = payload.attachment.id;
      }
      ids.push(item.uploadedId);
    }
    return ids;
  };
  const onPaste = (event) => {
    const pasted = Array.from(event.clipboardData?.files || []);
    if (!pasted.length) return;
    event.preventDefault(); add(pasted);
  };
  return { files, error, add, remove, clear, upload, onPaste };
}

export function AttachmentPicker({ draft, disabled }) {
  const photos = useRef(null);
  const documents = useRef(null);
  const select = (event) => { draft.add(event.target.files); event.target.value = ''; };
  return <section className="room-attachments" aria-label="첨부파일 선택">
    <div className="room-attachments__tools">
      <button type="button" disabled={disabled} onClick={() => photos.current.click()}>사진 추가</button>
      <button type="button" disabled={disabled} onClick={() => documents.current.click()}>파일 추가</button>
      <small>캡처 Ctrl+V · 최대 5개 · 개당 10MB</small>
      <input ref={photos} type="file" accept=".png,.jpg,.jpeg,.gif,.webp" multiple hidden disabled={disabled} onChange={select} aria-label="사진 선택" />
      <input ref={documents} type="file" accept={ACCEPT} multiple hidden disabled={disabled} onChange={select} aria-label="파일 선택" />
    </div>
    {draft.error ? <small role="alert" className="room-attachments__error">{draft.error}</small> : null}
    <div className="room-attachments__grid">{draft.files.map((item) => <div className="room-attachments__item" key={item.key}>
      {item.preview ? <img src={item.preview} alt={`${item.file.name} 미리보기`} /> : null}
      <strong>{item.file.name}</strong><small>{sizeLabel(item.file.size)}</small>
      <button type="button" disabled={disabled} onClick={() => draft.remove(item.key)} aria-label={`${item.file.name} 첨부 취소`}>첨부 취소</button>
    </div>)}</div>
  </section>;
}

function Attachment({ file, session }) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const readBlob = async (signal) => {
    const response = await fetch(`${ENDPOINT}/${file.id}`, { headers: { Authorization: `Bearer ${session?.token || ''}` }, signal });
    if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.detail || '파일을 불러오지 못했습니다.'); }
    return response.blob();
  };
  useEffect(() => {
    setPreview(''); setError('');
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) return;
    let url;
    const controller = new AbortController();
    readBlob(controller.signal).then((blob) => { if (!controller.signal.aborted) { url = URL.createObjectURL(blob); setPreview(url); } }).catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [file.id, file.type, session?.token]);
  const download = async () => {
    setLoading(true); setError('');
    try {
      const url = URL.createObjectURL(await readBlob());
      const link = document.createElement('a'); link.href = url; link.download = file.name;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return <div className="room-attachments__item">
    {preview ? <img src={preview} alt={file.name} /> : null}
    <strong>{file.name}</strong><small>{sizeLabel(file.size)}</small>
    <button type="button" disabled={loading} onClick={download}>{loading ? '불러오는 중…' : '내려받기'}</button>
    {error ? <small role="alert" className="room-attachments__error">{error}</small> : null}
  </div>;
}

export function AttachmentList({ files, session }) {
  if (!files?.length) return null;
  return <section className="room-attachments room-attachments__grid" aria-label="등록된 첨부파일">{files.map((file) => <Attachment key={file.id} file={file} session={session} />)}</section>;
}
