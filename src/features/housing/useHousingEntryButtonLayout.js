import { useCallback, useMemo, useRef } from 'react';
import {
  DEFAULT_HOUSING_ENTRY_BUTTON_POSITION,
  normalizeHousingEntryButtonPosition,
} from './housingUiSystem';
import { clamp } from '../../utils/common';

export default function useHousingEntryButtonLayout({
  authToken = '',
  dragEnabled = false,
  setDragEnabled,
  savedPosition = DEFAULT_HOUSING_ENTRY_BUTTON_POSITION,
  draftPosition = DEFAULT_HOUSING_ENTRY_BUTTON_POSITION,
  setDraftPosition,
  setSavedPosition,
} = {}) {
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPosition: DEFAULT_HOUSING_ENTRY_BUTTON_POSITION,
    moved: false,
  });
  const suppressClickRef = useRef(false);

  const positionDirty = useMemo(() => {
    const normalizedDraft = normalizeHousingEntryButtonPosition(draftPosition);
    const normalizedSaved = normalizeHousingEntryButtonPosition(savedPosition);
    return Math.abs(normalizedDraft.xPercent - normalizedSaved.xPercent) > 0.05
      || Math.abs(normalizedDraft.yPercent - normalizedSaved.yPercent) > 0.05;
  }, [draftPosition, savedPosition]);

  const toggleDragEnabled = useCallback(() => {
    if (typeof setDragEnabled === 'function') {
      setDragEnabled((prev) => !prev);
    }
  }, [setDragEnabled]);

  const saveLayout = useCallback(() => {
    const normalizedPosition = normalizeHousingEntryButtonPosition(draftPosition);
    if (typeof setSavedPosition === 'function') setSavedPosition(normalizedPosition);
    if (typeof setDraftPosition === 'function') setDraftPosition(normalizedPosition);
    if (!authToken) {
      window.alert('로그인된 계정이 없어 현재 접속에서만 반영됩니다. 계정 공통으로 쓰려면 로그인 상태에서 고정해 주세요.');
      return;
    }
    void fetch('/__auth/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        token: authToken,
        preferences: {
          housingEntryButtonPosition: normalizedPosition,
          housingEntryButtonDragEnabled: dragEnabled
        }
      })
    }).catch((error) => {
      console.error('housing_entry_button_layout_preference_save_failed', error);
      window.alert('하우징 버튼 위치를 계정 설정에 저장하지 못했습니다. 다시 시도해 주세요.');
    });
  }, [authToken, draftPosition, dragEnabled, setDraftPosition, setSavedPosition]);

  const startDrag = useCallback((event) => {
    if (!dragEnabled) return;
    const buttonEl = event.currentTarget;
    const mediaEl = buttonEl?.parentElement;
    if (!mediaEl) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      buttonEl.setPointerCapture(event.pointerId);
    } catch {}
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: normalizeHousingEntryButtonPosition(draftPosition),
      moved: false,
    };
    suppressClickRef.current = false;
  }, [dragEnabled, draftPosition]);

  const moveDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const buttonEl = event.currentTarget;
    const mediaEl = buttonEl?.parentElement;
    if (!mediaEl) return;
    const rect = mediaEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    event.preventDefault();
    event.stopPropagation();
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true;
      suppressClickRef.current = true;
    }
    if (typeof setDraftPosition === 'function') {
      setDraftPosition({
        xPercent: clamp(drag.startPosition.xPercent + ((deltaX / rect.width) * 100), 10, 90),
        yPercent: clamp(drag.startPosition.yPercent + ((deltaY / rect.height) * 100), 12, 92),
      });
    }
  }, [setDraftPosition]);

  const finishDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    dragRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startPosition: DEFAULT_HOUSING_ENTRY_BUTTON_POSITION,
      moved: false,
    };
  }, []);

  return {
    positionDirty,
    suppressClickRef,
    toggleDragEnabled,
    saveLayout,
    startDrag,
    moveDrag,
    finishDrag,
  };
}
