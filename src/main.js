import { calculateDistance } from './geo.js';
import { processAttendance } from './attendance.js';

// إحداثيات الشركة
const companyLocation = { latitude:30.8087063, longitude:31.0030066, radius:25 };
const elements = {
  checkButton: document.getElementById('checkButton'),
  locationStatus: document.getElementById('locationStatus'),
  locationStatusText: document.getElementById('locationStatusText'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  successCard: document.getElementById('successCard'),
  successTitle: document.getElementById('successTitle'),
  successTime: document.getElementById('successTime'),
  successDate: document.getElementById('successDate'),
  currentYear: document.getElementById('currentYear')
};

elements.currentYear.textContent = new Date().getFullYear();

function formatDateTime(date) {
  return {
    time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
    date: date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  };
}

function showStatus(message, type) {
  elements.locationStatus.classList.remove('hidden', 'bg-yellow-100', 'bg-green-100', 'bg-red-100');
  elements.locationStatus.classList.add(
    type==='success'? 'bg-green-100':'error'? 'bg-red-100':'bg-yellow-100'
  );
  elements.locationStatusText.textContent = message;
}

async function handleCheck() {
  elements.checkButton.classList.add('hidden');
  elements.loadingIndicator.classList.remove('hidden');

  if (!navigator.geolocation) {
    showStatus('متصفحك لا يدعم تحديد الموقع.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const d = calculateDistance(
      pos.coords.latitude, pos.coords.longitude,
      companyLocation.latitude, companyLocation.longitude
    );
    if (d > companyLocation.radius) {
      showStatus('غير داخل نطاق الشركة.', 'error');
      elements.loadingIndicator.classList.add('hidden');
      elements.checkButton.classList.remove('hidden');
      return;
    }
    showStatus('تم التحقق من موقعك!', 'success');
    const now = new Date();
    const dt = formatDateTime(now);
    try {
      await processAttendance({ latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        now.getHours()<11? 'حضور':'انصراف'
      );
      elements.successTitle.textContent = 'تم التسجيل بنجاح';
      elements.successTime.textContent = `الوقت: ${dt.time}`;
      elements.successDate.textContent = `التاريخ: ${dt.date}`;
      elements.successCard.classList.remove('hidden');
      elements.loadingIndicator.classList.add('hidden');
      setTimeout(()=>window.close(),5000);
    } catch (e) {
      showStatus(e.message, 'error');
      elements.loadingIndicator.classList.add('hidden');
      elements.checkButton.classList.remove('hidden');
    }
  }, err => {
    showStatus('خطأ في تحديد الموقع.', 'error');
    elements.loadingIndicator.classList.add('hidden');
    elements.checkButton.classList.remove('hidden');
  }, { enableHighAccuracy:true, timeout:10000 });
}

elements.checkButton.addEventListener('click', handleCheck);
