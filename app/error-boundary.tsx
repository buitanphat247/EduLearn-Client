'use client';

import { Component, ReactNode } from 'react';
import { Button, message } from 'antd';
import { ReloadOutlined, HomeOutlined, CopyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { logError } from '@/lib/utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  lastErrorTime: number | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const retryCount = this.state.retryCount + 1;
    const lastErrorTime = Date.now();

    // Get additional context
    const context = {
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    // Log error với context
    logError(error, errorInfo, context);

    // Update state
    this.setState({
      hasError: true,
      error,
      retryCount,
      lastErrorTime,
    });

    // Auto-recover nếu retry count < 3 và error không nghiêm trọng
    if (retryCount < 3 && !this.isCriticalError(error)) {
      setTimeout(() => {
        this.handleReset();
      }, 2000); // Retry sau 2 giây
    }
  }

  private isCriticalError(error: Error): boolean {
    // Critical errors: Network errors, Auth errors, etc.
    const criticalPatterns = [
      /network/i,
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
    ];
    return criticalPatterns.some(pattern => pattern.test(error.message));
  }

  handleReset = () => {
    const { retryCount } = this.state;

    // Nếu retry quá nhiều lần, reload page
    if (retryCount >= 3) {
      // Clear storage nếu cần
      if (typeof window !== 'undefined') {
        const shouldClearStorage = confirm(
          'Đã xảy ra lỗi nhiều lần. Bạn có muốn xóa cache và reload trang?'
        );

        if (shouldClearStorage) {
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return;
    }

    // Reset state
    this.setState({
      hasError: false,
      error: null,
      // Giữ retryCount để track
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleCopyError = async () => {
    if (!this.state.error) return;

    const errorText = [
      `Error: ${this.state.error.message}`,
      '',
      'Stack Trace:',
      this.state.error.stack || 'No stack trace available',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(errorText);
      message.success('Đã copy error details vào clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('Đã copy error details vào clipboard!');
      } catch (e) {
        message.error('Không thể copy. Vui lòng copy thủ công.');
      }
      document.body.removeChild(textArea);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          {process.env.NODE_ENV === 'development' && (
            <style dangerouslySetInnerHTML={{
              __html: `
                .error-overlay-stack-container {
                  background: #000000 !important;
                  border: 2px solid #9ca3af !important;
                }
                .error-overlay-pre,
                .error-overlay-pre * {
                  color: #00ff00 !important;
                  background-color: #000000 !important;
                }
                .error-overlay-code,
                .error-overlay-code * {
                  color: #00ff00 !important;
                  background-color: #000000 !important;
                }
                .error-overlay-container {
                  background-color: #ffffff !important;
                }
                .error-overlay-summary {
                  color: #000000 !important;
                }
                details[open] .error-overlay-stack-container {
                  display: block !important;
                }
              `
            }} />
          )}
          <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
            <div
              className={`${process.env.NODE_ENV === 'development' ? 'w-full h-full error-overlay-container' : 'max-w-md w-full'} text-center rounded-2xl p-2 shadow-lg border flex flex-col`}
              style={process.env.NODE_ENV === 'development' ? {
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                height: '100vh',
                maxHeight: '100vh',
              } : undefined}
            >
              <div className="mb-2 shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className={`${process.env.NODE_ENV === 'development' ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white mb-1`}>
                  Đã xảy ra lỗi
                </h2>
                <p className={`${process.env.NODE_ENV === 'development' ? 'text-sm' : 'text-base'} text-slate-700 dark:text-slate-300 mb-2 font-medium`}>
                  {this.state.error?.message || 'Có lỗi không mong muốn xảy ra'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center shrink-0 mb-2">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  disabled={this.state.retryCount >= 3}
                  className="flex items-center justify-center"
                >
                  {this.state.retryCount > 0
                    ? `Thử lại (${this.state.retryCount}/3)`
                    : 'Thử lại'
                  }
                </Button>
                {this.state.retryCount >= 3 && (
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    onClick={this.handleReload}
                    className="flex items-center justify-center"
                  >
                    Reload trang
                  </Button>
                )}
                <Link href="/">
                  <Button
                    icon={<HomeOutlined />}
                    className="flex items-center justify-center"
                  >
                    Về trang chủ
                  </Button>
                </Link>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-2 text-left flex-1 flex flex-col min-h-0 w-full">
                  <div className="flex items-center justify-between mb-2 error-overlay-summary shrink-0">
                    <div className="text-sm font-bold">
                      📋 Chi tiết lỗi (Development)
                    </div>
                    <Button
                      type="default"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={this.handleCopyError}
                      className="flex items-center gap-1"
                    >
                      Copy
                    </Button>
                  </div>
                  <div
                    className="error-overlay-stack-container border-2 p-2 rounded-lg shadow-inner w-full"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: '#9ca3af',
                      overflowY: 'scroll',
                      overflowX: 'auto',
                      flex: '1 1 auto',
                      display: 'block',
                      height: '100%',
                    }}
                  >
                    <pre
                      className="error-overlay-pre font-mono m-0 p-0 w-full"
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                        margin: 0,
                        padding: 0,
                        color: '#00ff00',
                        backgroundColor: '#000000',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      }}
                    >
                      <code
                        className="error-overlay-code"
                        style={{
                          fontFamily: 'inherit',
                          display: 'block',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: '#00ff00',
                          backgroundColor: '#000000',
                        }}
                      >
                        {this.state.error.stack}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}
