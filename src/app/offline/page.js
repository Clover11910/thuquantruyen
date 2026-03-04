'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAllOfflineBooks, getOfflineBook, removeOfflineBookLocal } from '@/lib/offlineStorage';
import api from '@/lib/api';

export default function OfflinePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingBook, setReadingBook] = useState(null);
  const [readingChapter, setReadingChapter] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 18, fontFamily: 'Georgia', bgColor: '#FFF8F0', textColor: '#4A3728', lineHeight: 1.8,
  });
  const router = useRouter();

  useEffect(() => {
    loadBooks();
    loadSettings();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const offlineBooks = await getAllOfflineBooks();
      setBooks(offlineBooks);
    } catch (e) {
      console.error('Lỗi tải sách offline:', e);
    }
    setLoading(false);
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch {}
    // Fallback: đọc từ localStorage
    try {
      const saved = localStorage.getItem('reading_settings');
      if (saved) setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
  };

  const openBook = async (storyId) => {
    try {
      const book = await getOfflineBook(storyId);
      if (book) {
        setReadingBook(book);
        setReadingChapter(0);
        setShowChapterList(true);
      }
    } catch (e) {
      alert('Lỗi mở sách: ' + e.message);
    }
  };

  const removeBook = async (storyId) => {
    if (!confirm('Xoá truyện này khỏi danh sách offline?')) return;
    try {
      await removeOfflineBookLocal(storyId);
      await api.removeOfflineBook(storyId);
      setBooks(prev => prev.filter(b => b.storyId !== storyId));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').filter(line => line.trim()).map((para, i) => (
      <p key={i} className="mb-3" style={{ textIndent: '2em' }}>
        {para.trim()}
      </p>
    ));
  };

  // === CHẾ ĐỘ ĐỌC OFFLINE ===
  if (readingBook && readingChapter > 0) {
    const chapter = readingBook.chapters.find(c => c.chapterNumber === readingChapter);
    const currentIdx = readingBook.chapters.findIndex(c => c.chapterNumber === readingChapter);
    const prevChapter = currentIdx > 0 ? readingBook.chapters[currentIdx - 1].chapterNumber : null;
    const nextChapter = currentIdx < readingBook.chapters.length - 1 ? readingBook.chapters[currentIdx + 1].chapterNumber : null;

    return (
      <ProtectedRoute>
        <div
          className="min-h-screen transition-colors duration-300"
          style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
        >
          {/* Top Bar */}
          <div className="fixed top-0 left-0 right-0 z-40 glass-dark text-white px-4 h-12 flex items-center justify-between">
            <button
              onClick={() => { setReadingChapter(0); setShowChapterList(true); }}
              className="flex items-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="line-clamp-1 max-w-[200px]">{readingBook.story.title}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-500/80 px-2 py-0.5 rounded-full">📡 Offline</span>
              <button
                onClick={() => setShowChapterList(true)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-24 min-h-screen">
            {chapter ? (
              <article>
                <header className="text-center mb-8 pt-4">
                  <p className="text-sm opacity-60 mb-1">{readingBook.story.title}</p>
                  <h1
                    className="text-xl sm:text-2xl font-bold"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {chapter.title}
                  </h1>
                  <div className="w-16 h-0.5 mx-auto mt-3 rounded-full opacity-30" style={{ backgroundColor: settings.textColor }} />
                </header>

                <div
                  className="chapter-content"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    fontFamily: settings.fontFamily,
                    lineHeight: settings.lineHeight,
                  }}
                >
                  {formatContent(chapter.content)}
                </div>

                <div className="text-center my-12 opacity-40">
                  <span className="text-2xl">~ 🌸 ~</span>
                </div>
              </article>
            ) : (
              <div className="text-center py-20 opacity-60">Không tìm thấy nội dung chương</div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark safe-bottom">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => { if (prevChapter) { setReadingChapter(prevChapter); window.scrollTo(0, 0); } }}
                disabled={!prevChapter}
                className="flex items-center gap-1 text-white text-sm disabled:opacity-30 px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>
              <span className="text-white text-xs opacity-70">
                {readingChapter} / {readingBook.chapters.length}
              </span>
              <button
                onClick={() => { if (nextChapter) { setReadingChapter(nextChapter); window.scrollTo(0, 0); } }}
                disabled={!nextChapter}
                className="flex items-center gap-1 text-white text-sm disabled:opacity-30 px-3 py-2"
              >
                Sau
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chapter Drawer for Offline */}
          {showChapterList && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowChapterList(false)} />
              <div className="relative w-80 max-w-[85vw] bg-white shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                <div className="px-5 pt-5 pb-3 border-b border-romance-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-ink-800 text-lg">Mục lục offline</h3>
                      <p className="text-xs text-ink-400 mt-0.5">{readingBook.story.title}</p>
                      <p className="text-xs text-green-600 mt-1">📡 {readingBook.chapters.length} chương đã tải</p>
                    </div>
                    <button onClick={() => setShowChapterList(false)} className="text-ink-400 hover:text-ink-600 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-romance">
                  <div className="py-2">
                    {readingBook.chapters.map((ch) => {
                      const isCurrent = ch.chapterNumber === readingChapter;
                      return (
                        <button
                          key={ch.chapterNumber}
                          onClick={() => {
                            setReadingChapter(ch.chapterNumber);
                            setShowChapterList(false);
                            window.scrollTo(0, 0);
                          }}
                          className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all ${
                            isCurrent ? 'bg-romance-50 border-r-3 border-romance-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrent ? 'bg-romance-500 text-white' : 'bg-gray-100 text-ink-400'
                          }`}>
                            {ch.chapterNumber}
                          </span>
                          <span className={`text-sm flex-1 ${isCurrent ? 'text-romance-700 font-medium' : 'text-ink-600'}`}>
                            {ch.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    );
  }

  // === CHẾ ĐỘ XEM MỤC LỤC OFFLINE ===
  if (readingBook && showChapterList) {
    return (
      <ProtectedRoute>
        <Header />
        <main className="min-h-screen pb-20 relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => { setReadingBook(null); setShowChapterList(false); }}
              className="flex items-center gap-2 text-ink-500 hover:text-romance-600 mb-4 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                {readingBook.story.cover ? (
                  <img src={readingBook.story.cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🌸</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink-800" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {readingBook.story.title}
                </h1>
                <p className="text-sm text-ink-400">{readingBook.story.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📡 Offline</span>
                  <span className="text-xs text-ink-400">{readingBook.chapters.length} chương</span>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-ink-700 mb-3">📋 Chọn chương để đọc</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {readingBook.chapters.map((ch) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => {
                      setReadingChapter(ch.chapterNumber);
                      setShowChapterList(false);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-romance-50/50 transition-all"
                  >
                    <span className="text-xs font-bold w-8 h-8 rounded-full bg-gray-100 text-ink-400 flex items-center justify-center flex-shrink-0">
                      {ch.chapterNumber}
                    </span>
                    <span className="text-sm text-ink-600 flex-1">{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // === DANH SÁCH SÁCH OFFLINE ===
  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        <div className="bg-gradient-to-b from-romance-50/50 to-transparent px-4 pt-6 pb-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              📥 Đọc Offline
            </h1>
            <p className="text-ink-400 text-sm mb-2">
              Truyện đã tải về tài khoản — đọc mọi lúc, không cần mạng
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                💡 <strong>Dành cho Kindle & máy đọc sách:</strong> Các truyện đã tải sẽ được lưu trong tài khoản của bạn. 
                Bạn có thể mở trình duyệt trên Kindle (Settings → Experimental Browser) và đăng nhập để đọc mà không cần internet ổn định. 
                Nội dung đã được cache cục bộ trên thiết bị.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải danh sách..." />
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <span className="text-6xl mb-4 animate-float">📱</span>
            <h2 className="text-xl font-semibold text-ink-600 mb-2">Chưa có truyện offline</h2>
            <p className="text-ink-400 text-sm text-center mb-4">
              Vào trang chi tiết truyện và bấm "Tải đọc offline" để lưu truyện
            </p>
            <button
              onClick={() => router.push('/library')}
              className="px-6 py-2.5 bg-romance-500 text-white rounded-2xl font-medium hover:bg-romance-600 transition-colors"
            >
              📚 Về thư viện
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <div
                  key={book.storyId}
                  className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 p-4">
                    <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                      {book.story?.cover ? (
                        <img src={book.story.cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🌸</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink-800 text-sm line-clamp-2">{book.story?.title}</h3>
                      <p className="text-xs text-ink-400 mt-0.5">{book.story?.author}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Đã tải</span>
                        <span className="text-[10px] text-ink-300">{book.chapters?.length} chương</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => openBook(book.storyId)}
                      className="flex-1 py-2 bg-gradient-to-r from-romance-500 to-romance-600 text-white text-sm font-medium rounded-xl hover:from-romance-600 hover:to-romance-700 transition-all"
                    >
                      📖 Đọc ngay
                    </button>
                    <button
                      onClick={() => removeBook(book.storyId)}
                      className="px-3 py-2 border border-red-200 text-red-500 text-sm rounded-xl hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}