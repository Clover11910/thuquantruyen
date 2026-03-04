'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminRoute from '@/components/AdminRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', cover: '', description: '', genre: 'Ngôn tình' });
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStoryId, setUploadStoryId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    const result = await api.listAllStories();
    if (result.success) setStories(result.data);
    setLoading(false);
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setMessage({ text: 'Vui lòng nhập tên truyện', type: 'error' });
      return;
    }
    setCreating(true);
    const result = await api.createStory(formData);
    if (result.success) {
      setMessage({ text: 'Tạo truyện thành công! Bây giờ hãy upload file ZIP chương.', type: 'success' });
      setFormData({ title: '', author: '', cover: '', description: '', genre: 'Ngôn tình' });
      setShowForm(false);
      loadStories();
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
    setCreating(false);
  };

  const handleUploadZip = async (storyId) => {
    setUploadStoryId(storyId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadStoryId) return;

    if (!file.name.endsWith('.zip')) {
      setMessage({ text: 'Chỉ hỗ trợ file .zip', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: 'Đang upload và xử lý file ZIP... Vui lòng đợi.', type: 'info' });

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = btoa(
          new Uint8Array(evt.target.result).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const result = await api.uploadZip(uploadStoryId, base64);
        if (result.success) {
          setMessage({ text: `Upload thành công! ${result.data.chaptersUploaded} chương đã được tải lên.`, type: 'success' });
          loadStories();
        } else {
          setMessage({ text: result.error, type: 'error' });
        }
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setMessage({ text: 'Lỗi đọc file: ' + err.message, type: 'error' });
      setUploading(false);
    }

    e.target.value = '';
  };

  const handleDeleteStory = async (storyId, title) => {
    if (!confirm(`Xoá truyện "${title}"? Toàn bộ chương và dữ liệu sẽ bị mất.`)) return;
    const result = await api.deleteStory(storyId);
    if (result.success) {
      setMessage({ text: 'Đã xoá truyện', type: 'success' });
      loadStories();
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

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

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-ink-800">📚 Quản lý truyện</h1>
              <p className="text-sm text-ink-400">{stories.length} truyện</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-romance-500 text-white text-sm font-medium rounded-xl hover:bg-romance-600 transition-colors"
            >
              {showForm ? '✕ Đóng' : '+ Thêm truyện'}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* Message */}
          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-2xl text-sm animate-fade-in ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                : message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
              <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">✕</button>
            </div>
          )}

          {/* Form tạo truyện */}
          {showForm && (
            <form onSubmit={handleCreateStory} className="bg-white rounded-2xl shadow-sm border border-romance-50 p-6 mb-6 animate-slide-up">
              <h3 className="font-semibold text-ink-800 mb-4">Thêm truyện mới</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-ink-500 mb-1 block">Tên truyện *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                      placeholder="Nhập tên truyện"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-500 mb-1 block">Tác giả</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                      placeholder="Tên tác giả"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-ink-500 mb-1 block">Link ảnh bìa (URL)</label>
                    <input
                      type="text"
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-500 mb-1 block">Thể loại</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 outline-none text-sm"
                    >
                      <option>Ngôn tình</option>
                      <option>Cổ đại</option>
                      <option>Hiện đại</option>
                      <option>Xuyên không</option>
                      <option>Trọng sinh</option>
                      <option>Huyền huyễn</option>
                      <option>Đam mỹ</option>
                      <option>Bách hợp</option>
                      <option>Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-ink-500 mb-1 block">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm resize-none"
                    placeholder="Mô tả ngắn về truyện..."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="mt-4 px-6 py-2.5 bg-romance-500 text-white text-sm font-medium rounded-xl hover:bg-romance-600 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Đang tạo...' : '✓ Tạo truyện'}
              </button>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700">
                  📁 <strong>Hướng dẫn chuẩn bị file ZIP:</strong><br />
                  Tạo các file .txt theo tên: <code>1.txt</code>, <code>2.txt</code>, <code>3.txt</code>... (hoặc <code>chuong1.txt</code>, <code>chuong2.txt</code>...)<br />
                  Mỗi file là nội dung 1 chương. Nén tất cả thành file .zip rồi upload.
                </p>
              </div>
            </form>
          )}

          {/* Danh sách truyện */}
          {loading ? (
            <LoadingSpinner text="Đang tải..." />
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-3 block">📖</span>
              <p className="text-ink-400">Chưa có truyện nào. Hãy thêm truyện mới!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-2xl shadow-sm border border-romance-50 p-4 hover:shadow-md transition-shadow"
                >
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
                      <p className="text-xs text-ink-400 mt-0.5">{story.author || 'Chưa rõ'} · {story.genre}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-romance-50 text-romance-600 px-2 py-0.5 rounded-full">
                          {story.totalChapters} chương
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUploadZip(story.id)}
                          disabled={uploading}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors font-medium"
                        >
                          {uploading && uploadStoryId === story.id ? '⏳ Đang upload...' : '📤 Upload ZIP'}
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id, story.title)}
                          className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️ Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}