'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import { saveOfflineBook, isBookOffline } from '@/lib/offlineStorage';

export default function StoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    setLoading(true);
    const [storyRes, chaptersRes] = await Promise.all([
      api.getStoryDetail(id),
      api.getChapterList(id),
    ]);

    if (storyRes.success) setStory(storyRes.data);
    if (chaptersRes.success) setChapters(chaptersRes.data);

    try {
      const offline = await isBookOffline(id);
      setIsOffline(offline);
    } catch {}

    setLoading(false);
  };

  const handleRead = (chapterNum) => {
    router.push(`/read/${id}/${chapterNum}`);
  };

  const handleContinue = () => {
    const chapter = story.lastChapter > 0 ? story.lastChapter : 1;
    handleRead(chapter);
  };

  const handleDownloadOffline = async () => {
    setDownloading(true);
    try {
      const result = await api.downloadForOffline(id);
      if (result.success) {
        await saveOfflineBook(result.data);
        setIsOffline(true);
        alert('Đã tải truyện để đọc offline thành công!');
      } else {
        alert(result.error || 'Lỗi khi tải');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
    setDownloading(false);
  };

  if (loading) return (
    <ProtectedRoute>
      <Header />
      <LoadingSpinner text="Đang tải thông tin truyện..." />
    </ProtectedRoute>
  );

  if (!story) return (
    <ProtectedRoute>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-3">😢</span>
        <p className="text-ink-500">Không tìm thấy truyện</p>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        {/* Story Header */}
        <div className="bg-gradient-to-b from-romance-50/80 via-romance-50/30 to-transparent">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover */}
              <div className="w-36 sm:w-44 mx-auto sm:mx-0 flex-shrink-0">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-romance-100 to-parchment-100">
                  {story.cover ? (
                    <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <span className="text-5xl mb-2">🌸</span>
                      <p className="text-center text-ink-400 text-xs">{story.title}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-ink-800 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {story.title}
                </h1>
                <p className="text-ink-500 text-sm mb-2">
                  {story.author || 'Chưa rõ tác giả'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <span className="text-xs bg-romance-100 text-romance-600 px-3 py-1 rounded-full">
                    {story.genre || 'Ngôn tình'}
                  </span>
                  <span className="text-xs text-ink-400">
                    {story.totalChapters} chương
                  </span>
                </div>

                {story.description && (
                  <p className="text-sm text-ink-500 mb-4 leading-relaxed">
                    {story.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleContinue}
                    className="flex-1 py-3 bg-gradient-to-r from-romance-500 to-romance-600 text-white font-semibold rounded-2xl hover:from-romance-600 hover:to-romance-700 transition-all shadow-lg shadow-romance-200/50 active:scale-[0.98]"
                  >
                    {story.lastChapter > 0 ? `📖 Tiếp tục Chương ${story.lastChapter}` : '📖 Bắt đầu đọc'}
                  </button>

                  <button
                    onClick={handleDownloadOffline}
                    disabled={downloading || isOffline}
                    className={`py-3 px-6 rounded-2xl font-medium transition-all active:scale-[0.98] ${
                      isOffline
                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                        : 'bg-white border-2 border-romance-200 text-romance-600 hover:bg-romance-50'
                    }`}
                  >
                    {downloading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="loading-heart">♥</span> Đang tải...
                      </span>
                    ) : isOffline ? (
                      '✅ Đã tải offline'
                    ) : (
                      '📥 Tải đọc offline (Kindle)'
                    )}
                  </button>
                </div>

                {!isOffline && (
                  <p className="text-[11px] text-ink-300 mt-2 italic">
                    💡 Tải về tài khoản để đọc khi không có mạng, tương thích Kindle & máy đọc sách
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <h2 className="text-lg font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <span>📋</span> Danh sách chương
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ink-400 text-sm">Chưa có chương nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {chapters.map((ch) => {
                  const isRead = story.lastChapter >= ch.chapterNumber;
                  const isCurrent = story.lastChapter === ch.chapterNumber;
                  return (
                    <button
                      key={ch.chapterNumber}
                      onClick={() => handleRead(ch.chapterNumber)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-romance-50/50 ${
                        isCurrent ? 'bg-romance-50' : ''
                      }`}
                    >
                      <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? 'bg-romance-500 text-white'
                          : isRead
                            ? 'bg-romance-100 text-romance-500'
                            : 'bg-gray-100 text-ink-400'
                      }`}>
                        {ch.chapterNumber}
                      </span>
                      <span className={`text-sm flex-1 ${
                        isCurrent ? 'text-romance-700 font-medium' : isRead ? 'text-ink-400' : 'text-ink-600'
                      }`}>
                        {ch.title}
                      </span>
                      {isCurrent && <span className="text-xs text-romance-500">📖 Đang đọc</span>}
                      {isRead && !isCurrent && <span className="text-xs text-ink-300">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}