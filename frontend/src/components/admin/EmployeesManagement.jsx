import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({ name: '', position: '', monthlySalary: '', branch: 'الرئيسية' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function openAddModal() {
    setEditingEmployee(null);
    setFormData({ name: '', position: '', monthlySalary: '', branch: 'الرئيسية' });
    setShowModal(true);
  }

  function openEditModal(emp) {
    setEditingEmployee(emp);
    setFormData({ name: emp.name, position: emp.position || '', monthlySalary: emp.monthlySalary || '', branch: emp.branch || 'الرئيسية' });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      await fetchEmployees();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
    setSubmitting(false);
  }

  async function deleteEmployee(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/employees/${id}`);
      await fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  }

  const filtered = employees.filter(e => e.name.includes(search) || e.position?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
        <button onClick={openAddModal} className="bg-blue-800 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
          <span>+</span> إضافة موظف
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث عن موظف..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">المسمى الوظيفي</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الفرع</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الراتب</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">لا يوجد موظفون</td></tr>
                ) : (
                  filtered.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.position || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.branch}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.monthlySalary ? `${emp.monthlySalary} ريال` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {emp.active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(emp)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors">تعديل</button>
                          <button onClick={() => deleteEmployee(emp._id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الشهري</label>
                <input type="number" value={formData.monthlySalary} onChange={e => setFormData({...formData, monthlySalary: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
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
