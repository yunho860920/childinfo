import React from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical System Error Handled by SHIELD Agent:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-6 text-center transition-colors duration-500">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm">
              <ShieldAlert size={40} />
            </div>
            <h1 className="text-2xl font-black text-brand-gray-900 mb-2">시스템 연결 오류</h1>
            <p className="text-brand-gray-500 mb-8 leading-relaxed font-medium">
              죄송합니다. 모바일 환경 최적화 과정에서 일시적인 요류가 발생했습니다. 브라우저 캐시를 삭제하거나 페이지를 새로고침해 보세요.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> 페이지 새로고침
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-4 bg-brand-gray-100 text-brand-gray-600 rounded-2xl font-black hover:bg-brand-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> 설정 초기화 후 재시도
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-8 p-4 bg-gray-100 rounded-xl text-left text-[10px] overflow-auto max-h-40 font-mono">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
