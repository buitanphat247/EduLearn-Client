'use client';

import { Component, ReactNode } from 'react';
import { Button } from 'antd';
import { ReloadOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { logError } from '@/lib/utils/errorLogger';

interface Props {
  children: ReactNode;
  routeName: string; // e.g., 'admin', 'user', 'exam'
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo, {
      route: this.props.routeName,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Custom UI based on route
      const routeConfig = {
        admin: {
          title: 'Lỗi trong trang quản trị',
          description: 'Đã xảy ra lỗi trong khu vực quản trị. Vui lòng thử lại.',
          backUrl: '/admin',
        },
        user: {
          title: 'Lỗi trong trang người dùng',
          description: 'Đã xảy ra lỗi trong khu vực người dùng. Vui lòng thử lại.',
          backUrl: '/user',
        },
        exam: {
          title: 'Lỗi trong bài thi',
          description: 'Đã xảy ra lỗi trong bài thi. Vui lòng liên hệ hỗ trợ.',
          backUrl: '/user/exams',
        },
      };

      const config = routeConfig[this.props.routeName as keyof typeof routeConfig] || {
        title: 'Đã xảy ra lỗi',
        description: 'Có lỗi không mong muốn xảy ra.',
        backUrl: '/',
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] px-4">
          <div className="max-w-md w-full text-center bg-white dark:bg-[#1e293b] rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {config.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {config.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReset}>
                Thử lại
              </Button>
              <Link href={config.backUrl}>
                <Button icon={<ArrowLeftOutlined />}>
                  Quay lại
                </Button>
              </Link>
              <Link href="/">
                <Button icon={<HomeOutlined />}>
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
