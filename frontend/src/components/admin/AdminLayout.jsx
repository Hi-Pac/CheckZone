import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/admin', label: 'لوحة التحكم', icon: '📊', exact: true },
  { path: '/admin/employees', label: 'الموظفون', icon: '👥' },
  { path: '/admin/attendance', label: 'تقارير الحضور', icon: '📋' },
  { path: '/admin/salary', label: 'إدارة الرواتب', icon: '💰' },
  { path: '/admin/penalties', label: 'الجزاءات والمكافآت', icon: '⚖️' },
  { path: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function AdminLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">CheckZone</h2>
                <p className="text-blue-300 text-xs">لوحة الإدارة</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(item) ? 'bg-white text-blue-900 font-medium' : 'text-blue-100 hover:bg-blue-800'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
            >
              <span>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            ☰
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
