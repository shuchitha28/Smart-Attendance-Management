// Shared types & constants for AdminDashboard

import { LayoutDashboard, Building2, BookOpen, Users, AlertTriangle, ClipboardList, FileText } from 'lucide-react';

export interface Stats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalSessions: number;
  presentToday: number;
  absentToday: number;
}

export interface LowStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  className?: string;
  sectionName?: string;
  percentage: number;
  totalClasses: number;
  presentCount: number;
  email: string;
}

export interface CorrectionReq {
  id: string;
  reason: string;
  requestedStatus: string;
  status: string;
  createdAt: string;
  attendance: {
    student: { user: { name: string; email: string }; department: { name: string } };
    session: { course: { name: string; code: string }; faculty: { user: { name: string } } };
  };
}

export interface AuditRecord {
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  className: string;
  totalClasses: number;
  presentClasses: number;
  attendancePercentage: number;
  riskLevel: string;
  riskScore: number;
  reason: string;
}

export interface ThemeClasses {
  page: string;
  sidebar: string;
  card: string;
  cardInner: string;
  thead: string;
  trHover: string;
  divider: string;
  inputCls: string;
  selectCls: string;
  textPrimary: string;
  textSecondary: string;
  modalBg: string;
  overlayBg: string;
  isDark: boolean;
}

export const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'departments', label: 'Departments & Classes', icon: Building2 },
  { id: 'faculty', label: 'Faculty Directory', icon: BookOpen },
  { id: 'students', label: 'Students Directory', icon: Users },
  { id: 'low', label: 'Low Attendance', icon: AlertTriangle },
  { id: 'corrections', label: 'Correction Requests', icon: ClipboardList },
  { id: 'reports', label: 'Reports & Export', icon: FileText },
];
