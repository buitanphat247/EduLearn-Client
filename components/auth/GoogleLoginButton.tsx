import { Spin } from "antd";

interface GoogleLoginButtonProps {
    isLoading: boolean;
    onClick: () => void;
    isAnyLoading: boolean;
}

export default function GoogleLoginButton({ isLoading, onClick, isAnyLoading }: GoogleLoginButtonProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 py-3">
                <Spin size="small" />
                <span className="text-slate-500 dark:text-slate-400">Đang xử lý...</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isAnyLoading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-slate-700 dark:text-slate-200 font-medium text-sm ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957A8.996 8.996 0 000 9.002a8.996 8.996 0 00.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.48 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            Đăng nhập bằng Google
        </button>
    );
}
