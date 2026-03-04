'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import AdminRoute from '@/components/AdminRoute';

export default function AdminPage() {
  const menuItems = [
    {
      title: 'Quản lý người dùng',
      description: 'Tạo, xoá tài khoản người dùng',
      icon: '👥',
      href: '/admin/users',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Quản lý truyện',
      description: 'Thêm truyện, upload chương từ file ZIP',
      icon: '📚',
      href: '/admin/stories',
      color: 'from-romance-400 to-romance-600',
    },
    {
      title: 'Cấp quyền đọc',
      description: 'Gán truyện cho người dùng cụ thể',
      icon: '🔑',
      href: '/admin/grant',
      color: 'from-emerald-400 to-emerald-600',
    },
  ];

  return (
    <AdminRoute>
      <Header />
      <main className="min-h-screen pb-20 relative z-10">
        <div className="bg-gradient-to-b from-romance-50/50 to-transparent px-4 pt-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text" style={{ fontFamily: '"Playfair Display", serif' }}>
              ⚙️ Quản trị hệ thống
            </h1>
            <p className="text-ink-400 text-sm mt-1">Quản lý truyện, người dùng và phân quyền</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-2xl shadow-sm border border-romance-50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-ink-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-ink-400">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </AdminRoute>
  );
}