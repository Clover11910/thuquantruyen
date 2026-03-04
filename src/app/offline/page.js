'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReadingSettings from '@/components/ReadingSettings';
import {
  getAllOfflineBooks,
  getOfflineBook,
  removeOfflineBookLocal,
  saveOfflineProgress,
  getOfflineProgress,
  saveOfflineSettings,
  getOfflineSettings
} from '@/lib/offlineStorage';

export default function OfflinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readStoryId = searchParams.get('read');

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reading state
  const [readingBook, setReadingBook] = useState(null);
  const [readingChapter, setReadingChapter] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settings, setSettings] = useState({
    fontSize: 18, fontFamily: 'Georgia', bgColor: '#FFF8F0', textColor: '#4A3728', lineHeight: 1.8,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Nếu URL có ?read=storyId → mở thẳng truyện
  useEffect(() => {
    if (readStoryId && !loading) {
      openBook(readStoryId);
    }
  }, [readStoryId, loading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const localBooks = await getAllOfflineBooks();
      setBooks(localBooks);

      const savedSettings = await getOfflineSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (e) {
      console.error('Lỗi:', e);
    }
    setLoading(false);
  };

  const openBook = async (storyId) => {
    try {
      const book = await getOfflineBook(storyId);
      if (book) {
        setReadingBook(book);
        // Lấy tiến độ đọc từ IndexedDB
        const progress = await getOfflineProgress(storyId);
        if (progress && progress.lastChapter > 0) {
          setReadingChapter(progress.lastChapter);
        } else {
          setShowChapterList(true);
        }
      }
    } catch (e) {
      alert('Lỗi mở sách: ' + e.message);
    }
  };

  const goToChapter = useCallback(async (chapNum) => {
    setReadingChapter(chapNum);
    setShowChapterList(false);
    window.scrollTo(0, 0);

    // Lưu tiến độ vào IndexedDB (KHÔNG gọi server)
    if (readingBook) {
      await saveOfflineProgress(readingBook.storyId, chapNum, 0);
    }
  }, [readingBook]);

  const handleSettingsChange = async (newSettings) => {
    setSettings(newSettings);
    await saveOfflineSettings(newSettings);
  };

  const removeBook = async (storyId) => {
    if (!confirm('Xoá truyện này khỏi thiết bị?')) return;
    try {
      await removeOfflineBookLocal(storyId);
      setBooks(prev => prev.filter(b => b.storyId !== storyId));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').filter(line => line.trim()).map((para, i) => (
      <p key={i} className="mb-3" style={{ textIndent: '2em' }}>{para.trim()}</p>
    ));
  };

  // ==============================
  // CHẾ ĐỘ ĐỌC TRUYỆN OFFLINE
  // ==============================
  if (readingBook && readingChapter > 0) {
    const chapter = readingBook.chapters.find(c => c.chapterNumber === readingChapter || String(c.chapterNumber) === String(readingChapter));
    const sortedChapters = [...readingBook.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
    const currentIdx = sortedChapters.findIndex(c => String(c.chapterNumber) === String(readingChapter));
    const prevChapter = currentIdx > 0 ? sortedChapters[currentIdx - 1].chapterNumber : null;
    const nextChapter = currentIdx < sortedChapters.length - 1 ? sortedChapters[currentIdx + 1].chapterNumber : null;

    return (
      <ProtectedRoute>
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>

          {/* Top Bar */}
          <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="glass-dark text-white px-4 h-12 flex items-center justify-between">
              <button onClick={() => { setReadingChapter(0); setShowChapterList(true); }} className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="line-clamp-1 max-w-[180px]">{readingBook.story.title}</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[10px] bg-green-500/80 px-1.5 py-0.5 rounded-full mr-1">Offline</span>
                <button onClick={() => setShowChapterList(true)} className="p-2 rounded-full hover:bg-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div onClick={() => setShowControls(prev => !prev)} className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-24 min-h-screen">
            {chapter ? (
              <article>
                <header className="text-center mb-8 pt-4">
                  <p className="text-sm opacity-60 mb-1">{readingBook.story.title}</p>
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {chapter.title}
                  </h1>
                  <div className="w-16 h-0.5 mx-auto mt-3 rounded-full opacity-30" style={{ backgroundColor: settings.textColor }} />
                </header>
                <div className="chapter-content" style={{ fontSize: `${settings.fontSize}px`, fontFamily: settings.fontFamily, lineHeight: settings.lineHeight }}>
                  {formatContent(chapter.content)}
                </div>
                <div className="text-center my-12 opacity-40">
                  <span className="text-2xl">~ 🌸 ~</span>
                </div>
              </article>
            ) : (
              <div className="text-center py-20 opacity-60">Không tìm thấy nội dung chương {readingChapter}</div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="glass-dark safe-bottom">
              <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                <button
                  onClick={(e) => { e.stopPropagation(); if (prevChapter) goToChapter(prevChapter); }}
                  disabled={!prevChapter}
                  className="flex items-center gap-1 text-white text-sm disabled:opacity-30 px-3 py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Trước
                </button>
                <span className="text-white text-xs opacity-70">{readingChapter} / {sortedChapters.length}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); if (nextChapter) goToChapter(nextChapter); }}
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
          </div>

          {/* Chapter List Drawer */}
          {showChapterList && (
            <div className="fixed inset-0 z-50 flex" onClick={() => setShowChapterList(false)}>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div className="relative w-80 max-w-[85vw] bg-white shadow-2xl overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="px-5 pt-5 pb-3 border-b border-romance-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-ink-800 text-lg">Mục lục</h3>
                      <p className="text-xs text-ink-400 mt-0.5">{readingBook.story.title}</p>
                      <p className="text-xs text-green-600 mt-1">📡 Offline · {sortedChapters.length} chương</p>
                    </div>
                    <button onClick={() => { if (readingChapter > 0) setShowChapterList(false); else { setReadingBook(null); router.push('/library'); } }} className="text-ink-400 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-romance">
                  {sortedChapters.map((ch) => {
                    const isCurrent = String(ch.chapterNumber) === String(readingChapter);
                    return (
                      <button
                        key={ch.chapterNumber}
                        onClick={() => goToChapter(ch.chapterNumber)}
                        className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all ${isCurrent ? 'bg-romance-50 border-r-3 border-romance-500' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center ${isCurrent ? 'bg-romance-500 text-white' : 'bg-gray-100 text-ink-400'}`}>
                          {ch.chapterNumber}
                        </span>
                        <span className={`text-sm flex-1 ${isCurrent ? 'text-romance-700 font-medium' : 'text-ink-600'}`}>
                          {ch.title}
                        </span>
                        {isCurrent && <span className="text-romance-500 text-xs">📖</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <ReadingSettings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // ==============================
  // DANH SÁCH SÁCH OFFLINE
  // ==============================
  if (readingBook && showChapterList) {
    // Redirect to reading mode with chapter list
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>
          {/* Reuse the chapter list from above */}
          {/* This will show when readingChapter is 0 */}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        <div className="bg-gradient-to-b from-romance-50/50 to-transparent px-4 pt-6 pb-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              📥 Kho truyện offline
            </h1>
            <p className="text-ink-400 text-sm">Đọc không cần internet · Tương thích Kindle</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải..." />
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <span className="text-6xl mb-4 animate-float">📱</span>
            <h2 className="text-xl font-semibold text-ink-600 mb-2">Chưa có truyện nào</h2>
            <p className="text-ink-400 text-sm text-center mb-4">Vào thư viện và tải truyện về để đọc offline</p>
            <button onClick={() => router.push('/library')} className="px-6 py-2.5 bg-romance-500 text-white rounded-2xl font-medium">
              📚 Về thư viện
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.storyId} className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
                <div className="flex gap-3 p-4">
                  <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                    {book.story?.cover ? (
                      <img src={book.story.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🌸</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink-800 text-sm">{book.story?.title}</h3>
                    <p className="text-xs text-ink-400">{book.story?.author}</p>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                      ✅ {book.chapters?.length} chương
                    </span>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => openBook(book.storyId)} className="flex-1 py-2 bg-gradient-to-r from-romance-500 to-romance-600 text-white text-sm font-medium rounded-xl">
                    📖 Đọc
                  </button>
                  <button onClick={() => removeBook(book.storyId)} className="px-3 py-2 border border-red-200 text-red-500 text-sm rounded-xl hover:bg-red-50">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
