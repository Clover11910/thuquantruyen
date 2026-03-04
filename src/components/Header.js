'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 glass border-b border-romance-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/library" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-bold text-lg gradient-text hidden sm:inline" style={{ fontFamily: '"Playfair Display", serif' }}>
            Thư Viện Ngôn Tình
          </span>
          <span className="font-bold text-lg gradient-text sm:hidden" style={{ fontFamily: '"Playfair Display", serif' }}>
            TVNT
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/library" className="text-ink-600 hover:text-romance-600 transition-colors text-sm font-medium">
            Thư viện
          </Link>
          <Link href="/offline" className="text-ink-600 hover:text-romance-600 transition-colors text-sm font-medium">
            📥 Offline
          </Link>
          {user.role === 'admin' && (
            <Link href="/admin" className="text-ink-600 hover:text-romance-600 transition-colors text-sm font-medium">
              ⚙️ Admin
            </Link>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-romance-200">
            <span className="text-sm text-ink-500">{user.displayName}</span>
            <button
              onClick={logout}
              className="text-xs bg-romance-100 hover:bg-romance-200 text-romance-700 px-3 py-1.5 rounded-full transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-ink-600 p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-romance-100 animate-slide-up">
          <div className="px-4 py-3 space-y-2">
            <Link href="/library" onClick={() => setMenuOpen(false)} className="block py-2 text-ink-600 hover:text-romance-600">
              📚 Thư viện
            </Link>
            <Link href="/offline" onClick={() => setMenuOpen(false)} className="block py-2 text-ink-600 hover:text-romance-600">
              📥 Đọc Offline
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-ink-600 hover:text-romance-600">
                ⚙️ Quản trị
              </Link>
            )}
            <div className="pt-2 border-t border-romance-100 flex items-center justify-between">
              <span className="text-sm text-ink-500">{user.displayName}</span>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-xs bg-romance-100 text-romance-700 px-3 py-1.5 rounded-full"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}