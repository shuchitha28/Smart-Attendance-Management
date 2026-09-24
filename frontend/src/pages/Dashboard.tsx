import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import AdminDashboard from './admin/AdminDashboard';
import FacultyDashboard from './faculty/FacultyDashboard';
import StudentDashboard from './student/StudentDashboard';

const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'FACULTY':
      return <FacultyDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
