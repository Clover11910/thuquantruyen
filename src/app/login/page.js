'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/library');
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      router.push('/library');
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-romance-50 via-parchment-50 to-romance-100 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-romance-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-parchment-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-romance-100/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🌸</div>
          <h1 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
            Thư Viện Ngôn Tình
          </h1>
          <p className="text-ink-400 text-sm italic">Nơi mỗi câu chuyện là một giấc mơ...</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 shadow-xl animate-slide-up">
          <h2 className="text-xl font-semibold text-ink-800 text-center mb-6">Đăng nhập</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4 text-center animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Tài khoản</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tài khoản..."
                required
                className="w-full px-4 py-3 rounded-2xl border border-romance-200 focus:border-romance-400 focus:ring-2 focus:ring-romance-200 outline-none transition-all bg-white/70 text-ink-800 placeholder-ink-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full px-4 py-3 rounded-2xl border border-romance-200 focus:border-romance-400 focus:ring-2 focus:ring-romance-200 outline-none transition-all bg-white/70 text-ink-800 placeholder-ink-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-romance-500 to-romance-600 text-white font-semibold rounded-2xl hover:from-romance-600 hover:to-romance-700 transition-all disabled:opacity-50 shadow-lg shadow-romance-200/50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-heart">♥</span> Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-300 mt-6">
          Tài khoản được cấp bởi quản trị viên
        </p>
      </div>
    </div>
  );
}