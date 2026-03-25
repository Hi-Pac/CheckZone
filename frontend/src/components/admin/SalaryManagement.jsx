import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function SalaryManagement() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  async function fetchReport() {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/salary/${selectedEmployee}`, { params: { year, month } });
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
    setLoading(false);
  }

  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">إدارة الرواتب</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الموظف</label>
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800">
              <option value="">اختر موظفاً</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800">
              {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2030" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
        </div>
        <button onClick={fetchReport} disabled={!selectedEmployee || loading} className="bg-blue-800 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium">
          {loading ? 'جاري الحساب...' : 'حساب الراتب'}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{report.employee.name}</h2>
              <p className="text-gray-500 text-sm">{report.month}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">الراتب الأساسي</p>
              <p className="text-2xl font-bold text-blue-800">{report.employee.monthlySalary?.toLocaleString()} ريال</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'أيام العمل الفعلية', value: `${report.workDays} / ${report.expectedWorkDays}`, icon: '📅', color: 'bg-blue-50' },
              { label: 'إجمالي ساعات العمل', value: `${report.totalHours} ساعة`, icon: '⏱️', color: 'bg-green-50' },
              { label: 'دقائق التأخير', value: `${report.lateMinutes} دقيقة`, icon: '⏰', color: 'bg-orange-50' },
              { label: 'أيام الغياب', value: `${report.absences} يوم`, icon: '❌', color: 'bg-red-50' },
              { label: 'الخصومات', value: `${report.deductions} ريال`, icon: '➖', color: 'bg-red-50' },
              { label: 'الجزاءات', value: `${report.penalties} ريال`, icon: '⚠️', color: 'bg-red-50' },
              { label: 'المكافآت', value: `${report.bonuses} ريال`, icon: '🎁', color: 'bg-green-50' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} rounded-xl p-4`}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-bold text-gray-800">{item.value}</div>
                <div className="text-gray-500 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between bg-blue-900 text-white rounded-2xl p-5">
              <span className="text-lg font-medium">صافي الراتب</span>
              <span className="text-3xl font-bold">{report.netSalary?.toLocaleString()} ريال</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
