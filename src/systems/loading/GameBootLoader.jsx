import React, { useEffect, useMemo, useState } from 'react';
import {
  getAssetCacheDownloadConsentStatus,
  getLoadingPhase,
  preloadLoadingPhase,
  schedulePostBootPreload,
  setAssetCacheDownloadConsent
} from './preloadAssets';
import mainMenuImage from '../../assets/images/main-menu.png';
import loadingOrchardBackground from '../../assets/images/loading-orchard-background.png';

const clampProgress = (ratio, max = 1) => Math.max(0, Math.min(max, Number(ratio) || 0));
const percentLabel = (ratio) => `${Math.round(clampProgress(ratio) * 100)}%`;
const nextPaint = () => new Promise((resolve) => {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    setTimeout(resolve, 0);
    return;
  }
  window.requestAnimationFrame(() => setTimeout(resolve, 0));
});

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  backgroundColor: '#111d16',
  backgroundImage: `
    linear-gradient(115deg, rgba(14, 27, 19, 0.94), rgba(24, 46, 31, 0.82) 48%, rgba(12, 20, 16, 0.96)),
    url(${mainMenuImage})
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#f5f2e7',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: 24
};

const panelStyle = {
  width: 'min(520px, 100%)',
  display: 'grid',
  gap: 18,
  padding: '24px 24px 22px',
  borderRadius: 8,
  background: 'linear-gradient(180deg, rgba(25, 42, 31, 0.92), rgba(14, 24, 18, 0.94))',
  border: '1px solid rgba(226, 214, 176, 0.28)',
  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)'
};

const eyebrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  minHeight: 24,
  padding: '0 9px',
  borderRadius: 6,
  background: 'rgba(242, 196, 95, 0.13)',
  border: '1px solid rgba(242, 196, 95, 0.24)',
  color: '#f3d589',
  fontSize: 12,
  fontWeight: 800
};

const buttonBaseStyle = {
  minHeight: 44,
  padding: '0 18px',
  borderRadius: 8,
  fontWeight: 850,
  cursor: 'pointer',
  letterSpacing: 0
};

function OrchardLoadingMark() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 116,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        backgroundImage: `linear-gradient(180deg, rgba(13, 25, 18, 0.08), rgba(10, 18, 13, 0.34)), url(${loadingOrchardBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 58%',
        border: '1px solid rgba(226, 214, 176, 0.2)',
        boxShadow: 'inset 0 -36px 54px rgba(7, 13, 10, 0.3)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.08), rgba(255,255,255,0))'
        }}
      />
    </div>
  );
}

export function LoadingScreen({ progress = 0, label = '게임 준비 중', detail = '필수 리소스를 확인하고 있습니다.' }) {
  const safeProgress = clampProgress(progress);
  const barStyle = useMemo(() => ({
    width: percentLabel(safeProgress)
  }), [safeProgress]);

  return (
    <div style={shellStyle}>
      <section aria-label="게임 로딩" style={{ ...panelStyle, width: 'min(480px, 100%)' }}>
        <OrchardLoadingMark />
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={eyebrowStyle}>과수 타이쿤</div>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15, letterSpacing: 0, color: '#fff7df' }}>{label}</h1>
          <p style={{ margin: 0, color: '#dce7d1', fontSize: 14, lineHeight: 1.6 }}>{detail}</p>
        </div>
        <div
          style={{
            display: 'grid',
            gap: 8
          }}
        >
          <div
            style={{
              height: 12,
              overflow: 'hidden',
              borderRadius: 999,
              background: 'rgba(7, 13, 10, 0.52)',
              border: '1px solid rgba(226, 214, 176, 0.24)',
              boxShadow: 'inset 0 1px 5px rgba(0, 0, 0, 0.34)'
            }}
          >
            <div
              style={{
                ...barStyle,
                minWidth: safeProgress > 0 ? 10 : 0,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #78b85f, #f0c35d 58%, #f6e19a)',
                boxShadow: '0 0 18px rgba(240, 195, 93, 0.34)',
                transition: 'width 180ms ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbcaad', fontSize: 12 }}>
            <span>{safeProgress >= 1 ? '준비 완료' : '진행 상황'}</span>
            <strong style={{ color: '#fff7df' }}>{percentLabel(safeProgress)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function CacheConsentScreen({ onAccept, onDecline }) {
  return (
    <div style={shellStyle}>
      <section aria-label="캐시 다운로드 안내" style={panelStyle}>
        <OrchardLoadingMark />
        <div style={{ display: 'grid', gap: 9 }}>
          <div style={eyebrowStyle}>첫 실행 안내</div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.12, letterSpacing: 0, color: '#fff7df' }}>게임 리소스를 미리 받아둘까요?</h1>
          <p style={{ margin: 0, color: '#dce7d1', fontSize: 15, lineHeight: 1.65 }}>
            첫 실행 때 이미지와 효과음을 브라우저 캐시에 저장해두면 지도, 과수원, 창고 화면을 열 때 끊김이 줄어듭니다.
            저장되는 것은 게임 화면 리소스이며, 계정 정보나 저장 데이터가 추가로 수집되는 것은 아닙니다.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gap: 8,
            padding: 14,
            border: '1px solid rgba(226, 214, 176, 0.22)',
            borderRadius: 8,
            background: 'rgba(7, 13, 10, 0.28)',
            color: '#dce7d1',
            fontSize: 13,
            lineHeight: 1.55
          }}
        >
          <div>동의하면 필수 리소스를 먼저 받고, 나머지는 게임 중 백그라운드로 조금씩 받아둡니다.</div>
          <div>동의하지 않아도 게임은 실행됩니다. 대신 처음 여는 화면에서 리소스를 그때그때 받을 수 있습니다.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onAccept}
            style={{
              ...buttonBaseStyle,
              border: 0,
              background: 'linear-gradient(180deg, #f0ca69, #d89b38)',
              color: '#1c1a10',
              boxShadow: '0 10px 24px rgba(216, 155, 56, 0.26)'
            }}
          >
            동의하고 시작
          </button>
          <button
            type="button"
            onClick={onDecline}
            style={{
              ...buttonBaseStyle,
              border: '1px solid rgba(226, 214, 176, 0.34)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f5f2e7'
            }}
          >
            그때그때 받고 시작
          </button>
        </div>
      </section>
    </div>
  );
}

