import { useEffect, useState } from 'react';
import { DEFAULT_APPLE_PRICE_TABS } from './applePriceData.mjs';

export default function useApplePriceBoard(isOpen) {
  const [tabs, setTabs] = useState(DEFAULT_APPLE_PRICE_TABS);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    setStatus('loading');
    const refresh = async () => {
      try {
        const response = await fetch('/__apple-price-board', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !payload.ok || !payload.tabs?.length) throw new Error('가격표 응답 오류');
        if (active) { setTabs(payload.tabs); setStatus('ready'); }
      } catch (error) {
        if (active) setStatus('error');
        console.warn('사과 가격표를 갱신하지 못했습니다.', error);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('apple-price-board-saved', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('apple-price-board-saved', refresh);
    };
  }, [isOpen]);
  return { tabs, status };
}
