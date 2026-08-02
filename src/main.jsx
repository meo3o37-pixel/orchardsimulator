import React from 'react';
import ReactDOM from 'react-dom/client';
import GameBootLoader, { LoadingScreen } from './systems/loading/GameBootLoader.jsx';
import { registerAssetCacheServiceWorker } from './systems/cache/registerAssetCache';
import './styles.css';

document.title = '농장 시뮬레이터';
registerAssetCacheServiceWorker();

const App = React.lazy(() => import('./App.jsx'));

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[RootErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#7a1f1f', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
          <h2 style={{ marginTop: 0 }}>화면 렌더링 오류</h2>
          <p>앱 실행 중 오류가 발생했습니다. 아래 메시지를 캡처해서 보내주세요.</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#fff6f6',
              border: '1px solid #efc9c9',
              padding: 12,
              borderRadius: 8
            }}
          >
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <RootErrorBoundary>
    <GameBootLoader>
      <React.Suspense fallback={<LoadingScreen progress={1} label="게임 화면 준비" detail="앱 화면을 불러오고 있습니다." />}>
        <App />
      </React.Suspense>
    </GameBootLoader>
  </RootErrorBoundary>
);
