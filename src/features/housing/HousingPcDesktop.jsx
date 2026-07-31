import React from 'react';

const HOUSING_PC_APPS = Object.freeze([
  {
    key: 'save',
    icon: '💾',
    label: '저장하기',
    detail: 'Save Game',
    tone: 'system'
  },
  {
    key: 'load',
    icon: '📂',
    label: '불러오기',
    detail: 'Load Game',
    tone: 'primary'
  },
  {
    key: 'farmLog',
    icon: '📒',
    label: '영농일지',
    detail: 'FarmLog.exe',
    tone: 'work'
  },
  {
    key: 'bank',
    icon: '💳',
    label: '은행',
    detail: 'Bank PC',
    tone: 'mint'
  },
  {
    key: 'dealer',
    icon: '🚘',
    label: '중고차',
    detail: 'Used Car',
    tone: 'slate'
  },
  {
    key: 'weather',
    icon: '🌤',
    label: '날씨',
    detail: 'Weather',
    tone: 'sky'
  },
  {
    key: 'internet',
    icon: '🌐',
    label: '인터넷',
    detail: 'Browser',
    tone: 'blue'
  },
  {
    key: 'calendar',
    icon: '📅',
    label: '캘린더',
    detail: 'Calendar',
    tone: 'date'
  },
  {
    key: 'farmer24',
    icon: '🌾',
    label: '농부24',
    detail: 'Farmer24',
    tone: 'leaf'
  },
  {
    key: 'baemin',
    icon: '🛵',
    label: '배달',
    detail: 'Delivery',
    tone: 'green'
  },
  {
    key: 'map',
    icon: '🗺',
    label: '지도',
    detail: 'Map',
    tone: 'sky'
  },
  {
    key: 'land',
    icon: '🌱',
    label: '농지',
    detail: 'Land Manager',
    tone: 'leaf'
  },
  {
    key: 'machinery',
    icon: '🚜',
    label: '농기계',
    detail: 'Machinery',
    tone: 'work'
  },
  {
    key: 'labor',
    icon: '👥',
    label: '인력소',
    detail: 'Labor Office',
    tone: 'teal'
  },
  {
    key: 'auction',
    icon: '📦',
    label: '공판장',
    detail: 'Auction',
    tone: 'system'
  },
  {
    key: 'health',
    icon: '💚',
    label: '건강',
    detail: 'Health',
    tone: 'green'
  },
  {
    key: 'settings',
    icon: '⚙',
    label: '설정',
    detail: 'Settings',
    tone: 'slate'
  }
]);

const defaultWindowOffsetOf = (appKey = '') => {
  const index = Math.max(0, HOUSING_PC_APPS.findIndex((app) => app.key === appKey));
  return {
    x: Math.min(84, index * 26),
    y: Math.min(54, index * 18)
  };
};

const defaultWindowSizeOf = (appKey = '') => {
  const index = Math.max(0, HOUSING_PC_APPS.findIndex((app) => app.key === appKey));
  return {
    width: Math.min(540, 420 + index * 6),
    height: Math.min(292, 224 + index * 4)
  };
};

