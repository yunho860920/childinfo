// Deployment Heartbeat: 2026-04-20 23:59 - [FINAL SYNC] Dashboard UI Perfection
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// React 마운트 성공 시 fallback UI 제거 및 타임아웃 해제
function clearFallback() {
  try {
    if (window.__rootTimeout) {
      clearTimeout(window.__rootTimeout);
      window.__rootTimeout = null;
    }
    var fallback = document.getElementById('root-fallback');
    if (fallback) {
      fallback.remove();
    }
  } catch (e) {
    // 무시 - fallback 정리 실패는 치명적이지 않음
  }
}

// React 마운트를 안전하게 실행
try {
  var rootEl = document.getElementById('root');
  if (rootEl) {
    var root = ReactDOM.createRoot(rootEl);
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, null,
          React.createElement(AppWrapper, null)
        )
      )
    );
  }
} catch (e) {
  console.error('SHIELD Agent: Fatal React mount error:', e);
  // fallback UI가 자동으로 에러를 표시
}

function AppWrapper() {
  React.useEffect(function() {
    // React가 성공적으로 마운트되면 fallback 제거
    clearFallback();
  }, []);
  return React.createElement(App, null);
}
