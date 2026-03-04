'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReadingSettings from '@/components/ReadingSettings';
import ChapterDrawer from '@/components/ChapterDrawer';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

export default function ReadPage() {
  const { storyId, chapter } = useParams();
  const router = useRouter();
  const contentRef = useRef(null);

  const [chapterData, setChapterData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settings, setSettings] = useState({
    fontSize: 18,
    fontFamily: 'Georgia',
    bgColor: '#FFF8F0',
    textColor: '#4A3728',
    lineHeight: 1.8,
  });

  // Load chapter content
  const loadChapter = useCallback(async (chapNum) => {
    setLoading(true);
    const result = await api.getChapterContent(storyId, chapNum);
    if (result.success) {
      setChapterData(result.data);
      // Save progress
      api.saveProgress(storyId, chapNum, 0);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  }, [storyId]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const [settingsRes, chaptersRes, storyRes] = await Promise.all([
        api.getSettings(),
        api.getChapterList(storyId),
        api.getStoryDetail(storyId),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
      if (chaptersRes.success) setChapters(chaptersRes.data);
      if (storyRes.success) setStoryTitle(storyRes.data.title);

      await loadChapter(chapter);
    };
    init();
  }, [storyId, chapter, loadChapter]);

  // Navigation
  const goToChapter = (chapNum) => {
    router.push(`/read/${storyId}/${chapNum}`);
  };

  // Toggle controls on tap
  const handleContentTap = (e) => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const height = rect.height;
    // Tap in middle third toggles controls
    if (y > height * 0.33 && y < height * 0.66) {
      setShowControls(prev => !prev);
    }
  };

  // Format content into paragraphs
  const formatContent = (text) => {
    if (!text) return '';
    return text.split('\n').filter(line => line.trim()).map((para, i) => (
      <p key={i} className="mb-3" style={{ textIndent: '2em' }}>
        {para.trim()}
      </p>
    ));
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
      >
        {/* Top Bar */}
        <div
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="glass-dark text-white px-4 h-12 flex items-center justify-between safe-top">
            <button
              onClick={() => router.push(`/story/${storyId}`)}
              className="flex items-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="line-clamp-1 max-w-[200px]">{storyTitle}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Mục lục"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Cài đặt"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          onClick={handleContentTap}
          className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-24 min-h-screen"
        >
          {loading ? (
            <LoadingSpinner text="Đang tải chương..." />
          ) : chapterData ? (
            <article>
              {/* Chapter Title */}
              <header className="text-center mb-8 pt-4">
                <p className="text-sm opacity-60 mb-1">{storyTitle}</p>
                <h1
                  className="text-xl sm:text-2xl font-bold mb-1"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {chapterData.title}
                </h1>
                <div className="w-16 h-0.5 mx-auto mt-3 rounded-full opacity-30" style={{ backgroundColor: settings.textColor }} />
              </header>

              {/* Chapter Content */}
              <div
                className="chapter-content"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  fontFamily: settings.fontFamily,
                  lineHeight: settings.lineHeight,
                }}
              >
                {formatContent(chapterData.content)}
              </div>

              {/* Chapter End Decoration */}
              <div className="text-center my-12 opacity-40">
                <span className="text-2xl">~ 🌸 ~</span>
              </div>
            </article>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg opacity-60">Không thể tải nội dung chương</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
            showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="glass-dark safe-bottom">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => chapterData?.prevChapter && goToChapter(chapterData.prevChapter)}
                disabled={!chapterData?.prevChapter}
                className="flex items-center gap-1 text-white text-sm disabled:opacity-30 hover:opacity-80 transition-opacity px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>

              <div className="text-center text-white">
                <span className="text-xs opacity-70">
                  {chapterData?.chapterNumber || chapter} / {chapterData?.totalChapters || '?'}
                </span>
              </div>

              <button
                onClick={() => chapterData?.nextChapter && goToChapter(chapterData.nextChapter)}
                disabled={!chapterData?.nextChapter}
                className="flex items-center gap-1 text-white text-sm disabled:opacity-30 hover:opacity-80 transition-opacity px-3 py-2"
              >
                Sau
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <ReadingSettings
          settings={settings}
          onSettingsChange={setSettings}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        {/* Chapter Drawer */}
        <ChapterDrawer
          chapters={chapters}
          currentChapter={chapter}
          storyTitle={storyTitle}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSelect={goToChapter}
        />
      </div>
    </ProtectedRoute>
  );
}