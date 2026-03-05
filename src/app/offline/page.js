'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAllOfflineBooks, removeOfflineBookLocal } from '@/lib/offlineStorage';
import api from '@/lib/api';

export default function OfflinePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(function() {
    loadBooks();
  }, []);

  async function loadBooks() {
    setLoading(true);
    try {
      var localBooks = await getAllOfflineBooks();
      console.log('Offline books found:', localBooks.length);
      setBooks(localBooks);
    } catch (e) {
      console.error('Lỗi:', e);
    }
    setLoading(false);
  }

  async function removeBook(storyId) {
    if (!confirm('Xoá truyện này khỏi thiết bị?')) return;
    try {
      await removeOfflineBookLocal(storyId);
      try { await api.removeOfflineBook(storyId); } catch (e) {}
      setBooks(function(prev) { return prev.filter(function(b) { return b.storyId !== storyId; }); });
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
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
            <button onClick={function() { router.push('/library'); }} className="px-6 py-2.5 bg-romance-500 text-white rounded-2xl font-medium">
              📚 Về thư viện
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(function(book) {
              return (
                <div key={book.storyId} className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
                  <div className="flex gap-3 p-4">
                    <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-romance-100 to-parchment-100 flex items-center justify-center flex-shrink-0">
                      {book.story && book.story.cover ? (
                        <img src={book.story.cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🌸</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink-800 text-sm">{book.story ? book.story.title : 'Không rõ'}</h3>
                      <p className="text-xs text-ink-400">{book.story ? book.story.author : ''}</p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                        ✅ {book.chapters ? book.chapters.length : 0} chương
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={function() { router.push('/offline/' + book.storyId); }}
                      className="flex-1 py-2 bg-gradient-to-r from-romance-500 to-romance-600 text-white text-sm font-medium rounded-xl"
                    >
                      📖 Đọc
                    </button>
                    <button
                      onClick={function() { removeBook(book.storyId); }}
                      className="px-3 py-2 border border-red-200 text-red-500 text-sm rounded-xl hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
