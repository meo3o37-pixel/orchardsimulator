import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function MobileMenuDrawer({ open, onClose, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    panel?.querySelector('button')?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter((item) => item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown, true);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(<>
    <div className="mobile-menu-drawer-backdrop" onClick={onClose} aria-hidden="true" />
    <aside id="mobile-main-menu-drawer" className="hero-mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="모바일 메뉴" tabIndex={-1} ref={panelRef}>
      <header className="hero-mobile-menu-drawer__header"><strong>메뉴 · 로그인 및 바로가기</strong><button type="button" onClick={onClose} aria-label="메뉴 닫기">✕</button></header>
      <div className="hero-mobile-menu-drawer__body" onClick={(event) => {
        if (event.target.closest('a, button') && !event.target.closest('.hero-presence-card__header')) onClose();
      }}>{children}</div>
    </aside>
  </>, document.body);
}
