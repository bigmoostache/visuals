"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Something went wrong</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    An unexpected error occurred
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Error details</p>
                  <p className="text-sm font-mono text-gray-700 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleReset}
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}