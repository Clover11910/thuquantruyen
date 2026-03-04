'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminRoute from '@/components/AdminRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

export default function AdminGrantPage() {
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersRes, storiesRes] = await Promise.all([
      api.listUsers(),
      api.listAllStories(),
    ]);
    if (usersRes.success) setUsers(usersRes.data.filter(u => u.role !== 'admin'));
    if (storiesRes.success) setStories(storiesRes.data);
    setLoading(false);
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setLoadingGrants(true);
    const result = await api.getUserStories(user.id);
    if (result.success) {
      setUserStories(result.data);
    }
    setLoadingGrants(false);
  };

  const handleGrant = async (storyId) => {
    const result = await api.grantStory(selectedUser.id, storyId);
    if (result.success) {
      setMessage({ text: 'Đã cấp quyền đọc!', type: 'success' });
      selectUser(selectedUser); // Reload
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleRevoke = async (storyId) => {
    if (!confirm('Thu hồi quyền đọc truyện này?')) return;
    const result = await api.revokeStory(selectedUser.id, storyId);
    if (result.success) {
      setMessage({ text: 'Đã thu hồi quyền', type: 'success' });
      selectUser(selectedUser);
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const grantedStoryIds = userStories.map(s => s.id);
  const ungrantedStories = stories.filter(s => !grantedStoryIds.includes(s.id));

  return (
    <AdminRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/admin" className="text-sm text-ink-400 hover:text-romance-600 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quản trị
          </Link>

          <h1 className="text-2xl font-bold text-ink-800 mb-1">🔑 Cấp quyền đọc</h1>
          <p className="text-sm text-ink-400 mb-6">Chọn người dùng, sau đó cấp/thu hồi truyện</p>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-2xl text-sm animate-fade-in ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
              <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">✕</button>
            </div>
          )}

          {loading ? (
            <LoadingSpinner text="Đang tải..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Danh sách người dùng */}
              <div>
                <h2 className="font-semibold text-ink-700 mb-3">👥 Chọn người dùng</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-ink-400 text-sm">
                      Chưa có người dùng nào
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => selectUser(user)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${
                            selectedUser?.id === user.id ? 'bg-romance-50 border-l-3 border-romance-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-romance-400 to-romance-600 flex items-center justify-center text-white font-bold text-sm">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-ink-800">{user.displayName}</p>
                            <p className="text-xs text-ink-400">@{user.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quản lý quyền đọc */}
              <div>
                {selectedUser ? (
                  <>
                    <h2 className="font-semibold text-ink-700 mb-3">
                      📚 Truyện của <span className="text-romance-600">{selectedUser.displayName}</span>
                    </h2>

                    {loadingGrants ? (
                      <LoadingSpinner text="Đang tải..." />
                    ) : (
                      <div className="space-y-4">
                        {/* Truyện đã cấp */}
                        {userStories.length > 0 && (
                          <div>
                            <h3 className="text-xs text-green-600 font-semibold mb-2 uppercase tracking-wide">✅ Đã cấp quyền</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                              <div className="divide-y divide-gray-50">
                                {userStories.map((story) => (
                                  <div key={story.id} className="px-4 py-2.5 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-ink-800 line-clamp-1">{story.title}</p>
                                      <p className="text-xs text-ink-400">{story.totalChapters} chương</p>
                                    </div>
                                    <button
                                      onClick={() => handleRevoke(story.id)}
                                      className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg ml-2 flex-shrink-0"
                                    >
                                      Thu hồi
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Truyện chưa cấp */}
                        {ungrantedStories.length > 0 && (
                          <div>
                            <h3 className="text-xs text-ink-400 font-semibold mb-2 uppercase tracking-wide">📖 Chưa cấp</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
                              <div className="divide-y divide-gray-50">
                                {ungrantedStories.map((story) => (
                                  <div key={story.id} className="px-4 py-2.5 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-ink-800 line-clamp-1">{story.title}</p>
                                      <p className="text-xs text-ink-400">{story.totalChapters} chương</p>
                                    </div>
                                    <button
                                      onClick={() => handleGrant(story.id)}
                                      className="text-xs text-romance-600 hover:bg-romance-50 px-2 py-1 rounded-lg ml-2 flex-shrink-0 font-medium"
                                    >
                                      + Cấp quyền
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {userStories.length === 0 && ungrantedStories.length === 0 && (
                          <div className="text-center py-8 text-ink-400 text-sm">
                            Chưa có truyện nào trong hệ thống
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="text-4xl mb-3">👆</span>
                    <p className="text-ink-400 text-sm">Chọn người dùng bên trái để quản lý quyền đọc</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}