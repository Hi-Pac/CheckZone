import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function PenaltiesManagement() {
  const [activeTab, setActiveTab] = useState('penalty');
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', amount: '', reason: '', month: new Date().toISOString().slice(0, 7) });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(() => {});
    fetchItems();
  }, [activeTab]);

  async function fetchItems() {
    try {
      const res = await api.get('/reports/penalties', { params: { type: activeTab } });
      setItems(res.data);
    } catch (err) { console.error(err); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reports/penalties', { ...formData, type: activeTab });
      await fetchItems();
      setShowModal(false);
      setFormData({ employeeId: '', amount: '', reason: '', month: new Date().toISOString().slice(0, 7) });
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
    setSubmitting(false);
  }

  async function deleteItem(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await api.delete(`/reports/penalties/${id}`);
      await fetchItems();
    } catch (err) { alert('حدث خطأ'); }
  }

  const tabLabel = activeTab === 'penalty' ? 'جزاء' : 'مكافأة';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">الجزاءات والمكافآت</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-800 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          + إضافة {tabLabel}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1 w-fit">
        <button onClick={() => setActiveTab('penalty')} className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'penalty' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          ⚠️ الجزاءات
        </button>
        <button onClick={() => setActiveTab('bonus')} className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'bonus' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          🎁 المكافآت
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">السبب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الشهر</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">لا توجد سجلات</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.employeeName}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${activeTab === 'penalty' ? 'text-red-600' : 'text-green-600'}`}>
                        {activeTab === 'penalty' ? '-' : '+'}{item.amount} ريال
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.reason || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.month}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteItem(item._id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">إضافة {tabLabel}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموظف *</label>
                <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" required>
                  <option value="">اختر موظفاً</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ريال) *</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السبب</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الشهر *</label>
                <input type="month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
                  {submitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
