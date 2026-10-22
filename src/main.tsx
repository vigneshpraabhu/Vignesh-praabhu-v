// Ensure window.fetch has both getter and setter for third-party scripts and extensions
try {
  let _currentFetch = window.fetch;
  const _desc = {
    configurable: true,
    enumerable: true,
    get: () => _currentFetch,
    set: (fn: typeof window.fetch) => {
      _currentFetch = fn;
    },
  };
  try { Object.defineProperty(window, 'fetch', _desc); } catch (_) {}
  try {
    if (typeof Window !== 'undefined' && Window.prototype) {
      Object.defineProperty(Window.prototype, 'fetch', _desc);
    }
  } catch (_) {}
} catch (_) {}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 12px' }}>Emergency Platform Rendering Notice</h2>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            A temporary component error occurred. Click below to reload:
          </p>
          <pre style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#0f172a', overflowX: 'auto' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reset Demo Data & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
