'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6 py-12 space-y-6">
      <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Something went wrong</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={onReset} className="font-semibold">
          <RefreshCw className="h-4 w-4 mr-1" />
          Try Again
        </Button>
        <Button size="sm" onClick={() => router.push('/')} className="font-semibold">
          <Home className="h-4 w-4 mr-1" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
