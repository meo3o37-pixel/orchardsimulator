import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApplePriceEditor from './ApplePriceEditor';
import CompanyIntroduction from './CompanyIntroduction';

const ENDPOINT = '/__company-founding-room';
const TABS = [
  { key: 'documents', label: '설립준비 서류', empty: '아직 등록된 준비 서류가 없습니다. 서류명과 담당자·제출처·준비 내용을 기록해주세요.' },
  { key: 'discussion', label: '논의 사항', empty: '아직 등록된 논의 사항이 없습니다.' },
  { key: 'decision', label: '결정사항', empty: '아직 확정된 결정사항이 없습니다.' },
  { key: 'task', label: '할 일', empty: '아직 등록된 할 일이 없습니다.' }
];
const TASK_STATUS = {
  todo: { label: '예정', next: 'doing' },
  doing: { label: '진행 중', next: 'done' },
  done: { label: '완료', next: 'todo' }
};
const DOCUMENT_STATUS = {
  todo: { label: '미준비', next: 'doing' },
  doing: { label: '준비 중', next: 'done' },
  done: { label: '준비 완료', next: 'todo' }
};

const responseMessage = (payload, fallback) => {
  if (payload?.error === 'account_not_found') return '해당 아이디의 가입 계정을 찾지 못했습니다.';
  if (payload?.error === 'invalid_session') return '로그인 정보가 만료되었습니다. 다시 로그인해주세요.';
  if (payload?.detail === 'approved_members_only') return '승인된 멤버만 입장할 수 있습니다.';
  if (payload?.detail === 'owner_only') return '방장만 변경할 수 있습니다.';
  if (payload?.detail === 'entry_owner_only') return '작성자와 방장만 변경할 수 있습니다.';
  if (payload?.error === 'invalid_comment') return '댓글 내용과 답글 대상을 확인해주세요.';
  if (payload?.error === 'entry_not_found') return '삭제된 글입니다. 목록을 새로고침해주세요.';
  if (payload?.error === 'invalid_transition') return '이미 이동했거나 결정사항으로 옮길 수 없는 항목입니다. 목록을 새로고침해주세요.';
  return String(payload?.detail || fallback);
};

