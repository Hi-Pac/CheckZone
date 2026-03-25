import { useState, useEffect } from 'react';
import { getDeviceFingerprint } from '../../utils/fingerprint';
import { getCurrentPosition, isWithinRadius } from '../../utils/geolocation';
import api from '../../utils/api';

const STEPS = {
  LOADING: 'loading',
  LOCATION_ERROR: 'location_error',
  OUT_OF_RANGE: 'out_of_range',
  NEW_EMPLOYEE: 'new_employee',
  WELCOME: 'welcome',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function EmployeeCheckin() {
  const [step, setStep] = useState(STEPS.LOADING);
  const [message, setMessage] = useState('جاري تهيئة النظام...');
  const [employee, setEmployee] = useState(null);
  const [fingerprint, setFingerprint] = useState('');
  const [location, setLocation] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [settings, setSettings] = useState({ companyLat: 24.7136, companyLng: 46.6753, companyRadius: 200 });
  const [distance, setDistance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      setMessage('جاري تحميل الإعدادات...');
      const settingsRes = await api.get('/settings');
      const s = settingsRes.data;
      setSettings(s);

      setMessage('جاري الحصول على بصمة الجهاز...');
      const fp = await getDeviceFingerprint();
      setFingerprint(fp);

      setMessage('جاري تحديد موقعك الجغرافي...');
      let position;
      try {
        position = await getCurrentPosition();
      } catch (e) {
        setStep(STEPS.LOCATION_ERROR);
        return;
      }

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });

      const companyLat = parseFloat(s.companyLat || 24.7136);
      const companyLng = parseFloat(s.companyLng || 46.6753);
      const radius = parseInt(s.companyRadius || 200);

      const { isWithin, distance: dist } = isWithinRadius(latitude, longitude, companyLat, companyLng, radius);
      setDistance(dist);

      if (!isWithin) {
        setStep(STEPS.OUT_OF_RANGE);
        return;
      }

      setMessage('جاري التعرف على هويتك...');
      const identifyRes = await api.post('/employees/identify', { fingerprint: fp });
      
      if (identifyRes.data.employee) {
        setEmployee(identifyRes.data.employee);
        // Check last action today
        const today = new Date().toISOString().split('T')[0];
        const todayRes = await api.get('/attendance/today');
        const myRecords = todayRes.data.filter(r => r.employee === identifyRes.data.employee._id);
        if (myRecords.length > 0) {
          const last = myRecords[0];
          setLastAction(last.type);
        }
        setStep(STEPS.WELCOME);
      } else {
        setStep(STEPS.NEW_EMPLOYEE);
      }
    } catch (err) {
      setStep(STEPS.ERROR);
      setMessage('حدث خطأ: ' + (err.message || 'خطأ في الاتصال'));
    }
  }

  async function registerEmployee() {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/employees', {
        name: newName.trim(),
        position: newPosition.trim(),
        deviceFingerprint: fingerprint
      });
      setEmployee(res.data);
      setStep(STEPS.WELCOME);
    } catch (err) {
      alert('خطأ في التسجيل: ' + (err.response?.data?.message || err.message));
    }
    setIsSubmitting(false);
  }

  async function recordAttendance(type) {
    if (!employee || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;

      const res = await api.post('/attendance/checkin', {
        employeeId: employee._id,
        type,
        location,
        fingerprint,
        date,
        time
      });

      setSuccessMessage(res.data.message);
      setLastAction(type);
      setStep(STEPS.SUCCESS);
      setTimeout(() => setStep(STEPS.WELCOME), 4000);
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
    setIsSubmitting(false);
  }

  if (step === STEPS.LOADING) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  if (step === STEPS.LOCATION_ERROR) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">📍</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">تعذّر تحديد الموقع</h3>
        <p className="text-gray-600 mb-6">يرجى السماح بالوصول إلى موقعك الجغرافي لاستخدام النظام</p>
        <button onClick={init} className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          المحاولة مجدداً
        </button>
      </div>
    );
  }

  if (step === STEPS.OUT_OF_RANGE) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">🚫</div>
        <h3 className="text-xl font-bold text-orange-600 mb-2">خارج نطاق الشركة</h3>
        <p className="text-gray-600 mb-2">أنت خارج نطاق الشركة</p>
        <p className="text-gray-500 text-sm mb-6">المسافة الحالية: <span className="font-bold text-orange-600">{distance} متر</span></p>
        <button onClick={init} className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          تحديث الموقع
        </button>
      </div>
    );
  }

  if (step === STEPS.NEW_EMPLOYEE) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👋</div>
          <h3 className="text-xl font-bold text-gray-800">مرحباً بك!</h3>
          <p className="text-gray-500 text-sm mt-1">يبدو أنك هنا لأول مرة. يرجى تسجيل بياناتك</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
            <input
              type="text"
              value={newPosition}
              onChange={e => setNewPosition(e.target.value)}
              placeholder="مثال: مهندس، محاسب..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800 text-right"
            />
          </div>
          <button
            onClick={registerEmployee}
            disabled={!newName.trim() || isSubmitting}
            className="w-full bg-blue-800 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </div>
      </div>
    );
  }

  if (step === STEPS.SUCCESS) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-pulse-once">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">{successMessage}</h3>
        <p className="text-gray-500">شكراً، {employee?.name}</p>
      </div>
    );
  }

  if (step === STEPS.ERROR) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button onClick={init} className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // WELCOME step
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">أهلاً، {employee?.name}!</h3>
        {employee?.position && <p className="text-gray-500 text-sm mt-1">{employee.position}</p>}
      </div>

      {lastAction && (
        <div className={`text-center text-sm mb-4 py-2 px-4 rounded-lg ${lastAction === 'checkin' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          آخر تسجيل اليوم: {lastAction === 'checkin' ? '✅ حضور' : '🔴 انصراف'}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => recordAttendance('checkin')}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
        >
          <span>✅</span>
          تسجيل الحضور
        </button>
        <button
          onClick={() => recordAttendance('checkout')}
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
        >
          <span>🔴</span>
          تسجيل الانصراف
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-xs">📍 موقعك محدد • المسافة: {distance} متر من الشركة</p>
      </div>
    </div>
  );
}
