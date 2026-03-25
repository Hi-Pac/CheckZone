import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AttendanceReports() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: '',
    type: ''
  });

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(() => {});
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.type) params.type = filters.type;
      const res = await api.get('/attendance', { params });
      setRecords(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function exportCSV() {
    const headers = ['الاسم', 'التاريخ', 'الوقت', 'النوع', 'متأخر', 'دقائق التأخير'];
    const rows = records.map(r => [
      r.employeeName,
      r.date,
      r.time,
      r.type === 'checkin' ? 'حضور' : 'انصراف',
      r.isLate ? 'نعم' : 'لا',
      r.minutesLate || 0
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${filters.startDate}_${filters.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">تقارير الحضور</h1>
        <button onClick={exportCSV} className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-500 transition-colors font-medium flex items-center gap-2">
          📥 تصدير CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">من تاريخ</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">إلى تاريخ</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">الموظف</label>
            <select value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800">
              <option value="">الكل</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">النوع</label>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800">
              <option value="">الكل</option>
              <option value="checkin">حضور</option>
              <option value="checkout">انصراف</option>
            </select>
          </div>
        </div>
        <button onClick={fetchRecords} className="bg-blue-800 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          🔍 بحث
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">عدد السجلات: <span className="font-bold text-gray-800">{records.length}</span></p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الوقت</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">النوع</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">التأخير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">لا توجد سجلات</td></tr>
                ) : (
                  records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.date}</td>
                      <td className="px-4 py-3 text-gray-600">{r.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.type === 'checkin' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {r.type === 'checkin' ? '✅ حضور' : '🔴 انصراف'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.isLate ? (
                          <span className="text-red-600 text-xs font-medium">متأخر {r.minutesLate} د</span>
                        ) : (
                          <span className="text-green-600 text-xs">في الوقت</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