const formatRoomTime = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function RoomEntry({ entry, room, busy, mutate, onDelete, onStatus, onPromote }) {
  const statusLabels = entry.category === 'documents' ? DOCUMENT_STATUS : TASK_STATUS;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.body);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const canEdit = room.canManageMembers || String(entry.author).toLowerCase() === String(room.currentUsername).toLowerCase();
  const comments = entry.comments || [];
  const saveEdit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    if (await mutate('/entry', { action: 'edit', entryId: entry.id, title, body }, '글을 수정했습니다.')) setEditing(false);
  };
  const submitComment = async (event) => {
    event.preventDefault();
    if (!commentDraft.trim()) return;
    if (await mutate('/entry', { action: 'comment', entryId: entry.id, parentId: replyTo?.id || '', body: commentDraft }, '댓글을 등록했습니다.')) {
      setCommentDraft('');
      setReplyTo(null);
    }
  };
  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`company-founding-room__comment${isReply ? ' is-reply' : ''}`}>
      <div className="company-founding-room__comment-meta"><strong>{comment.author}</strong><time>{formatRoomTime(comment.createdAt)}</time>
        {!isReply ? <button type="button" disabled={busy} onClick={() => setReplyTo(comment)}>답글</button> : null}
      </div>
      <p>{comment.body}</p>
    </div>
  );
  return (
    <article className={`company-founding-room__entry${entry.pinned ? ' is-pinned' : ''}`}>
      <div className="company-founding-room__entry-head">
        <div>
          {entry.pinned ? <span className="company-founding-room__pin-label">중요 안건</span> : null}
          {['task', 'documents'].includes(entry.category) ? <button type="button" className={`company-founding-room__status is-${entry.status}`} onClick={() => onStatus(entry)} disabled={busy} aria-label={`${entry.title} 상태: ${statusLabels[entry.status]?.label || statusLabels.todo.label}`}>{statusLabels[entry.status]?.label || statusLabels.todo.label}</button> : null}
          <strong>{entry.title}</strong>
        </div>
        <div className="company-founding-room__entry-actions">
          {room.canManageMembers && ['discussion', 'revenue'].includes(entry.category) ? <button type="button" disabled={busy || editing || Boolean(commentDraft.trim())} title={commentDraft.trim() ? '작성 중인 댓글을 등록하거나 비운 뒤 이동해주세요.' : '본문과 댓글을 유지하며 결정사항으로 이동합니다.'} onClick={() => onPromote(entry)}>결정사항으로 이동</button> : null}
          {room.canManageMembers ? <button type="button" disabled={busy} onClick={() => mutate('/entry', { action: 'pin', entryId: entry.id, pinned: !entry.pinned }, entry.pinned ? '고정을 해제했습니다.' : '중요 안건으로 고정했습니다.')}>{entry.pinned ? '고정 해제' : '상단 고정'}</button> : null}
          {canEdit ? <><button type="button" disabled={busy || editing} onClick={() => { setTitle(entry.title); setBody(entry.body); setEditing(true); }}>수정</button><button type="button" className="company-founding-room__delete" disabled={busy} onClick={() => onDelete(entry)}>삭제</button></> : null}
        </div>
      </div>
      {editing ? (
        <form className="company-founding-room__edit-form" onSubmit={saveEdit}>
          <input className="text-input" aria-label="글 제목 수정" value={title} maxLength={100} required onChange={(event) => setTitle(event.target.value)} disabled={busy} />
          <textarea aria-label="글 내용 수정" value={body} maxLength={3000} onChange={(event) => setBody(event.target.value)} disabled={busy} />
          <div className="company-founding-room__form-actions"><button type="button" className="button button--ghost button--compact" disabled={busy} onClick={() => setEditing(false)}>취소</button><button type="submit" className="button button--primary button--compact" disabled={busy || !title.trim()}>저장</button></div>
        </form>
      ) : entry.body ? <p>{entry.body}</p> : null}
      <footer><span>{entry.author}</span><time>{formatRoomTime(entry.updatedAt || entry.createdAt)}</time>{entry.editedAt ? <span>수정됨</span> : null}</footer>
      {entry.decidedAt ? <footer><span>결정사항 전환: {entry.decidedBy}</span><time>{formatRoomTime(entry.decidedAt)}</time></footer> : null}
      <section className="company-founding-room__comments" aria-label={`${entry.title} 댓글`}>
        <strong className="company-founding-room__comments-title">댓글 {comments.length}</strong>
        {comments.filter((comment) => !comment.parentId).map((comment) => (
          <React.Fragment key={comment.id}>{renderComment(comment)}{comments.filter((reply) => reply.parentId === comment.id).map((reply) => renderComment(reply, true))}</React.Fragment>
        ))}
        <form className="company-founding-room__comment-form" onSubmit={submitComment}>
          {replyTo ? <div className="company-founding-room__reply-target"><span>{replyTo.author}님에게 답글</span><button type="button" disabled={busy} onClick={() => setReplyTo(null)}>취소</button></div> : null}
          <textarea aria-label={replyTo ? '답글 내용' : '댓글 내용'} placeholder={replyTo ? '답글을 입력해주세요.' : '의견을 댓글로 남겨주세요.'} value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={1500} disabled={busy} />
          <div className="company-founding-room__form-actions"><button type="submit" className="button button--primary button--compact" disabled={busy || !commentDraft.trim()}>{replyTo ? '답글 등록' : '댓글 등록'}</button></div>
        </form>
      </section>
    </article>
  );
}

