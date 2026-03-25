# CheckZone - نظام إدارة الحضور والانصراف

نظام متكامل لإدارة حضور الموظفين باستخدام GPS Geofencing وبصمة الجهاز.

## المميزات

- **تسجيل الحضور والانصراف** بالموقع الجغرافي (GPS Geofencing)
- **التعرف التلقائي** على الموظف عبر بصمة الجهاز
- **لوحة إدارة** شاملة باللغة العربية
- **تقارير الحضور** مع تصدير CSV
- **حساب الرواتب** تلقائياً مع خصم التأخير والغياب
- **إدارة الجزاءات والمكافآت**
- **إشعارات واتساب** (اختياري)
- **تطبيق PWA** قابل للتثبيت على الموبايل

## التشغيل السريع

### باستخدام Docker Compose

```bash
cp backend/.env.example backend/.env
docker-compose up -d
```

ثم افتح:
- **تطبيق الموظفين**: http://localhost:3000
- **لوحة الإدارة**: http://localhost:3000/admin (admin/admin123)

### تشغيل يدوي

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## الإعداد

1. عدّل `backend/.env` بإعدادات MongoDB وإحداثيات موقع شركتك
2. سجّل دخولك للوحة الإدارة وعدّل الإعدادات من قسم "الإعدادات"
3. أضف موظفيك أو اتركهم يسجلون بأنفسهم في أول زيارة

## التقنيات المستخدمة

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Deployment**: Docker, Nginx
