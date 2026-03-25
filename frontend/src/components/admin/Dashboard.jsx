import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      const res = await api.get('/reports/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    { label: 'إجمالي الموظفين', value: summary?.totalEmployees || 0, icon: '👥', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-800' },
    { label: 'حاضرون اليوم', value: summary?.presentToday || 0, icon: '✅', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
    { label: 'غائبون اليوم', value: summary?.absentToday || 0, icon: '❌', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
    { label: 'المتأخرون', value: summary?.lateToday || 0, icon: '⏰', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  ];

  const chartData = (summary?.chartData || []).map(d => ({
    ...d,
    name: new Date(d.date).toLocaleDateString('ar-SA', { weekday: 'short' })
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} border rounded-2xl p-5`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className={`text-3xl font-bold ${card.textColor}`}>{card.value}</div>
            <div className="text-gray-600 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">الحضور خلال آخر 7 أيام</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'عدد الحضور']} />
            <Bar dataKey="present" fill="#1e40af" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