export default function CompanyFoundingRoom({ session, onClose, onLoginRequest }) {
  const [room, setRoom] = useState(null);
  const [accessState, setAccessState] = useState('loading');
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('introduction');
  const [titleDraft, setTitleDraft] = useState('');
  const [bodyDraft, setBodyDraft] = useState('');
  const [memberDraft, setMemberDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [priceDirty, setPriceDirty] = useState(false);
  const changeTab = (tab) => {
    if (tab !== activeTab && priceDirty && !window.confirm('가격표에 저장하지 않은 변경이 있습니다. 변경을 버리고 이동할까요?')) return;
    if (tab !== activeTab) setPriceDirty(false);
    setActiveTab(tab);
  };
  const closeRoom = () => {
    if (priceDirty && !window.confirm('가격표에 저장하지 않은 변경이 있습니다. 변경을 버리고 닫을까요?')) return;
    onClose();
  };
  const mutationRef = useRef(false);
  const requestVersionRef = useRef(0);

  const request = useCallback(async (path = '', options = {}) => {
    const response = await fetch(`${ENDPOINT}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(responseMessage(payload, '준비실 요청을 처리하지 못했습니다.'));
      error.status = response.status;
      throw error;
    }
    return payload;
  }, [session?.token]);

  const loadRoom = useCallback(async (silent = false) => {
    if (!session?.token) {
      setAccessState('login');
      return;
    }
    if (!silent) setAccessState('loading');
    const requestVersion = ++requestVersionRef.current;
    try {
      const payload = await request();
      if (mutationRef.current || requestVersion !== requestVersionRef.current) return;
      setRoom(payload.room || null);
      setAccessState('ready');
      if (!silent) setNotice('');
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      if (error.status === 401) setAccessState('login');
      else if (error.status === 403) setAccessState('denied');
      else setAccessState('error');
      setNotice(error.message);
    }
  }, [request, session?.token]);

  useEffect(() => {
    void loadRoom(false);
    const intervalId = window.setInterval(() => {
      if (!mutationRef.current) void loadRoom(true);
    }, 12000);
    return () => window.clearInterval(intervalId);
  }, [loadRoom]);

  const activeEntries = useMemo(() => (
    (room?.entries || [])
      .filter((entry) => entry.category === activeTab || (activeTab === 'discussion' && entry.category === 'revenue'))
      .slice()
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
  ), [activeTab, room?.entries]);

  const runMutation = async (path, payload, successMessage) => {
    if (mutationRef.current) return false;
    mutationRef.current = true;
    requestVersionRef.current += 1;
    setBusy(true);
    setNotice('');
    try {
      const result = await request(path, { method: 'POST', body: JSON.stringify(payload) });
      setRoom(result.room || null);
      setNotice(successMessage);
      return true;
    } catch (error) {
      setNotice(error.message);
      return false;
    } finally {
      mutationRef.current = false;
      setBusy(false);
    }
  };

  const submitEntry = async (event) => {
    event.preventDefault();
    const title = titleDraft.trim();
    if (!title) {
      setNotice('제목을 입력해주세요.');
      return;
    }
    const saved = await runMutation('/entry', {
      action: 'create',
      category: activeTab,
      title,
      body: bodyDraft.trim()
    }, '새 항목을 등록했습니다.');
    if (saved) {
      setTitleDraft('');
      setBodyDraft('');
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    const username = memberDraft.trim();
    if (!username) {
      setNotice('승인할 친구 아이디를 입력해주세요.');
      return;
    }
    const saved = await runMutation('/member', { action: 'add', username }, `${username} 계정의 입장을 승인했습니다.`);
    if (saved) setMemberDraft('');
  };

  const removeMember = async (username) => {
    if (!window.confirm(`${username} 계정의 준비실 입장 권한을 해제할까요?`)) return;
    await runMutation('/member', { action: 'remove', username }, `${username} 계정의 입장 권한을 해제했습니다.`);
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm(`“${entry.title}” 항목을 삭제할까요?`)) return;
    await runMutation('/entry', { action: 'delete', entryId: entry.id }, '항목을 삭제했습니다.');
  };

  const cycleTaskStatus = async (entry) => {
    const nextStatus = TASK_STATUS[entry.status]?.next || 'todo';
    await runMutation('/entry', { action: 'status', entryId: entry.id, status: nextStatus }, entry.category === 'documents' ? '서류 준비 상태를 변경했습니다.' : '할 일 상태를 변경했습니다.');
  };
  const promoteEntry = async (entry) => {
    if (!window.confirm(`“${entry.title}” 논의를 결정사항으로 옮길까요? 본문·댓글·작성자 정보는 유지되고 논의 목록에서는 빠집니다.`)) return;
    if (await runMutation('/entry', { action: 'promote', entryId: entry.id }, '결정사항으로 이동했습니다. 본문과 댓글은 그대로 유지됩니다.')) changeTab('decision');
  };

  const currentTab = TABS.find((tab) => tab.key === activeTab) || TABS[0];
  const stateCopy = accessState === 'login'
    ? { title: '로그인이 필요합니다', body: '로그인한 뒤 승인된 계정인지 확인합니다.' }
    : accessState === 'denied'
      ? { title: '입장 권한이 없습니다', body: '바람한조각에서 승인한 멤버 계정만 입장할 수 있습니다.' }
      : accessState === 'error'
        ? { title: '준비실을 불러오지 못했습니다', body: notice || '잠시 후 다시 시도해주세요.' }
        : null;

  return (
    <>
      <div className="confirm-modal-backdrop company-founding-room-backdrop" onClick={closeRoom} />
      <section className="confirm-modal company-founding-room" role="dialog" aria-modal="true" aria-label="바람한조각 법인설립 준비실">
        <header className="company-founding-room__header">
          <div>
            <div className="company-founding-room__eyebrow">승인된 멤버 전용 비공개 공간</div>
            <h2>바람한조각 법인설립 준비실</h2>
            <p>법인 설립, 사업 방향, 수익계획과 실행할 일을 함께 정리합니다.</p>
          </div>
          <button type="button" className="button button--ghost button--compact" onClick={closeRoom}>닫기</button>
        </header>

        {accessState === 'loading' ? (
          <div className="company-founding-room__state">입장 권한과 준비실 자료를 확인하고 있습니다.</div>
        ) : stateCopy ? (
          <div className="company-founding-room__state company-founding-room__state--blocked">
            <strong>{stateCopy.title}</strong>
            <span>{stateCopy.body}</span>
            {notice && accessState !== 'error' ? <small>{notice}</small> : null}
            <div className="company-founding-room__state-actions">
              {accessState === 'login' ? <button type="button" className="button button--primary" onClick={onLoginRequest}>로그인</button> : null}
              {accessState === 'error' ? <button type="button" className="button button--primary" onClick={() => loadRoom(false)}>다시 시도</button> : null}
              <button type="button" className="button button--ghost" onClick={onClose}>확인</button>
            </div>
          </div>
        ) : room ? (
          <div className="company-founding-room__workspace">
            <aside className="company-founding-room__sidebar">
              <div className="company-founding-room__account">
                <span>접속 계정</span>
                <strong>{room.currentUsername}</strong>
                <small>{room.canManageMembers ? '방장' : '승인 멤버'}</small>
              </div>
              <nav className="company-founding-room__tabs" aria-label="준비실 분류">
                <button type="button" className={activeTab === 'introduction' ? 'is-active' : ''} aria-current={activeTab === 'introduction' ? 'page' : undefined} onClick={() => changeTab('introduction')}><span>사업 소개</span><b aria-hidden="true">↗</b></button>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={activeTab === tab.key ? 'is-active' : ''}
                    onClick={() => changeTab(tab.key)}
                  >
                    <span>{tab.label}</span>
                    <b>{(room.entries || []).filter((entry) => entry.category === tab.key || (tab.key === 'discussion' && entry.category === 'revenue')).length}</b>
                  </button>
                ))}
                {room.canManageMembers ? (
                  <button
                    type="button"
                    className={activeTab === 'members' ? 'is-active' : ''}
                    onClick={() => changeTab('members')}
                  >
                    <span>멤버 관리</span>
                    <b>{room.members?.length || 0}</b>
                  </button>
                ) : null}
                <button type="button" className={activeTab === 'prices' ? 'is-active' : ''} onClick={() => changeTab('prices')}><span>사과 가격표 조정</span><b>₩</b></button>
              </nav>
            </aside>

            <main className="company-founding-room__main">
              {activeTab === 'introduction' ? <CompanyIntroduction onDiscuss={() => changeTab('discussion')} /> : activeTab === 'prices' ? <ApplePriceEditor session={session} canEdit={room.canManageMembers} onDirtyChange={setPriceDirty} /> : activeTab === 'members' && room.canManageMembers ? (
                <>
                  <div className="company-founding-room__section-head">
                    <div><strong>멤버 관리</strong><span>가입된 친구 아이디를 승인하거나 권한을 해제합니다.</span></div>
                  </div>
                  <form className="company-founding-room__member-form" onSubmit={addMember}>
                    <input className="text-input" value={memberDraft} onChange={(event) => setMemberDraft(event.target.value)} placeholder="승인할 친구 아이디" maxLength={24} />
                    <button className="button button--primary" type="submit" disabled={busy}>입장 승인</button>
                  </form>
                  <div className="company-founding-room__member-list">
                    {(room.members || []).map((member) => (
                      <div key={member.username} className="company-founding-room__member">
                        <div><strong>{member.username}</strong><span>{member.role === 'owner' ? '방장' : '승인 멤버'}</span></div>
                        {member.role !== 'owner' ? <button type="button" className="button button--ghost button--compact" disabled={busy} onClick={() => removeMember(member.username)}>권한 해제</button> : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="company-founding-room__section-head">
                    <div><strong>{currentTab.label}</strong><span>{currentTab.key === 'documents' ? '서류별 담당자·제출처·준비 내용을 정리하고 상태 버튼으로 진행 상황을 관리합니다.' : '멤버들과 의견과 진행 상황을 공유합니다.'}</span></div>
                    <button type="button" className="button button--ghost button--compact" onClick={() => loadRoom(false)} disabled={busy}>새로고침</button>
                  </div>
                  <form className="company-founding-room__composer" onSubmit={submitEntry}>
                    <input className="text-input" value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} placeholder={currentTab.key === 'documents' ? '준비할 서류명' : `${currentTab.label} 제목`} maxLength={100} />
                    <textarea value={bodyDraft} onChange={(event) => setBodyDraft(event.target.value)} placeholder={currentTab.key === 'documents' ? '담당자, 제출처, 준비 기한과 확인할 내용을 적어주세요. 주민등록번호·인감·계좌정보 등 민감정보는 입력하지 마세요.' : '구체적인 내용이나 의견을 적어주세요.'} maxLength={3000} />
                    <div><span>{bodyDraft.length.toLocaleString()} / 3,000</span><button className="button button--primary" type="submit" disabled={busy}>등록</button></div>
                  </form>
                  <div className="company-founding-room__entry-list">
                    {activeEntries.length ? activeEntries.map((entry) => (
                      <RoomEntry key={entry.id} entry={entry} room={room} busy={busy} mutate={runMutation} onDelete={deleteEntry} onStatus={cycleTaskStatus} onPromote={promoteEntry} />
                    )) : <div className="company-founding-room__empty">{currentTab.empty}</div>}
                  </div>
                </>
              )}
              {notice ? <div className="company-founding-room__notice">{notice}</div> : null}
            </main>
          </div>
        ) : null}
      </section>
    </>
  );
}
