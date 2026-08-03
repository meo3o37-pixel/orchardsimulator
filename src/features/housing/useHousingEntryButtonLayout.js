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
  normalizePosition = normalizeHousingEntryButtonPosition,
  positionPreferenceKey = 'housingEntryButtonPosition',
  dragEnabledPreferenceKey = 'housingEntryButtonDragEnabled',
  defaultPositionSaveEndpoint = '',
  localStorageKey = '',
  alertLabel = '하우징 버튼 위치',
  logLabel = 'housing_button_layout',
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
    const normalizedDraft = normalizePosition(draftPosition);
    const normalizedSaved = normalizePosition(savedPosition);
    return Math.abs(normalizedDraft.xPercent - normalizedSaved.xPercent) > 0.05
      || Math.abs(normalizedDraft.yPercent - normalizedSaved.yPercent) > 0.05;
  }, [draftPosition, normalizePosition, savedPosition]);

  const toggleDragEnabled = useCallback(() => {
    if (typeof setDragEnabled === 'function') {
      setDragEnabled((prev) => !prev);
    }
  }, [setDragEnabled]);

  const saveLayout = useCallback(() => {
    const normalizedPosition = normalizePosition(draftPosition);
    if (typeof setSavedPosition === 'function') setSavedPosition(normalizedPosition);
    if (typeof setDraftPosition === 'function') setDraftPosition(normalizedPosition);
    if (typeof setDragEnabled === 'function') setDragEnabled(false);
    if (localStorageKey && typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(localStorageKey, JSON.stringify(normalizedPosition));
      } catch {}
    }
    if (!authToken) {
      window.alert(`로그인된 계정이 없어 현재 접속에서만 반영됩니다. 계정 공통으로 쓰려면 로그인 상태에서 ${alertLabel}를 고정해 주세요.`);
      return;
    }
    if (defaultPositionSaveEndpoint) {
      void fetch(defaultPositionSaveEndpoint, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          token: authToken,
          position: normalizedPosition
        })
      }).catch((error) => {
        console.error(`${logLabel}_default_position_save_failed`, error);
        window.alert(`${alertLabel} 기본 위치를 코드에 저장하지 못했습니다. 다시 시도해 주세요.`);
      });
    }
    void fetch('/__auth/preferences', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        token: authToken,
        preferences: {
          [positionPreferenceKey]: normalizedPosition,
          [dragEnabledPreferenceKey]: false
        }
      })
    }).catch((error) => {
      console.error(`${logLabel}_preference_save_failed`, error);
      window.alert(`${alertLabel}를 계정 설정에 저장하지 못했습니다. 다시 시도해 주세요.`);
    });
  }, [alertLabel, authToken, defaultPositionSaveEndpoint, draftPosition, dragEnabledPreferenceKey, localStorageKey, logLabel, normalizePosition, positionPreferenceKey, setDraftPosition, setDragEnabled, setSavedPosition]);

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
      startPosition: normalizePosition(draftPosition),
      moved: false,
    };
    suppressClickRef.current = false;
  }, [dragEnabled, draftPosition, normalizePosition]);

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
