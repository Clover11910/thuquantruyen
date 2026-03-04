'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import {
  getAllOfflineBooks,
  saveOfflineBook,
  isBookOffline,
  getOfflineProgress,
  getAllOfflineProgress
} from '@/lib/offlineStorage';

export default function LibraryPage() {
  const [onlineStories, setOnlineStories] = useState([]);
  const [offlineBooks, setOfflineBooks] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      // Tải danh sách offline từ IndexedDB (không tốn request)
      const localBooks = await getAllOfflineBooks();
      setOfflineBooks(localBooks);

      // Tải tiến độ đọc từ IndexedDB
      const allProgress = await getAllOfflineProgress();
      const progressMap = {};
      allProgress.forEach(p => { progressMap[p.storyId] = p; });
      setProgresses(progressMap);

      // Tải danh sách thư viện từ server (1 request duy nhất)
      // Cache vào localStorage để lần sau không cần gọi lại
      const cacheKey = 'library_cache';
      const cacheTime = 'library_cache_time';
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTime);
      const fiveMinutes = 5 * 60 * 1000;

      if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < fiveMinutes) {
        setOnlineStories(JSON.parse(cached));
      } else {
        const result = await api.getMyLibrary();
        if (result.success) {
          setOnlineStories(result.data);
          localStorage.setItem(cacheKey, JSON.stringify(result.data));
          localStorage.setItem(cacheTime, String(Date.now()));
        }
      }
    } catch (e) {
      console.error('Lỗi tải thư viện:', e);
    }
    setLoading(false);
  };

  const handleDownload = async (story) => {
    setDownloadingId(story.id);
    setDownloadProgress('Đang tải dữ liệu từ server...');
    try {
      const result = await api.downloadForOffline(story.id);
      if (result.success) {
        setDownloadProgress('Đang lưu vào thiết bị...');
        await saveOfflineBook(result.data);
        setDownloadProgress('Hoàn tất!');

        // Reload offline books
        const localBooks = await getAllOfflineBooks();
        setOfflineBooks(localBooks);

        setTimeout(() => {
          setDownloadingId(null);
          setDownloadProgress('');
        }, 1500);
      } else {
        alert(result.error || 'Lỗi khi tải');
        setDownloadingId(null);
        setDownloadProgress('');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
      setDownloadingId(null);
      setDownloadProgress('');
    }
  };

  const offlineStoryIds = offlineBooks.map(b => b.storyId);
  const needDownload = onlineStories.filter(s => !offlineStoryIds.includes(s.id));

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        <div className="bg-gradient-to-b from-romance-50/50 to-transparent px-4 pt-6 pb-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Thư viện của tôi
            </h1>
            <p className="text-ink-400 text-sm">
              {offlineBooks.length > 0
                ? `${offlineBooks.length} truyện đã tải · Đọc không cần mạng`
                : 'Tải truyện về để bắt đầu đọc'
              }
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải thư viện..." />
        ) : (
          <div className="max-w-6xl mx-auto px-4 space-y-8">

            {/* === TRUYỆN ĐÃ TẢI - ĐỌC NGAY (OFFLINE) === */}
            {offlineBooks.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <span>📖</span> Đọc ngay
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal">Offline</span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {offlineBooks.map((book) => {
                    const progress = progresses[book.storyId];
                    const lastChapter = progress?.lastChapter || 0;
                    const totalChapters = book.chapters?.length || 0;
                    const progressPercent = totalChapters > 0 ? Math.round((lastChapter / totalChapters) * 100) : 0;

                    return (
                      <button
                        key={book.storyId}
                        onClick={() => router.push(`/offline?read=${book.storyId}`)}
                        className="text-left group"
                      >
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-romance-50 hover:border-romance-200 hover:-translate-y-1">
                          <div className="aspect-[3/4] bg-gradient-to-br from-romance-100 via-romance-50 to-parchment-100 relative overflow-hidden">
                            {book.story?.cover ? (
                              <img src={book.story.cover} alt={book.story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <span className="text-5xl mb-3 group-hover:animate-float">🌸</span>
                                <p className="text-center text-ink-400 text-xs font-medium leading-tight line-clamp-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                                  {book.story?.title}
                                </p>
                              </div>
                            )}
                            {/* Offline badge */}
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">📡</span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm text-ink-800 line-clamp-1 group-hover:text-romance-600 transition-colors">
                              {book.story?.title}
                            </h3>
                            <p className="text-xs text-ink-400 mt-0.5">{book.story?.author}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-ink-300">{totalChapters} chương</span>
                              {lastChapter > 0 && (
                                <span className="text-[10px] text-romance-500 font-medium">C.{lastChapter}</span>
                              )}
                            </div>
                            {lastChapter > 0 && (
                              <div className="mt-2 h-1 bg-romance-50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-romance-400 to-romance-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* === TRUYỆN CHƯA TẢI - CẦN DOWNLOAD === */}
            {needDownload.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <span>📥</span> Cần tải về
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                  <p className="text-xs text-amber-700">
                    💡 Bấm <strong>"Tải về Kindle"</strong> để lưu truyện vào thiết bị. Sau khi tải xong, bạn có thể đọc mà không cần internet.
                  </p>
                </div>

                <div className="space-y-3">
                  {needDownload.map((story) => {
                    const isDownloading = downloadingId === story.id;

                    return (
                      <div key={story.id} className="bg-white rounded-2xl shadow-sm border border-romance-50 p-4">
                        <div className="flex gap-4">
                          <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                            {story.cover ? (
                              <img src={story.cover} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">🌸</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-ink-800 line-clamp-1">{story.title}</h3>
                            <p className="text-xs text-ink-400 mt-0.5">{story.author} · {story.totalChapters} chương</p>

                            {isDownloading ? (
                              <div className="mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="loading-heart text-romance-500">♥</span>
                                  <span className="text-sm text-romance-600">{downloadProgress}</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-romance-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-romance-400 to-romance-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDownload(story)}
                                className="mt-3 px-4 py-2 bg-gradient-to-r from-romance-500 to-romance-600 text-white text-sm font-medium rounded-xl hover:from-romance-600 hover:to-romance-700 transition-all active:scale-[0.98]"
                              >
                                📥 Tải về Kindle
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trống */}
            {offlineBooks.length === 0 && needDownload.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <span className="text-6xl mb-4 animate-float">📚</span>
                <h2 className="text-xl font-semibold text-ink-600 mb-2">Thư viện trống</h2>
                <p className="text-ink-400 text-sm text-center">
                  Liên hệ quản trị viên để được cấp truyện đọc
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
