'use client';

import Link from 'next/link';

export default function StoryCard({ story, showProgress = true }) {
  const progressPercent = story.totalChapters > 0
    ? Math.round((story.lastChapter / story.totalChapters) * 100)
    : 0;

  return (
    <Link href={`/story/${story.id}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-romance-50 hover:border-romance-200 hover:-translate-y-1">
        {/* Cover */}
        <div className="aspect-[3/4] bg-gradient-to-br from-romance-100 via-romance-50 to-parchment-100 relative overflow-hidden">
          {story.cover ? (
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <span className="text-5xl mb-3 group-hover:animate-float">🌸</span>
              <p className="text-center text-ink-400 text-xs font-medium leading-tight line-clamp-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                {story.title}
              </p>
            </div>
          )}

          {/* Genre Badge */}
          <div className="absolute top-2 right-2">
            <span className="text-[10px] bg-white/80 backdrop-blur-sm text-romance-600 px-2 py-0.5 rounded-full font-medium">
              {story.genre || 'Ngôn tình'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-ink-800 line-clamp-1 group-hover:text-romance-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">
            {story.author || 'Chưa rõ tác giả'}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-ink-300">
              {story.totalChapters} chương
            </span>
            {showProgress && story.lastChapter > 0 && (
              <span className="text-[10px] text-romance-500 font-medium">
                Đang đọc C.{story.lastChapter}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && story.lastChapter > 0 && (
            <div className="mt-2 h-1 bg-romance-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-romance-400 to-romance-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}