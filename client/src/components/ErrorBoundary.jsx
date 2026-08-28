import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-slate-500 mb-10 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or return to the home page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <a 
                href="/"
                className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Home Page</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