export default function HousingPcDesktop({
  timeText = '',
  appContents = {},
  onSave = null,
  onLoad = null,
}) {
  const [openAppKeys, setOpenAppKeys] = React.useState([]);
  const [activeAppKey, setActiveAppKey] = React.useState('');
  const [selectedIconKey, setSelectedIconKey] = React.useState('');
  const [minimizedAppKeys, setMinimizedAppKeys] = React.useState([]);
  const [maximizedAppKeys, setMaximizedAppKeys] = React.useState([]);
  const [windowOffsets, setWindowOffsets] = React.useState({});
  const [windowSizes, setWindowSizes] = React.useState({});
  const [startMenuOpen, setStartMenuOpen] = React.useState(false);
  const [startSearchText, setStartSearchText] = React.useState('');
  const [desktopMenu, setDesktopMenu] = React.useState(null);
  const dragStateRef = React.useRef(null);
  const resizeStateRef = React.useRef(null);
  const taskbarTimeText = String(timeText || '').trim() || '--:--';
  const visibleStartApps = HOUSING_PC_APPS.filter((app) => {
    const keyword = String(startSearchText || '').trim().toLowerCase();
    if (!keyword) return true;
    return `${app.label} ${app.detail}`.toLowerCase().includes(keyword);
  });

  const focusApp = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    if (!normalizedAppKey) return;
    setActiveAppKey(normalizedAppKey);
    setMinimizedAppKeys((prev) => prev.filter((key) => key !== normalizedAppKey));
  };

  const runApp = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    if (!normalizedAppKey) return;
    setOpenAppKeys((prev) => (prev.includes(normalizedAppKey) ? prev : [...prev, normalizedAppKey]));
    setWindowOffsets((prev) => (
      prev[normalizedAppKey] ? prev : { ...prev, [normalizedAppKey]: defaultWindowOffsetOf(normalizedAppKey) }
    ));
    setWindowSizes((prev) => (
      prev[normalizedAppKey] ? prev : { ...prev, [normalizedAppKey]: defaultWindowSizeOf(normalizedAppKey) }
    ));
    focusApp(normalizedAppKey);
    setStartMenuOpen(false);
    setDesktopMenu(null);
  };

  const closeApp = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    setOpenAppKeys((prev) => {
      const nextOpenAppKeys = prev.filter((key) => key !== normalizedAppKey);
      if (activeAppKey === normalizedAppKey) {
        setActiveAppKey(nextOpenAppKeys[nextOpenAppKeys.length - 1] || '');
      }
      return nextOpenAppKeys;
    });
    setMinimizedAppKeys((prev) => prev.filter((key) => key !== normalizedAppKey));
    setMaximizedAppKeys((prev) => prev.filter((key) => key !== normalizedAppKey));
    setWindowSizes((prev) => {
      if (!prev[normalizedAppKey]) return prev;
      const next = { ...prev };
      delete next[normalizedAppKey];
      return next;
    });
  };

  const minimizeApp = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    setMinimizedAppKeys((prev) => (prev.includes(normalizedAppKey) ? prev : [...prev, normalizedAppKey]));
    setActiveAppKey((current) => {
      if (current !== normalizedAppKey) return current;
      const nextVisibleAppKey = openAppKeys.find((key) => key !== normalizedAppKey && !minimizedAppKeys.includes(key));
      return nextVisibleAppKey || '';
    });
  };

  const toggleMaximizeApp = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    setMaximizedAppKeys((prev) => (
      prev.includes(normalizedAppKey)
        ? prev.filter((key) => key !== normalizedAppKey)
        : [...prev, normalizedAppKey]
    ));
    focusApp(normalizedAppKey);
  };

  const toggleStartMenu = () => {
    setStartMenuOpen((open) => !open);
    setDesktopMenu(null);
  };

  const handleTaskbarAppClick = (appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    if (!openAppKeys.includes(normalizedAppKey)) {
      runApp(normalizedAppKey);
      return;
    }
    if (minimizedAppKeys.includes(normalizedAppKey)) {
      focusApp(normalizedAppKey);
      return;
    }
    focusApp(normalizedAppKey);
  };

  const startWindowDrag = (event, appKey = '') => {
    const normalizedAppKey = String(appKey || '');
    if (maximizedAppKeys.includes(normalizedAppKey) || event.button !== 0) return;
    const origin = windowOffsets[normalizedAppKey] || defaultWindowOffsetOf(normalizedAppKey);
    dragStateRef.current = {
      appKey: normalizedAppKey,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y
    };
    focusApp(normalizedAppKey);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveWindowDrag = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const nextX = Math.max(-120, Math.min(120, dragState.originX + event.clientX - dragState.startX));
    const nextY = Math.max(-60, Math.min(70, dragState.originY + event.clientY - dragState.startY));
    setWindowOffsets((prev) => ({ ...prev, [dragState.appKey]: { x: nextX, y: nextY } }));
  };

  const endWindowDrag = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const startWindowResize = (event, appKey = '', edge = 'corner') => {
    const normalizedAppKey = String(appKey || '');
    if (maximizedAppKeys.includes(normalizedAppKey) || event.button !== 0) return;
    const origin = windowSizes[normalizedAppKey] || defaultWindowSizeOf(normalizedAppKey);
    resizeStateRef.current = {
      appKey: normalizedAppKey,
      edge,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: origin.width,
      originHeight: origin.height
    };
    focusApp(normalizedAppKey);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  };

  const moveWindowResize = (event) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;
    setWindowSizes((prev) => ({
      ...prev,
      [resizeState.appKey]: {
        width: resizeState.edge === 'bottom' ? resizeState.originWidth : Math.max(320, Math.min(720, resizeState.originWidth + deltaX)),
        height: resizeState.edge === 'right' ? resizeState.originHeight : Math.max(180, Math.min(360, resizeState.originHeight + deltaY))
      }
    }));
  };

  const endWindowResize = (event) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    resizeStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const openDesktopMenu = (event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDesktopMenu({
      x: Math.max(8, Math.min(rect.width - 156, event.clientX - rect.left)),
      y: Math.max(8, Math.min(rect.height - 134, event.clientY - rect.top))
    });
    setStartMenuOpen(false);
  };

  const renderAppContent = (appKey = '') => {
    if (appKey === 'save') {
      return (
        <div className="housing-pc-app-view">
          <strong>저장하기</strong>
          <span>현재 농장 상태를 저장합니다.</span>
          <button type="button" className="button button--primary button--compact" onClick={onSave}>
            저장 화면 열기
          </button>
        </div>
      );
    }
    if (appKey === 'load') {
      return (
        <div className="housing-pc-app-view">
          <strong>불러오기</strong>
          <span>저장된 농장 데이터를 불러옵니다.</span>
          <button type="button" className="button button--primary button--compact" onClick={onLoad}>
            불러오기 화면 열기
          </button>
        </div>
      );
    }
    if (appContents?.[appKey]) return appContents[appKey];
    const app = HOUSING_PC_APPS.find((entry) => entry.key === appKey);
    return (
      <div className="housing-pc-app-view housing-pc-app-view--installed">
        <strong>{app?.label || '앱'}</strong>
        <span>PC에 설치된 앱입니다.</span>
        <div className="housing-pc-installed-app-card">
          <em aria-hidden="true">{app?.icon || '▣'}</em>
          <div>
            <strong>{app?.detail || 'Farm OS App'}</strong>
            <span>하우징 PC에서 실행 중입니다. 세부 기능은 PC용 화면으로 확장할 수 있습니다.</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`housing-pc-desktop ${openAppKeys.some((appKey) => !minimizedAppKeys.includes(appKey)) ? 'has-open-window' : ''}`.trim()} aria-label="하우징 PC 바탕화면">
      <div className="housing-pc-desktop__screen">
        <div
          className="housing-pc-desktop__wallpaper"
          onClick={() => {
            setDesktopMenu(null);
            setStartMenuOpen(false);
            setSelectedIconKey('');
          }}
          onContextMenu={openDesktopMenu}
        >
          <div className="housing-pc-desktop__apps">
            {HOUSING_PC_APPS.map((app) => (
              <button
                key={`housing-pc-app-${app.key}`}
                type="button"
                className={`housing-pc-app is-${app.tone} ${selectedIconKey === app.key ? 'is-selected' : ''}`.trim()}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIconKey(app.key);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  runApp(app.key);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  runApp(app.key);
                }}
              >
                <span className="housing-pc-app__icon" aria-hidden="true">{app.icon}</span>
                <span className="housing-pc-app__label">{app.label}</span>
              </button>
            ))}
          </div>
          {desktopMenu ? (
            <div
              className="housing-pc-context-menu"
              style={{ left: `${desktopMenu.x}px`, top: `${desktopMenu.y}px` }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => setDesktopMenu(null)}>새로고침</button>
              <button type="button" onClick={() => setDesktopMenu(null)}>아이콘 정렬</button>
              <button type="button" onClick={() => setDesktopMenu(null)}>바탕화면 설정</button>
            </div>
          ) : null}
          {openAppKeys.map((appKey, index) => {
            if (minimizedAppKeys.includes(appKey)) return null;
            const app = HOUSING_PC_APPS.find((entry) => entry.key === appKey);
            if (!app) return null;
            const maximized = maximizedAppKeys.includes(appKey);
            const offset = windowOffsets[appKey] || defaultWindowOffsetOf(appKey);
            const size = windowSizes[appKey] || defaultWindowSizeOf(appKey);
            const focused = activeAppKey === appKey;
            return (
              <div
                key={`housing-pc-window-${appKey}`}
                className={`housing-pc-window is-active-app ${focused ? 'is-focused' : ''} ${maximized ? 'is-maximized' : ''}`.trim()}
                style={{
                  zIndex: focused ? 40 : 20 + index,
                  ...(maximized ? {} : {
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `translate(${offset.x}px, ${offset.y}px)`
                  })
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  focusApp(appKey);
                }}
              >
                <div
                  className="housing-pc-window__titlebar"
                  onPointerDown={(event) => startWindowDrag(event, appKey)}
                  onPointerMove={moveWindowDrag}
                  onPointerUp={endWindowDrag}
                  onPointerCancel={endWindowDrag}
                >
                  <span>
                    <em aria-hidden="true">{app.icon}</em>
                    {app.label}
                  </span>
                  <div className="housing-pc-window__controls" aria-label="창 제어" onPointerDown={(event) => event.stopPropagation()}>
                    <button type="button" aria-label="최소화" onClick={() => minimizeApp(appKey)}>-</button>
                    <button type="button" aria-label="최대화" onClick={() => toggleMaximizeApp(appKey)}>□</button>
                    <button type="button" aria-label="닫기" onClick={() => closeApp(appKey)}>×</button>
                  </div>
                </div>
                <div className="housing-pc-window__body is-app-open">
                  {renderAppContent(appKey)}
                </div>
                {!maximized ? (
                  <>
                    <span
                      className="housing-pc-window__resize-handle housing-pc-window__resize-handle--right"
                      aria-hidden="true"
                      onPointerDown={(event) => startWindowResize(event, appKey, 'right')}
                      onPointerMove={moveWindowResize}
                      onPointerUp={endWindowResize}
                      onPointerCancel={endWindowResize}
                    />
                    <span
                      className="housing-pc-window__resize-handle housing-pc-window__resize-handle--bottom"
                      aria-hidden="true"
                      onPointerDown={(event) => startWindowResize(event, appKey, 'bottom')}
                      onPointerMove={moveWindowResize}
                      onPointerUp={endWindowResize}
                      onPointerCancel={endWindowResize}
                    />
                    <span
                      className="housing-pc-window__resize-handle housing-pc-window__resize-handle--corner"
                      aria-hidden="true"
                      onPointerDown={(event) => startWindowResize(event, appKey, 'corner')}
                      onPointerMove={moveWindowResize}
                      onPointerUp={endWindowResize}
                      onPointerCancel={endWindowResize}
                    />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="housing-pc-desktop__taskbar">
          {startMenuOpen ? (
            <div className="housing-pc-start-menu">
              <div className="housing-pc-start-menu__head">
                <strong>Farm OS</strong>
                <span>하우징 관리 PC</span>
              </div>
              <input
                className="housing-pc-start-menu__search"
                type="search"
                value={startSearchText}
                placeholder="앱 검색"
                onChange={(event) => setStartSearchText(event.target.value)}
              />
              <div className="housing-pc-start-menu__apps">
                {visibleStartApps.map((app) => (
                  <button
                    key={`housing-pc-start-${app.key}`}
                    type="button"
                    onClick={() => runApp(app.key)}
                  >
                    <span aria-hidden="true">{app.icon}</span>
                    <div>
                      <strong>{app.label}</strong>
                      <em>{app.detail}</em>
                    </div>
                  </button>
                ))}
                {!visibleStartApps.length ? <span className="housing-pc-start-menu__empty">검색 결과가 없습니다.</span> : null}
              </div>
              <div className="housing-pc-start-menu__footer">
                <span>로컬 세션</span>
                <button type="button" onClick={() => setStartMenuOpen(false)}>전원</button>
              </div>
            </div>
          ) : null}
          <button type="button" className={startMenuOpen ? 'is-active' : ''} onClick={toggleStartMenu}>시작</button>
          <div className="housing-pc-desktop__taskbar-apps">
            {openAppKeys.map((appKey) => {
              const app = HOUSING_PC_APPS.find((entry) => entry.key === appKey);
              if (!app) return null;
              const focused = activeAppKey === app.key;
              return (
                <button
                  key={`housing-pc-taskbar-${app.key}`}
                  type="button"
                  className={`is-active ${focused ? 'is-focused' : ''} ${minimizedAppKeys.includes(app.key) ? 'is-minimized' : ''}`.trim()}
                  onClick={() => handleTaskbarAppClick(app.key)}
                  title={app.label}
                >
                  {app.icon}
                </button>
              );
            })}
          </div>
          <div className="housing-pc-tray" aria-label="시스템 상태">
            <span title="인터넷">▰</span>
            <span title="전원">⚡</span>
          </div>
          <time>{taskbarTimeText}</time>
        </div>
      </div>
    </div>
  );
}
