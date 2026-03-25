import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    companyName: '',
    companyLat: '',
    companyLng: '',
    companyRadius: 200,
    workStart: '08:00',
    workEnd: '17:00',
    lateThresholdMinutes: 15,
    whatsappApiUrl: '',
    whatsappApiToken: '',
    whatsappPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      setSettings(prev => ({ ...prev, ...r.data }));
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ في الحفظ');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">🏢 إعدادات الشركة</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة</label>
            <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">📍 إعدادات الموقع الجغرافي</h2>
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
            💡 للحصول على إحداثيات موقعك، افتح Google Maps واضغط على موقع الشركة بزر الفأرة الأيمن
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">خط العرض (Latitude)</label>
              <input type="number" step="any" value={settings.companyLat} onChange={e => setSettings({...settings, companyLat: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">خط الطول (Longitude)</label>
              <input type="number" step="any" value={settings.companyLng} onChange={e => setSettings({...settings, companyLng: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نطاق الحضور (بالمتر)</label>
            <input type="number" value={settings.companyRadius} onChange={e => setSettings({...settings, companyRadius: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" min="10" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">⏰ ساعات العمل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وقت بدء العمل</label>
              <input type="time" value={settings.workStart} onChange={e => setSettings({...settings, workStart: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وقت انتهاء العمل</label>
              <input type="time" value={settings.workEnd} onChange={e => setSettings({...settings, workEnd: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حد التأخير (دقائق)</label>
              <input type="number" value={settings.lateThresholdMinutes} onChange={e => setSettings({...settings, lateThresholdMinutes: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" min="0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">💬 إعدادات واتساب</h2>
          <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">
            ⚠️ اتركها فارغة إذا كنت لا تريد إشعارات واتساب
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط API واتساب</label>
            <input type="url" value={settings.whatsappApiUrl} onChange={e => setSettings({...settings, whatsappApiUrl: e.target.value})} placeholder="https://api.whatsapp.com/..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز API (Token)</label>
            <input type="text" value={settings.whatsappApiToken} onChange={e => setSettings({...settings, whatsappApiToken: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input type="text" value={settings.whatsappPhone} onChange={e => setSettings({...settings, whatsappPhone: e.target.value})} placeholder="+966XXXXXXXXX" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          {saved && (
            <span className="text-green-600 font-medium">✅ تم الحفظ بنجاح!</span>
          )}
        </div>
      </form>
    </div>
  );
}
