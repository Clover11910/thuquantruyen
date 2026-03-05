'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReadingSettings from '@/components/ReadingSettings';
import {
  getOfflineBook,
  saveOfflineProgress,
  getOfflineProgress,
  saveOfflineSettings,
  getOfflineSettings
} from '@/lib/offlineStorage';

export default function OfflineReadPage() {
  var params = useParams();
  var storyId = params.storyId;
  var router = useRouter();

  var [book, setBook] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [readingChapter, setReadingChapter] = useState(0);
  var [showChapterList, setShowChapterList] = useState(false);
  var [showSettings, setShowSettings] = useState(false);
  var [showControls, setShowControls] = useState(true);

  var [settings, setSettings] = useState({
    fontSize: 18,
    fontFamily: 'Georgia',
    bgColor: '#FFF8F0',
    textColor: '#4A3728',
    lineHeight: 1.8,
  });

  // Tải sách từ IndexedDB khi mở trang
  useEffect(function() {
    async function loadBook() {
      setLoading(true);
      try {
        // Tải cài đặt
        var savedSettings = await getOfflineSettings();
        if (savedSettings) {
          setSettings({
            fontSize: savedSettings.fontSize || 18,
            fontFamily: savedSettings.fontFamily || 'Georgia',
            bgColor: savedSettings.bgColor || '#FFF8F0',
            textColor: savedSettings.textColor || '#4A3728',
            lineHeight: savedSettings.lineHeight || 1.8,
          });
        }

        // Tải sách từ IndexedDB
        console.log('Loading offline book:', storyId);
        var offlineBook = await getOfflineBook(storyId);
        console.log('Book data:', offlineBook ? 'found' : 'not found');

        if (!offlineBook) {
          setError('Không tìm thấy truyện. Hãy quay lại thư viện và tải lại.');
          setLoading(false);
          return;
        }

        if (!offlineBook.chapters || offlineBook.chapters.length === 0) {
          setError('Truyện không có nội dung chương nào.');
          setLoading(false);
          return;
        }

        console.log('Book loaded:', offlineBook.story.title, '- Chapters:', offlineBook.chapters.length);
        setBook(offlineBook);

        // Tải tiến độ đọc
        var progress = await getOfflineProgress(storyId);
        console.log('Progress:', progress);
        if (progress && progress.lastChapter > 0) {
          setReadingChapter(progress.lastChapter);
        } else {
          setShowChapterList(true);
        }
      } catch (e) {
        console.error('Lỗi tải sách:', e);
        setError('Lỗi: ' + e.message);
      }
      setLoading(false);
    }
    loadBook();
  }, [storyId]);

  // Chuyển chương + lưu tiến độ
  var goToChapter = useCallback(function(chapNum) {
    var num = parseInt(chapNum);
    console.log('Go to chapter:', num);
    setReadingChapter(num);
    setShowChapterList(false);
    window.scrollTo(0, 0);

    saveOfflineProgress(storyId, num, 0).catch(function(e) {
      console.error('Lỗi lưu tiến độ:', e);
    });
  }, [storyId]);

  // Lưu cài đặt
  var handleSettingsChange = function(newSettings) {
    setSettings(newSettings);
    saveOfflineSettings(newSettings).catch(function(e) {
      console.error('Lỗi lưu settings:', e);
    });
  };

  // Format text thành đoạn văn
  var formatContent = function(text) {
    if (!text) return null;
    var lines = text.split('\n');
    var paragraphs = [];
    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (trimmed) {
        paragraphs.push(
          <p key={i} className="mb-3" style={{ textIndent: '2em' }}>{trimmed}</p>
        );
      }
    }
    return paragraphs;
  };

  // === LOADING ===
  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner text="Đang mở sách..." />
      </ProtectedRoute>
    );
  }

  // === LỖI ===
  if (error || !book) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-parchment-50">
          <span className="text-5xl mb-4">😢</span>
          <p className="text-ink-600 text-center mb-4">{error || 'Không tìm thấy truyện'}</p>
          <button
            onClick={function() { router.push('/library'); }}
            className="px-6 py-2.5 bg-romance-500 text-white rounded-2xl font-medium"
          >
            📚 Về thư viện
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  // Sắp xếp chương theo số
  var sortedChapters = book.chapters.slice().sort(function(a, b) {
    return (parseInt(a.chapterNumber) || 0) - (parseInt(b.chapterNumber) || 0);
  });

  // === DANH SÁCH CHƯƠNG ===
  if (readingChapter === 0 || showChapterList) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-parchment-50 pb-20">
          <div className="sticky top-0 z-40 glass border-b border-romance-100">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
              <button onClick={function() { router.push('/library'); }} className="text-ink-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-ink-800 text-sm line-clamp-1">{book.story.title}</h1>
                <p className="text-xs text-ink-400">{book.story.author}</p>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📡 Offline</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                {book.story.cover ? (
                  <img src={book.story.cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🌸</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-800" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {book.story.title}
                </h2>
                <p className="text-sm text-ink-400">{book.story.author}</p>
                <p className="text-xs text-green-600 mt-1">{sortedChapters.length} chương đã tải</p>
                {readingChapter > 0 && (
                  <button
                    onClick={function() { setShowChapterList(false); }}
                    className="mt-2 px-4 py-1.5 bg-romance-500 text-white text-xs rounded-full"
                  >
                    📖 Tiếp tục Chương {readingChapter}
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-ink-700 mb-3">📋 Chọn chương</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden divide-y divide-gray-50">
              {sortedChapters.map(function(ch) {
                var isCurrent = parseInt(ch.chapterNumber) === readingChapter;
                return (
                  <button
                    key={ch.chapterNumber}
                    onClick={function() { goToChapter(ch.chapterNumber); }}
                    className={'w-full text-left px-4 py-3 flex items-center gap-3 transition-all ' + (isCurrent ? 'bg-romance-50' : 'hover:bg-gray-50')}
                  >
                    <span className={'text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (isCurrent ? 'bg-romance-500 text-white' : 'bg-gray-100 text-ink-400')}>
                      {ch.chapterNumber}
                    </span>
                    <span className={'text-sm flex-1 ' + (isCurrent ? 'text-romance-700 font-medium' : 'text-ink-600')}>
                      {ch.title}
                    </span>
                    {isCurrent && <span className="text-xs text-romance-500">📖</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // === ĐỌC CHƯƠNG ===
  var chapter = null;
  var currentIdx = -1;
  for (var i = 0; i < sortedChapters.length; i++) {
    if (parseInt(sortedChapters[i].chapterNumber) === readingChapter) {
      chapter = sortedChapters[i];
      currentIdx = i;
      break;
    }
  }

  var prevChapter = currentIdx > 0 ? parseInt(sortedChapters[currentIdx - 1].chapterNumber) : null;
  var nextChapter = currentIdx < sortedChapters.length - 1 ? parseInt(sortedChapters[currentIdx + 1].chapterNumber) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>

        {/* Top Bar */}
        <div className={'fixed top-0 left-0 right-0 z-40 transition-all duration-300 ' + (showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0')}>
          <div className="glass-dark text-white px-4 h-12 flex items-center justify-between">
            <button onClick={function() { setShowChapterList(true); }} className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="line-clamp-1 max-w-[180px]">{book.story.title}</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-green-500/80 px-1.5 py-0.5 rounded-full mr-1">Offline</span>
              <button onClick={function() { setShowChapterList(true); }} className="p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button onClick={function() { setShowSettings(true); }} className="p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div
          onClick={function() { setShowControls(function(prev) { return !prev; }); }}
          className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-24 min-h-screen"
        >
          {chapter ? (
            <article>
              <header className="text-center mb-8 pt-4">
                <p className="text-sm opacity-60 mb-1">{book.story.title}</p>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {chapter.title}
                </h1>
                <div className="w-16 h-0.5 mx-auto mt-3 rounded-full opacity-30" style={{ backgroundColor: settings.textColor }} />
              </header>
              <div className="chapter-content" style={{ fontSize: settings.fontSize + 'px', fontFamily: settings.fontFamily, lineHeight: settings.lineHeight }}>
                {formatContent(chapter.content)}
              </div>
              <div className="text-center my-12 opacity-40">
                <span className="text-2xl">~ 🌸 ~</span>
              </div>
            </article>
          ) : (
            <div className="text-center py-20">
              <p className="opacity-60">Không tìm thấy chương {readingChapter}</p>
              <button onClick={function() { setShowChapterList(true); setReadingChapter(0); }} className="mt-4 px-4 py-2 bg-romance-500 text-white rounded-xl text-sm">
                Chọn chương khác
              </button>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className={'fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ' + (showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0')}>
          <div className="glass-dark safe-bottom">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={function(e) { e.stopPropagation(); if (prevChapter) goToChapter(prevChapter); }}
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
                onClick={function(e) { e.stopPropagation(); if (nextChapter) goToChapter(nextChapter); }}
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

        {/* Settings */}
        <ReadingSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isOpen={showSettings}
          onClose={function() { setShowSettings(false); }}
          isOffline={true}
        />
      </div>
    </ProtectedRoute>
  );
}
