import { Component } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/layout/Toast';
import { AuthProvider } from './auth-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#f4f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Manrope, sans-serif' }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(24,28,34,0.08)', boxShadow: '0 4px 24px rgba(24,28,34,.10)', padding: 36, maxWidth: 560, width: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#e53935,#b71c1c)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, marginBottom: 20 }}>!</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#181c22' }}>Something went wrong</div>
            <pre style={{ background: '#0a0c10', color: '#ff8a80', padding: '16px 18px', borderRadius: 12, fontSize: 12, overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error.message}{'\n\n'}{this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Providers({ children }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryClientProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
