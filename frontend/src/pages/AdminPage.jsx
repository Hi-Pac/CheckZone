import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../components/admin/AdminLogin';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import EmployeesManagement from '../components/admin/EmployeesManagement';
import AttendanceReports from '../components/admin/AttendanceReports';
import SalaryManagement from '../components/admin/SalaryManagement';
import PenaltiesManagement from '../components/admin/PenaltiesManagement';
import SettingsPanel from '../components/admin/SettingsPanel';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const handleLogin = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeesManagement />} />
        <Route path="/attendance" element={<AttendanceReports />} />
        <Route path="/salary" element={<SalaryManagement />} />
        <Route path="/penalties" element={<PenaltiesManagement />} />
        <Route path="/settings" element={<SettingsPanel />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
