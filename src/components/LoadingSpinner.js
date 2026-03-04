'use client';

export default function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-romance-200 border-t-romance-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="loading-heart text-romance-500 text-xl">♥</span>
        </div>
      </div>
      <p className="text-ink-400 text-sm animate-pulse">{text}</p>
    </div>
  );
}