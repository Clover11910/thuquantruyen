'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminRoute from '@/components/AdminRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', displayName: '' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await api.listUsers();
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setMessage({ text: 'Vui lòng nhập đầy đủ', type: 'error' });
      return;
    }
    setCreating(true);
    const result = await api.createUser(formData.username, formData.password, formData.displayName);
    if (result.success) {
      setMessage({ text: 'Tạo tài khoản thành công!', type: 'success' });
      setFormData({ username: '', password: '', displayName: '' });
      setShowForm(false);
      loadUsers();
    } else {
      setMessage({ text: result.error || 'Lỗi tạo tài khoản', type: 'error' });
    }
    setCreating(false);
  };

  const handleDelete = async (userId, username) => {
    if (username === 'admin') {
      alert('Không thể xoá tài khoản admin!');
      return;
    }
    if (!confirm(`Xoá tài khoản "${username}"? Toàn bộ dữ liệu sẽ bị mất.`)) return;
    const result = await api.deleteUser(userId);
    if (result.success) {
      setMessage({ text: 'Đã xoá tài khoản', type: 'success' });
      loadUsers();
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
              <h1 className="text-2xl font-bold text-ink-800">👥 Quản lý người dùng</h1>
              <p className="text-sm text-ink-400">{users.length} tài khoản</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-romance-500 text-white text-sm font-medium rounded-xl hover:bg-romance-600 transition-colors"
            >
              {showForm ? '✕ Đóng' : '+ Tạo mới'}
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-2xl text-sm animate-fade-in ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
              <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">✕</button>
            </div>
          )}

          {/* Form tạo user */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-romance-50 p-6 mb-6 animate-slide-up">
              <h3 className="font-semibold text-ink-800 mb-4">Tạo tài khoản mới</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-ink-500 mb-1 block">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                    placeholder="vd: user01"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500 mb-1 block">Mật khẩu *</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                    placeholder="Mật khẩu"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500 mb-1 block">Tên hiển thị</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-romance-400 focus:ring-1 focus:ring-romance-200 outline-none text-sm"
                    placeholder="Tên hiển thị"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="mt-4 px-6 py-2.5 bg-romance-500 text-white text-sm font-medium rounded-xl hover:bg-romance-600 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Đang tạo...' : '✓ Tạo tài khoản'}
              </button>
            </form>
          )}

          {/* Danh sách */}
          {loading ? (
            <LoadingSpinner text="Đang tải..." />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-romance-50 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {users.map((user) => (
                  <div key={user.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        user.role === 'admin' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-romance-400 to-romance-600'
                      }`}>
                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-ink-800">{user.displayName || user.username}</p>
                        <p className="text-xs text-ink-400">@{user.username} · {user.role === 'admin' ? '👑 Admin' : '👤 User'}</p>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}