import { useState, useEffect } from 'react';
import EmployeeCheckin from '../components/employee/EmployeeCheckin';
import api from '../utils/api';

export default function HomePage() {
  const [now, setNow] = useState(new Date());
  const [companyName, setCompanyName] = useState('CheckZone');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    api.get('/settings').then(r => {
      if (r.data.companyName) setCompanyName(r.data.companyName);
    }).catch(() => {});
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col items-center justify-start py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-4xl">📍</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">{companyName}</h1>
        <p className="text-blue-200 text-sm">نظام إدارة الحضور والانصراف</p>
      </div>

      {/* Date & Time */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 text-center mb-8 border border-white/20 shadow-lg">
        <div className="text-white/80 text-sm mb-1">{formatDate(now)}</div>
        <div className="text-white text-3xl font-bold font-mono">{formatTime(now)}</div>
      </div>

      {/* Check-in Component */}
      <div className="w-full max-w-md">
        <EmployeeCheckin />
      </div>

      {/* Admin Link */}
      <div className="mt-8">
        <a href="/admin" className="text-blue-300 hover:text-white text-sm transition-colors">
          لوحة الإدارة ←
        </a>
      </div>
    </div>
  );
}
