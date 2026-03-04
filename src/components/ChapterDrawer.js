'use client';

import { useEffect, useRef } from 'react';

export default function ChapterDrawer({ chapters, currentChapter, storyTitle, isOpen, onClose, onSelect }) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-up overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-romance-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-ink-800 text-lg">Mục lục</h3>
              <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{storyTitle}</p>
              <p className="text-xs text-romance-500 mt-1">{chapters.length} chương</p>
            </div>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto scrollbar-romance">
          <div className="py-2">
            {chapters.map((ch) => {
              const isCurrent = ch.chapterNumber == currentChapter;
              return (
                <button
                  key={ch.chapterNumber}
                  ref={isCurrent ? activeRef : null}
                  onClick={() => { onSelect(ch.chapterNumber); onClose(); }}
                  className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all ${
                    isCurrent
                      ? 'bg-romance-50 border-r-3 border-romance-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'bg-romance-500 text-white'
                      : 'bg-gray-100 text-ink-400'
                  }`}>
                    {ch.chapterNumber}
                  </span>
                  <span className={`text-sm flex-1 ${
                    isCurrent ? 'text-romance-700 font-medium' : 'text-ink-600'
                  }`}>
                    {ch.title}
                  </span>
                  {isCurrent && <span className="text-romance-500 text-xs">📖</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}