export default function GameBootLoader({ children }) {
  const bootPhase = getLoadingPhase('boot');
  const [cacheConsent, setCacheConsent] = useState(() => getAssetCacheDownloadConsentStatus());
  const [bootState, setBootState] = useState(() => ({
    ready: false,
    progress: 0,
    label: bootPhase?.label || '기본 화면 준비',
    detail: '필수 리소스 목록을 확인하고 있습니다.'
  }));

  useEffect(() => {
    if (cacheConsent === 'pending') return undefined;
    if (cacheConsent === 'declined') {
      setBootState({
        ready: false,
        progress: 0.96,
        label: bootPhase?.label || '기본 화면 준비',
        detail: '필요한 리소스는 화면을 열 때 불러오도록 설정했습니다.'
      });
      nextPaint().then(() => {
        setBootState((prev) => ({ ...prev, ready: true, progress: 1, detail: '화면을 여는 중입니다.' }));
      });
      return undefined;
    }
    let cancelled = false;
    setBootState((prev) => ({
      ...prev,
      progress: 0.03,
      detail: '필수 리소스 목록을 확인하고 있습니다.'
    }));
    preloadLoadingPhase('boot', {
      force: true,
      onProgress: ({ completed, total, current, result }) => {
        if (cancelled) return;
        const safeTotal = Math.max(0, Number(total) || 0);
        const safeCompleted = Math.max(0, Number(completed) || 0);
        const ratio = safeTotal > 0 ? safeCompleted / safeTotal : 1;
        const progress = 0.08 + (clampProgress(ratio, 1) * 0.84);
        const currentLabel = current?.label ? String(current.label) : '필수 리소스';
        const countLabel = safeTotal > 0 ? ` (${Math.min(safeCompleted + (result ? 0 : 1), safeTotal)}/${safeTotal})` : '';
        const statusLabel = result
          ? (result.status === 'failed' ? '확인 실패, 나중에 재시도' : '확인 완료')
          : '불러오는 중';
        setBootState((prev) => ({
          ...prev,
          progress,
          detail: `${currentLabel} ${statusLabel}${countLabel}`
        }));
      }
    }).then(async (summary) => {
      if (cancelled) return;
      setBootState({
        ready: false,
        progress: 0.97,
        label: bootPhase?.label || '기본 화면 준비',
        detail: summary.failed > 0
          ? `일부 리소스는 나중에 다시 불러옵니다. (${summary.failed}개)`
          : '필수 리소스 확인 완료. 화면을 구성하고 있습니다.'
      });
      await nextPaint();
      if (cancelled) return;
      setBootState({
        ready: true,
        progress: 1,
        label: bootPhase?.label || '기본 화면 준비',
        detail: summary.failed > 0
          ? `일부 리소스는 나중에 다시 불러옵니다. (${summary.failed}개)`
          : '준비 완료'
      });
    });
    return () => {
      cancelled = true;
    };
  }, [bootPhase?.label, cacheConsent]);

  useEffect(() => {
    if (!bootState.ready) return undefined;
    return schedulePostBootPreload({ force: cacheConsent === 'accepted' });
  }, [bootState.ready, cacheConsent]);

  if (cacheConsent === 'pending') {
    return (
      <CacheConsentScreen
        onAccept={() => {
          setAssetCacheDownloadConsent(true);
          setCacheConsent('accepted');
        }}
        onDecline={() => {
          setAssetCacheDownloadConsent(false);
          setCacheConsent('declined');
        }}
      />
    );
  }

  if (!bootState.ready) {
    return (
      <LoadingScreen
        progress={bootState.progress}
        label={bootState.label}
        detail={bootState.detail}
      />
    );
  }

  return children;
}
