'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import StoryCard from '@/components/StoryCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

export default function LibraryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const result = await api.getMyLibrary();
    if (result.success) {
      setStories(result.data);
    }
    setLoading(false);
  };

  const filteredStories = stories.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const readingStories = filteredStories.filter(s => s.lastChapter > 0);
  const newStories = filteredStories.filter(s => !s.lastChapter || s.lastChapter === 0);

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-romance-50/50 to-transparent px-4 pt-6 pb-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Thư viện của tôi
            </h1>
            <p className="text-ink-400 text-sm mb-4">
              {stories.length > 0 ? `${stories.length} truyện trong thư viện` : 'Chưa có truyện nào'}
            </p>

            {/* Search */}
            {stories.length > 0 && (
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm truyện..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-romance-200 focus:border-romance-400 focus:ring-2 focus:ring-romance-100 outline-none bg-white/80 text-sm"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải thư viện..." />
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <span className="text-6xl mb-4 animate-float">📚</span>
            <h2 className="text-xl font-semibold text-ink-600 mb-2">Thư viện trống</h2>
            <p className="text-ink-400 text-sm text-center">
              Vui lòng liên hệ quản trị viên để được cấp truyện đọc
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            {/* Đang đọc */}
            {readingStories.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <span>📖</span> Đang đọc
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {readingStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}

            {/* Truyện mới / Chưa đọc */}
            {newStories.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <span>✨</span> {readingStories.length > 0 ? 'Chưa đọc' : 'Tất cả truyện'}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {newStories.map((story) => (
                    <StoryCard key={story.id} story={story} showProgress={false} />
                  ))}
                </div>
              </section>
            )}

            {filteredStories.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🔍</span>
                <p className="text-ink-400">Không tìm thấy truyện phù hợp</p>
              </div>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}