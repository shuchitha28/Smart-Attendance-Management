import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle, XCircle, Clock, AlertTriangle,
  LayoutDashboard, FileText, LogOut,
  Building2, ClipboardList, Plus, Search, Download, Check, X, Shield,
  Layers, AlertCircle, BarChart3
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

interface Stats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalSessions: number;
  presentToday: number;
  absentToday: number;
}

interface LowStudent {
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

interface CorrectionReq {
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

interface AuditRecord {
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

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'departments', label: 'Departments & Classes', icon: Building2 },
  { id: 'faculty', label: 'Faculty Directory', icon: BookOpen },
  { id: 'students', label: 'Students Directory', icon: Users },
  { id: 'low', label: 'Low Attendance', icon: AlertTriangle },
  { id: 'corrections', label: 'Correction Requests', icon: ClipboardList },
  { id: 'reports', label: 'Reports & Export', icon: FileText },
];

const AdminDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStudents, setLowStudents] = useState<LowStudent[]>([]);
  const [corrections, setCorrections] = useState<CorrectionReq[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [departmentsTree, setDepartmentsTree] = useState<any[]>([]);
  const [auditData, setAuditData] = useState<AuditRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Categorization filters
  const [studentDeptFilter, setStudentDeptFilter] = useState('ALL');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('ALL');
  const [correctionStatusFilter, setCorrectionStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [lowSeverityFilter, setLowSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  // Reports tab state
  const [reportType, setReportType] = useState<'attendance' | 'students' | 'defaulters' | 'faculty'>('attendance');
  const [reportSearch, setReportSearch] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState('ALL');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // Modals
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // Forms
  const [facForm, setFacForm] = useState({ name: '', email: '', password: 'admin123', employeeId: '', departmentId: '' });
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [courseForm, setCourseForm] = useState({ name: '', code: '', departmentId: '' });
  const [formMsg, setFormMsg] = useState({ text: '', isError: false });

  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // ─── Theme-aware class helpers ──────────────────────────
  const page = isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900';
  const sidebar = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const card = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const cardInner = isDark ? 'bg-slate-800/60 border-slate-700/70' : 'bg-gray-50 border-gray-200';
  const thead = isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-500';
  const trHover = isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50';
  const divider = isDark ? 'border-slate-800' : 'border-gray-200';
  const inputCls = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-amber-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-500';
  const selectCls = isDark
    ? 'bg-slate-800 border-slate-700 text-slate-100'
    : 'bg-white border-gray-300 text-gray-900';
  const textPrimary = isDark ? 'text-slate-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const modalBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900';
  const overlayBg = isDark ? 'bg-black/75' : 'bg-black/40';

  useEffect(() => {
    fetchStats();
    // Pre-populate core datasets on initial load so counts and exports are instantly populated
    axios.get(`${API_BASE_URL}/api/students`, auth).then(r => setStudents(r.data)).catch(() => {});
    axios.get(`${API_BASE_URL}/api/attendance/low`, auth).then(r => setLowStudents(r.data)).catch(() => {});
    axios.get(`${API_BASE_URL}/api/analytics/early-warning`, auth).then(r => setAuditData(r.data)).catch(() => {});
  }, []);

  const fetchStats = () => {
    axios.get(`${API_BASE_URL}/api/stats`).then(r => setStats(r.data)).catch(console.error);
  };

  useEffect(() => {
    if (tab === 'low' || tab === 'reports') {
      axios.get(`${API_BASE_URL}/api/attendance/low`, auth).then(r => setLowStudents(r.data)).catch(console.error);
    }
    if (tab === 'corrections') {
      axios.get(`${API_BASE_URL}/api/attendance/corrections`, auth).then(r => setCorrections(r.data)).catch(console.error);
    }
    if (tab === 'students' || tab === 'reports') {
      axios.get(`${API_BASE_URL}/api/students`, auth).then(r => setStudents(r.data)).catch(console.error);
    }
    if (tab === 'faculty' || tab === 'reports') {
      axios.get(`${API_BASE_URL}/api/admin/faculty`, auth).then(r => setFacultyList(r.data)).catch(console.error);
    }
    if (tab === 'departments' || tab === 'reports') {
      axios.get(`${API_BASE_URL}/api/admin/departments-tree`, auth).then(r => setDepartmentsTree(r.data)).catch(console.error);
    }
    if (tab === 'reports') {
      axios.get(`${API_BASE_URL}/api/analytics/early-warning`, auth).then(r => setAuditData(r.data)).catch(console.error);
    }
  }, [tab]);

  const handleCorrection = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`${API_BASE_URL}/api/attendance/correction/${id}`, { status }, auth);
      setCorrections(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ text: '', isError: false });
    try {
      await axios.post(`${API_BASE_URL}/api/admin/faculty`, facForm, auth);
      setFormMsg({ text: 'Faculty member created successfully!', isError: false });
      axios.get(`${API_BASE_URL}/api/admin/faculty`, auth).then(r => setFacultyList(r.data));
      fetchStats();
      setTimeout(() => setShowAddFacultyModal(false), 1500);
    } catch (err: any) {
      setFormMsg({ text: err.response?.data?.error || 'Failed to create faculty', isError: true });
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ text: '', isError: false });
    try {
      await axios.post(`${API_BASE_URL}/api/admin/departments`, deptForm, auth);
      setFormMsg({ text: 'Department added successfully!', isError: false });
      axios.get(`${API_BASE_URL}/api/admin/departments-tree`, auth).then(r => setDepartmentsTree(r.data));
      fetchStats();
      setTimeout(() => setShowAddDeptModal(false), 1500);
    } catch (err: any) {
      setFormMsg({ text: err.response?.data?.error || 'Failed to create department', isError: true });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ text: '', isError: false });
    try {
      await axios.post(`${API_BASE_URL}/api/admin/courses`, courseForm, auth);
      setFormMsg({ text: 'Course added successfully!', isError: false });
      axios.get(`${API_BASE_URL}/api/admin/departments-tree`, auth).then(r => setDepartmentsTree(r.data));
      setTimeout(() => setShowAddCourseModal(false), 1500);
    } catch (err: any) {
      setFormMsg({ text: err.response?.data?.error || 'Failed to create course', isError: true });
    }
  };



  const exportStudentsCSV = async (type: 'pdf' | 'excel' = 'excel') => {
    setExportLoading(true);
    setExportSuccessMsg('');
    try {
      let list = students;
      if (!list || list.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/students`, auth);
        list = res.data;
        setStudents(res.data);
      }
      if (!list || list.length === 0) {
        alert('No student records found to export.');
        return;
      }
      const headers = ['Student Name', 'Email', 'Roll Number', 'Department', 'Class', 'Section'];
      const rows = list.map(s => [
        s.user?.name || '',
        s.user?.email || '',
        s.rollNumber || '',
        s.department?.name || '',
        s.class?.name || '',
        s.section?.name || '',
      ]);
      const meta = { title: 'Student Master Directory', filename: `students_master_roster_${new Date().toISOString().slice(0, 10)}`, summaryStats: [{ label: 'Total Enrolled', value: list.length }] };
      if (type === 'pdf') exportToPDF(meta as any, headers as any, rows as any);
      else exportToExcel(meta.filename, 'Students', headers as any, rows as any);
      setExportSuccessMsg(`Successfully exported ${rows.length} student records.`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to export students data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportDefaultersCSV = async (type: 'pdf' | 'excel' = 'excel') => {
    setExportLoading(true);
    setExportSuccessMsg('');
    try {
      let list = lowStudents;
      if (!list || list.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/attendance/low`, auth);
        list = res.data;
        setLowStudents(res.data);
      }
      if (!list || list.length === 0) {
        alert('No attendance defaulters found in the system (all students meet the 75% cutoff).');
        return;
      }
      const headers = ['Student Name', 'Email', 'Roll Number', 'Department', 'Class', 'Attendance %', 'Attended Classes', 'Total Classes', 'Risk Severity'];
      const rows = list.map(s => [
        s.name,
        s.email,
        s.rollNumber,
        s.department,
        s.className || '',
        `${s.percentage}%`,
        s.presentCount,
        s.totalClasses,
        s.percentage < 60 ? 'Critical Risk (<60%)' : 'Warning Watchlist (60-74%)',
      ]);
      const meta = { title: 'Low Attendance Defaulters', filename: `attendance_defaulters_${new Date().toISOString().slice(0, 10)}`, summaryStats: [{ label: 'Total Defaulters', value: list.length }] };
      if (type === 'pdf') exportToPDF(meta as any, headers as any, rows as any);
      else exportToExcel(meta.filename, 'Defaulters', headers as any, rows as any);
      setExportSuccessMsg(`Successfully exported ${rows.length} defaulter records.`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to export defaulters data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportAuditCSV = async (type: 'pdf' | 'excel' = 'excel') => {
    setExportLoading(true);
    setExportSuccessMsg('');
    try {
      let list = auditData;
      if (!list || list.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/analytics/early-warning`, auth);
        list = res.data;
        setAuditData(res.data);
      }
      if (!list || list.length === 0) {
        alert('No attendance audit records available to export.');
        return;
      }
      const headers = ['Student Name', 'Roll Number', 'Email', 'Department', 'Class', 'Total Classes', 'Attended Classes', 'Attendance %', 'Compliance Status', 'AI Risk Assessment'];
      const rows = list.map(s => [
        s.name,
        s.rollNumber,
        s.email,
        s.department,
        s.className,
        s.totalClasses,
        s.presentClasses,
        `${s.attendancePercentage}%`,
        s.attendancePercentage >= 75 ? 'Satisfactory (>=75%)' : s.attendancePercentage >= 60 ? 'Warning (60-74%)' : 'Critical Defaulter (<60%)',
        s.reason || s.riskLevel,
      ]);
      const meta = { title: 'Institutional Attendance Audit', filename: `attendance_audit_${new Date().toISOString().slice(0, 10)}`, summaryStats: [{ label: 'Total Records', value: list.length }] };
      if (type === 'pdf') exportToPDF(meta as any, headers as any, rows as any);
      else exportToExcel(meta.filename, 'Audit', headers as any, rows as any);
      setExportSuccessMsg(`Successfully exported ${rows.length} audit records.`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to export attendance audit data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportFacultyCSV = async (type: 'pdf' | 'excel' = 'excel') => {
    setExportLoading(true);
    setExportSuccessMsg('');
    try {
      let list = facultyList;
      if (!list || list.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/admin/faculty`, auth);
        list = res.data;
        setFacultyList(res.data);
      }
      if (!list || list.length === 0) {
        alert('No faculty records found to export.');
        return;
      }
      const headers = ['Faculty Name', 'Employee ID', 'Email', 'Department', 'Sessions Held'];
      const rows = list.map(f => [
        f.user?.name || '',
        f.employeeId || '',
        f.user?.email || '',
        f.department?.name || '',
        f._count?.sessions || 0,
      ]);
      const meta = { title: 'Faculty Directory & Workload', filename: `faculty_directory_${new Date().toISOString().slice(0, 10)}`, summaryStats: [{ label: 'Total Faculty', value: list.length }] };
      if (type === 'pdf') exportToPDF(meta as any, headers as any, rows as any);
      else exportToExcel(meta.filename, 'Faculty', headers as any, rows as any);
      setExportSuccessMsg(`Successfully exported ${rows.length} faculty records.`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to export faculty data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Categorized Directory Metrics
  const academicStatCards = [
    { label: 'Total Enrolled Students', value: stats?.totalStudents ?? '—', icon: Users, gradient: 'from-blue-500 to-indigo-600', note: 'Active across all branches' },
    { label: 'Faculty Members', value: stats?.totalFaculty ?? '—', icon: BookOpen, gradient: 'from-purple-500 to-violet-600', note: 'Instructors & lecturers' },
    { label: 'Academic Departments', value: stats?.totalDepartments ?? '—', icon: Building2, gradient: 'from-amber-500 to-orange-600', note: 'Accredited branches' },
  ];

  // Categorized Attendance Metrics
  const attendanceStatCards = [
    { label: 'Total Sessions Recorded', value: stats?.totalSessions ?? '—', icon: Clock, gradient: 'from-cyan-500 to-blue-600', note: 'Aggregate term lectures' },
    { label: 'Present Today', value: stats?.presentToday ?? '—', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', note: 'Attended live sessions' },
    { label: 'Absent Today', value: stats?.absentToday ?? '—', icon: XCircle, gradient: 'from-rose-500 to-red-600', note: 'Unexcused absences' },
  ];

  // Categorized student filtering
  const studentDepartments = Array.from(new Set(students.map(s => s.department?.name).filter(Boolean)));
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = studentDeptFilter === 'ALL' || s.department?.name === studentDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Categorized faculty filtering
  const facultyDepartments = Array.from(new Set(facultyList.map(f => f.department?.name).filter(Boolean)));
  const filteredFaculty = facultyList.filter(f => {
    const matchesSearch = f.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = facultyDeptFilter === 'ALL' || f.department?.name === facultyDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Categorized low attendance filtering
  const criticalDefaulters = lowStudents.filter(s => s.percentage < 60);
  const warningDefaulters = lowStudents.filter(s => s.percentage >= 60 && s.percentage < 75);
  const filteredLowStudents = lowStudents.filter(s => {
    if (lowSeverityFilter === 'CRITICAL') return s.percentage < 60;
    if (lowSeverityFilter === 'WARNING') return s.percentage >= 60 && s.percentage < 75;
    return true;
  });

  // Categorized correction requests filtering
  const pendingCorrectionsCount = corrections.filter(c => c.status === 'PENDING').length;
  const approvedCorrectionsCount = corrections.filter(c => c.status === 'APPROVED').length;
  const rejectedCorrectionsCount = corrections.filter(c => c.status === 'REJECTED').length;

  const filteredCorrections = corrections.filter(c => {
    if (correctionStatusFilter === 'ALL') return true;
    return c.status === correctionStatusFilter;
  });

  // Categorized report data filtering for the Live Report Table
  const filteredReportAudit = auditData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          item.rollNumber.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          item.email.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesDept = reportDeptFilter === 'ALL' || item.department === reportDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredReportStudents = students.filter(s => {
    const matchesSearch = s.user?.name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          s.user?.email?.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesDept = reportDeptFilter === 'ALL' || s.department?.name === reportDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredReportDefaulters = lowStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          s.email.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesDept = reportDeptFilter === 'ALL' || s.department === reportDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredReportFaculty = facultyList.filter(f => {
    const matchesSearch = f.user?.name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          f.employeeId?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          f.user?.email?.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesDept = reportDeptFilter === 'ALL' || f.department?.name === reportDeptFilter;
    return matchesSearch && matchesDept;
  });


  const ExportDropdown = ({ onExport, label = "Export", icon: Icon = Download, color = "cyan", primary = false, fullWidth = false }: any) => {
    const [open, setOpen] = useState(false);
    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          disabled={exportLoading}
          className={primary 
            ? `px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 ${fullWidth ? 'w-full justify-center' : ''}`
            : fullWidth 
              ? `w-full py-2 bg-${color}-600 hover:bg-${color}-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-${color}-600/20 disabled:opacity-50`
              : `px-4 py-2 rounded-xl ${cardInner} ${textPrimary} text-xs font-bold transition flex items-center space-x-2 border disabled:opacity-50 hover:bg-${color}-500/10`
          }
        >
          {exportLoading && primary ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon className={primary || fullWidth ? "w-4 h-4" : `w-4 h-4 text-${color}-500`} />
          )}
          <span>{exportLoading && primary ? 'Generating...' : label}</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              className={`absolute right-0 mt-2 ${fullWidth ? 'w-full' : 'w-40'} rounded-xl shadow-lg border z-20 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); onExport('pdf'); }} className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center space-x-2 transition ${isDark ? 'text-red-400 hover:bg-slate-700/50' : 'text-red-600 hover:bg-red-50'}`}>
                <span>Download PDF</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); onExport('excel'); }} className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center space-x-2 transition ${isDark ? 'text-emerald-400 hover:bg-slate-700/50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                <span>Download Excel</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${page} flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 ${sidebar} border-r p-6 flex flex-col justify-between shrink-0 transition-colors duration-200`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">Admin Console</h1>
                <p className={`text-xs ${textSecondary}`}>Smart Attendance</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSearchQuery(''); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'low' && lowStudents.length > 0 && (
                  <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {lowStudents.length}
                  </span>
                )}
                {item.id === 'corrections' && pendingCorrectionsCount > 0 && (
                  <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {pendingCorrectionsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className={`pt-6 border-t ${divider} mt-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className={`font-semibold text-sm truncate ${textPrimary}`}>{user?.name}</p>
              <p className="text-xs text-amber-500 font-medium">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {tab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-2">
                    CAMPUS ADMINISTRATION
                  </span>
                  <h1 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>Institutional Overview</h1>
                  <p className={`${textSecondary} text-sm mt-1`}>Categorized operational metrics and live attendance performance.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTab('reports')}
                    className={`px-4 py-2 rounded-xl border ${cardInner} ${textPrimary} text-xs font-bold transition flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Audit Reports</span>
                  </button>
                </div>
              </div>

              {/* Categorized Metric Set 1: Campus Directory */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Category 1: Academic Directory Metrics</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {academicStatCards.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`${card} border rounded-2xl p-6 transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{c.label}</p>
                          <h3 className={`text-3xl font-extrabold mt-2 ${textPrimary}`}>{c.value}</h3>
                          <p className={`text-xs mt-2 ${textSecondary}`}>{c.note}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white shadow-lg`}>
                          <c.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Categorized Metric Set 2: Daily Attendance Live Feed */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Category 2: Live Daily Attendance Tracking</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {attendanceStatCards.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className={`${card} border rounded-2xl p-6 transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{c.label}</p>
                          <h3 className={`text-3xl font-extrabold mt-2 ${textPrimary}`}>{c.value}</h3>
                          <p className={`text-xs mt-2 ${textSecondary}`}>{c.note}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white shadow-lg`}>
                          <c.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Action Navigation Hub */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Category 3: System Management Modules</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${card} border p-6 rounded-2xl hover:border-purple-500/40 transition-all`}>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${textPrimary}`}>Faculty Directory</h3>
                    <p className={`text-xs ${textSecondary} mb-5`}>Assign lecturers, monitor active courses, and review sessions held across terms.</p>
                    <button onClick={() => setTab('faculty')} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition">
                      View Faculty Directory →
                    </button>
                  </div>

                  <div className={`${card} border p-6 rounded-2xl hover:border-amber-500/40 transition-all`}>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${textPrimary}`}>Department & Branch Tree</h3>
                    <p className={`text-xs ${textSecondary} mb-5`}>Organize academic departments, course curricula, year sections, and class groups.</p>
                    <button onClick={() => setTab('departments')} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition">
                      Manage Structure →
                    </button>
                  </div>

                  <div className={`${card} border p-6 rounded-2xl hover:border-rose-500/40 transition-all`}>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${textPrimary}`}>Low Attendance Defaulters</h3>
                    <p className={`text-xs ${textSecondary} mb-5`}>Categorized audit of students below institutional 75% cutoff with export options.</p>
                    <button onClick={() => setTab('low')} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition">
                      Review Defaulters →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DEPARTMENTS & CLASSES */}
          {tab === 'departments' && (
            <motion.div key="depts" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Academic Departments & Structure</h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Hierarchical catalog of departments, academic years, sections, and courses</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => { setFormMsg({ text: '', isError: false }); setShowAddDeptModal(true); }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-amber-600/20"
                  >
                    <Plus className="w-4 h-4" /> <span>Add Department</span>
                  </button>
                  <button
                    onClick={() => { setFormMsg({ text: '', isError: false }); setShowAddCourseModal(true); }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-purple-600/20"
                  >
                    <Plus className="w-4 h-4" /> <span>Add Course</span>
                  </button>
                </div>
              </div>

              {departmentsTree.length === 0 ? (
                <div className={`${card} border rounded-2xl p-12 text-center`}>
                  <Building2 className={`w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500`} />
                  <p className={`font-semibold ${textPrimary}`}>No departments recorded yet.</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>Click "Add Department" above to configure your campus structure.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {departmentsTree.map(dept => (
                    <div key={dept.id} className={`${card} border rounded-2xl p-6 transition-all duration-200`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs rounded-lg">
                            {dept.code}
                          </span>
                          <h3 className={`text-lg font-bold mt-2 ${textPrimary}`}>{dept.name}</h3>
                        </div>
                        <div className={`text-right text-xs ${textSecondary}`}>
                          <span className={`block font-semibold ${textPrimary}`}>{dept._count?.students || 0} Students</span>
                          <span>{dept._count?.faculties || 0} Faculty • {dept._count?.courses || 0} Courses</span>
                        </div>
                      </div>

                      <div className={`space-y-3 pt-3 border-t ${divider}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Classes & Sections</p>
                          <span className="text-xs text-amber-500 font-medium">{dept.classes?.length || 0} Batches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dept.classes && dept.classes.length > 0 ? (
                            dept.classes.map((c: any) => (
                              <div key={c.id} className={`${cardInner} px-3 py-1.5 rounded-xl text-xs border`}>
                                <span className={`font-semibold ${textPrimary}`}>{c.name}</span>
                                <span className={`${textSecondary} ml-2`}>
                                  ({c.sections?.map((s: any) => s.name).join(', ') || 'No sections'})
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className={`text-xs ${textSecondary} italic`}>No classes assigned to this branch yet.</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Registered Courses</p>
                          <span className="text-xs text-purple-500 font-medium">{dept.courses?.length || 0} Courses</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dept.courses && dept.courses.length > 0 ? (
                            dept.courses.map((crs: any) => (
                              <span key={crs.id} className={`px-2.5 py-1 rounded-lg ${cardInner} text-cyan-500 text-xs border font-mono`}>
                                {crs.code} — {crs.name}
                              </span>
                            ))
                          ) : (
                            <span className={`text-xs ${textSecondary} italic`}>No active courses linked.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: FACULTY DIRECTORY */}
          {tab === 'faculty' && (
            <motion.div key="faculty" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Faculty Directory</h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Manage instructors and review session attendance counts</p>
                </div>
                <button
                  onClick={() => { setFormMsg({ text: '', isError: false }); setShowAddFacultyModal(true); }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4" /> <span>Add Faculty Member</span>
                </button>
              </div>

              {/* Categorization & Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-3 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search by faculty name, employee ID, or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border ${inputCls}`}
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFacultyDeptFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      facultyDeptFilter === 'ALL'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : `${cardInner} ${textSecondary}`
                    }`}
                  >
                    All ({facultyList.length})
                  </button>
                  {facultyDepartments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setFacultyDeptFilter(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        facultyDeptFilter === dept
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : `${cardInner} ${textSecondary}`
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${card} border rounded-2xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`${thead} uppercase text-xs`}>
                      <tr>
                        <th className="p-4">Faculty Name</th>
                        <th className="p-4">Employee ID</th>
                        <th className="p-4">Department Category</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Sessions Held</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${divider}`}>
                      {filteredFaculty.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={`p-8 text-center ${textSecondary}`}>
                            No faculty members found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredFaculty.map(f => (
                          <tr key={f.id} className={`${trHover} transition`}>
                            <td className={`p-4 font-semibold ${textPrimary}`}>{f.user?.name}</td>
                            <td className="p-4 font-mono text-purple-500 text-xs font-bold">{f.employeeId}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 rounded-lg text-xs font-medium border border-purple-500/20">
                                {f.department?.name || 'General'}
                              </span>
                            </td>
                            <td className={`p-4 ${textSecondary} text-xs`}>{f.user?.email}</td>
                            <td className="p-4">
                              <span className={`font-semibold ${textPrimary}`}>{f._count?.sessions || 0}</span>
                              <span className={`text-xs ${textSecondary} ml-1`}>lectures</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: STUDENTS DIRECTORY */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Students Directory</h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Enrolled campus students categorized by department and section</p>
                </div>
                <ExportDropdown onExport={exportStudentsCSV} label="Export Master Roster" color="cyan" />
              </div>

              {/* Categorization & Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-3 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search by student name, roll number, or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border ${inputCls}`}
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setStudentDeptFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      studentDeptFilter === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : `${cardInner} ${textSecondary}`
                    }`}
                  >
                    All ({students.length})
                  </button>
                  {studentDepartments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setStudentDeptFilter(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        studentDeptFilter === dept
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : `${cardInner} ${textSecondary}`
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${card} border rounded-2xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`${thead} uppercase text-xs`}>
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Roll Number</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Class & Section</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${divider}`}>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className={`p-8 text-center ${textSecondary}`}>
                            No students match your active filter.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(s => (
                          <tr key={s.id} className={`${trHover} transition`}>
                            <td className="p-4">
                              <p className={`font-semibold ${textPrimary}`}>{s.user?.name}</p>
                              <p className={`text-xs ${textSecondary}`}>{s.user?.email}</p>
                            </td>
                            <td className="p-4 font-mono font-bold text-cyan-500 text-xs">{s.rollNumber}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-xs font-medium border border-cyan-500/20">
                                {s.department?.name || 'General'}
                              </span>
                            </td>
                            <td className={`p-4 ${textSecondary} text-xs`}>
                              <span className={`font-medium ${textPrimary}`}>{s.class?.name || 'Class N/A'}</span>
                              {s.section?.name && <span className="ml-1.5">• Sec {s.section?.name}</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: LOW ATTENDANCE ALERT */}
          {tab === 'low' && (
            <motion.div key="low" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-rose-500 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Low Attendance Defaulters (&lt;75%)</span>
                  </h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Categorized by urgency: Critical Risk (&lt;60%) vs Warning Watchlist (60-74%)</p>
                </div>
                <ExportDropdown onExport={exportDefaultersCSV} label="Export Defaulters" color="rose" />
              </div>

              {/* Categorization Badges / Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setLowSeverityFilter('ALL')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    lowSeverityFilter === 'ALL'
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : `${card} border`
                  }`}
                >
                  <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Total Defaulters</p>
                  <p className={`text-2xl font-extrabold mt-1 ${textPrimary}`}>{lowStudents.length}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>All students below 75% cutoff</p>
                </button>

                <button
                  onClick={() => setLowSeverityFilter('CRITICAL')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    lowSeverityFilter === 'CRITICAL'
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : `${card} border`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Critical Action Required</p>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <p className="text-2xl font-extrabold mt-1 text-rose-500">{criticalDefaulters.length}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>Severe risk: below 60% aggregate</p>
                </button>

                <button
                  onClick={() => setLowSeverityFilter('WARNING')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    lowSeverityFilter === 'WARNING'
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : `${card} border`
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Watchlist Defaulters</p>
                  <p className="text-2xl font-extrabold mt-1 text-amber-500">{warningDefaulters.length}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>60% to 74% attendance warning</p>
                </button>
              </div>

              {filteredLowStudents.length === 0 ? (
                <div className={`${card} border rounded-2xl p-16 text-center`}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Attendance Defaulters!</h3>
                  <p className={`text-xs ${textSecondary} mt-1`}>All enrolled students meet the attendance requirements.</p>
                </div>
              ) : (
                <div className={`${card} border rounded-2xl overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-4">Student</th>
                          <th className="p-4">Roll Number</th>
                          <th className="p-4">Category Severity</th>
                          <th className="p-4">Department & Class</th>
                          <th className="p-4">Present / Total</th>
                          <th className="p-4">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {filteredLowStudents.map(s => {
                          const isCritical = s.percentage < 60;
                          return (
                            <tr key={s.studentId} className={`${trHover} transition`}>
                              <td className="p-4">
                                <p className={`font-semibold ${textPrimary}`}>{s.name}</p>
                                <p className={`text-xs ${textSecondary}`}>{s.email}</p>
                              </td>
                              <td className="p-4 font-mono font-bold text-rose-500 text-xs">{s.rollNumber}</td>
                              <td className="p-4">
                                {isCritical ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold border border-rose-500/20">
                                    <AlertCircle className="w-3 h-3" /> Critical (&lt;60%)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" /> Warning (60-74%)
                                  </span>
                                )}
                              </td>
                              <td className={`p-4 text-xs ${textSecondary}`}>
                                <span className={`font-medium ${textPrimary}`}>{s.department}</span>
                                {s.className && <span className="ml-1">• {s.className}</span>}
                              </td>
                              <td className={`p-4 font-semibold ${textPrimary}`}>
                                {s.presentCount} / {s.totalClasses}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-24 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} h-2 rounded-full overflow-hidden`}>
                                    <div
                                      className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                                      style={{ width: `${s.percentage}%` }}
                                    />
                                  </div>
                                  <span className={`font-extrabold text-sm ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {s.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: CORRECTIONS */}
          {tab === 'corrections' && (
            <motion.div key="corrections" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Attendance Correction Requests</h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Review student appeals categorized by review status</p>
                </div>

                {/* Categorized Status Pills */}
                <div className="flex items-center gap-1.5 bg-slate-800/20 p-1 rounded-xl border border-slate-700/20">
                  <button
                    onClick={() => setCorrectionStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      correctionStatusFilter === 'ALL'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : `${textSecondary} hover:text-slate-900 dark:hover:text-slate-100`
                    }`}
                  >
                    All ({corrections.length})
                  </button>
                  <button
                    onClick={() => setCorrectionStatusFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      correctionStatusFilter === 'PENDING'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : `${textSecondary} hover:text-slate-900 dark:hover:text-slate-100`
                    }`}
                  >
                    Pending ({pendingCorrectionsCount})
                  </button>
                  <button
                    onClick={() => setCorrectionStatusFilter('APPROVED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      correctionStatusFilter === 'APPROVED'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : `${textSecondary} hover:text-slate-900 dark:hover:text-slate-100`
                    }`}
                  >
                    Approved ({approvedCorrectionsCount})
                  </button>
                  <button
                    onClick={() => setCorrectionStatusFilter('REJECTED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      correctionStatusFilter === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : `${textSecondary} hover:text-slate-900 dark:hover:text-slate-100`
                    }`}
                  >
                    Rejected ({rejectedCorrectionsCount})
                  </button>
                </div>
              </div>

              {filteredCorrections.length === 0 ? (
                <div className={`${card} border rounded-2xl p-16 text-center`}>
                  <ClipboardList className={`w-12 h-12 mx-auto mb-3 opacity-40 ${textSecondary}`} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Requests In This Category</h3>
                  <p className={`text-xs ${textSecondary} mt-1`}>No attendance appeals match the current status filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCorrections.map(c => (
                    <div key={c.id} className={`${card} border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1">
                          <span className={`font-bold ${textPrimary}`}>{c.attendance?.student?.user?.name}</span>
                          <span className={`text-xs ${textSecondary}`}>({c.attendance?.student?.department?.name || 'Department N/A'})</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className={`text-xs ${textSecondary} font-medium`}>
                          Course: <span className="text-cyan-500 font-semibold">{c.attendance?.session?.course?.name}</span> • 
                          Requested Status: <span className="font-bold text-emerald-500 ml-1">{c.requestedStatus}</span>
                        </p>
                        <div className={`text-xs ${textSecondary} mt-2.5 ${cardInner} p-3 rounded-xl border`}>
                          <span className={`font-semibold ${textPrimary}`}>Student Reason:</span> "{c.reason}"
                        </div>
                      </div>

                      {c.status === 'PENDING' && (
                        <div className="flex space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleCorrection(c.id, 'APPROVED')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
                          >
                            <Check className="w-4 h-4" /> <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleCorrection(c.id, 'REJECTED')}
                            className="px-4 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-500 border border-rose-500/30 font-bold text-xs transition flex items-center space-x-1.5"
                          >
                            <X className="w-4 h-4" /> <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: REPORTS & EXPORT */}
          {tab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Institutional Reports & Live Export Center</h1>
                  <p className={`${textSecondary} text-xs mt-1`}>Inspect live institutional data, switch report categories, and download complete verified CSV spreadsheets</p>
                </div>
                {exportSuccessMsg && (
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{exportSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Categorized Report Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Report Card 1: Attendance Audit */}
                <div
                  onClick={() => setReportType('attendance')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    reportType === 'attendance'
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                      : `${card} hover:border-purple-500/40`
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      {auditData.length} records
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${textPrimary}`}>1. Attendance Audit</h3>
                  <p className={`text-xs ${textSecondary} mb-4`}>Full campus attendance % breakdown for every enrolled student.</p>
                  <ExportDropdown onExport={(t: any) => { exportAuditCSV(t); }} label="Download Report" color="purple" fullWidth={true} />
                </div>

                {/* Report Card 2: Student Master */}
                <div
                  onClick={() => setReportType('students')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    reportType === 'students'
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                      : `${card} hover:border-cyan-500/40`
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      {students.length} records
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${textPrimary}`}>2. Student Master</h3>
                  <p className={`text-xs ${textSecondary} mb-4`}>Complete roster with roll numbers, departments, classes & sections.</p>
                  <ExportDropdown onExport={(t: any) => { exportStudentsCSV(t); }} label="Download Report" color="cyan" fullWidth={true} />
                </div>

                {/* Report Card 3: Defaulters */}
                <div
                  onClick={() => setReportType('defaulters')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    reportType === 'defaulters'
                      ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                      : `${card} hover:border-rose-500/40`
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {lowStudents.length} defaulters
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${textPrimary}`}>3. Attendance Defaulters</h3>
                  <p className={`text-xs ${textSecondary} mb-4`}>Students under 75% cutoff with urgent action status.</p>
                  <ExportDropdown onExport={(t: any) => { exportDefaultersCSV(t); }} label="Download Report" color="rose" fullWidth={true} />
                </div>

                {/* Report Card 4: Faculty Workload */}
                <div
                  onClick={() => setReportType('faculty')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    reportType === 'faculty'
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : `${card} hover:border-amber-500/40`
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {facultyList.length} faculty
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${textPrimary}`}>4. Faculty Workload</h3>
                  <p className={`text-xs ${textSecondary} mb-4`}>Lecture totals, department assignments, and instructor directories.</p>
                  <ExportDropdown onExport={(t: any) => { exportFacultyCSV(t); }} label="Download Report" color="amber" fullWidth={true} />
                </div>
              </div>

              {/* LIVE DATA PREVIEW PANEL */}
              <div className={`${card} border rounded-2xl p-6 space-y-4`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-700/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Live Data Preview
                      </span>
                      <h2 className={`text-lg font-bold ${textPrimary}`}>
                        {reportType === 'attendance' && 'Institutional Attendance Audit (All Students)'}
                        {reportType === 'students' && 'Complete Student Master Directory'}
                        {reportType === 'defaulters' && 'Attendance Defaulters Watchlist (<75%)'}
                        {reportType === 'faculty' && 'Faculty Lecture Workload Report'}
                      </h2>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      Showing real-time database records ready for export.
                    </p>
                  </div>

                  {/* Top Action Button */}
                  <div className="flex items-center gap-3">
                    <ExportDropdown 
    onExport={(type: any) => {
      if (reportType === 'attendance') exportAuditCSV(type);
      else if (reportType === 'students') exportStudentsCSV(type);
      else if (reportType === 'defaulters') exportDefaultersCSV(type);
      else if (reportType === 'faculty') exportFacultyCSV(type);
    }}
    label="Download This Report"
    primary={true}
  />
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3.5 top-3 w-4 h-4 ${textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Search within this report by name, roll number, or email..."
                      value={reportSearch}
                      onChange={e => setReportSearch(e.target.value)}
                      className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border ${inputCls}`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setReportDeptFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        reportDeptFilter === 'ALL'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : `${cardInner} ${textSecondary}`
                      }`}
                    >
                      All Branches
                    </button>
                    {studentDepartments.map(dept => (
                      <button
                        key={dept}
                        onClick={() => setReportDeptFilter(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                          reportDeptFilter === dept
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : `${cardInner} ${textSecondary}`
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Table 1: ATTENDANCE AUDIT */}
                {reportType === 'attendance' && (
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-3.5">Student</th>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Classes Attended</th>
                          <th className="p-3.5">Attendance %</th>
                          <th className="p-3.5">Status & AI Insight</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {filteredReportAudit.length === 0 ? (
                          <tr>
                            <td colSpan={6} className={`p-8 text-center ${textSecondary}`}>
                              No attendance records match your search or branch filter.
                            </td>
                          </tr>
                        ) : (
                          filteredReportAudit.map(s => {
                            const isCritical = s.attendancePercentage < 60;
                            const isWarning = s.attendancePercentage >= 60 && s.attendancePercentage < 75;
                            return (
                              <tr key={s.studentId} className={`${trHover} transition`}>
                                <td className="p-3.5">
                                  <p className={`font-semibold ${textPrimary}`}>{s.name}</p>
                                  <p className={`text-xs ${textSecondary}`}>{s.email}</p>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-xs text-cyan-500">{s.rollNumber}</td>
                                <td className={`p-3.5 text-xs ${textSecondary}`}>{s.department}</td>
                                <td className={`p-3.5 font-semibold text-xs ${textPrimary}`}>
                                  {s.presentClasses} / {s.totalClasses} classes
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-16 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                      <div
                                        className={`h-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(s.attendancePercentage, 100)}%` }}
                                      />
                                    </div>
                                    <span className={`font-extrabold text-xs ${
                                      isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'
                                    }`}>
                                      {s.attendancePercentage}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    isCritical ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                    isWarning ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  }`}>
                                    {isCritical ? 'Critical Defaulter' : isWarning ? 'Warning (<75%)' : 'Satisfactory (>=75%)'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Report Table 2: STUDENT MASTER */}
                {reportType === 'students' && (
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Class</th>
                          <th className="p-3.5">Section</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {filteredReportStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className={`p-8 text-center ${textSecondary}`}>
                              No student records match your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredReportStudents.map(s => (
                            <tr key={s.id} className={`${trHover} transition`}>
                              <td className={`p-3.5 font-semibold ${textPrimary}`}>{s.user?.name}</td>
                              <td className={`p-3.5 text-xs ${textSecondary}`}>{s.user?.email}</td>
                              <td className="p-3.5 font-mono font-bold text-xs text-cyan-500">{s.rollNumber}</td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium border border-blue-500/20">
                                  {s.department?.name || 'General'}
                                </span>
                              </td>
                              <td className={`p-3.5 text-xs ${textPrimary}`}>{s.class?.name || '—'}</td>
                              <td className={`p-3.5 text-xs ${textSecondary}`}>{s.section?.name ? `Sec ${s.section?.name}` : '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Report Table 3: DEFAULTERS */}
                {reportType === 'defaulters' && (
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-3.5">Student</th>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Attended / Total</th>
                          <th className="p-3.5">Attendance %</th>
                          <th className="p-3.5">Risk Severity</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {filteredReportDefaulters.length === 0 ? (
                          <tr>
                            <td colSpan={6} className={`p-8 text-center ${textSecondary}`}>
                              No defaulters found in this category.
                            </td>
                          </tr>
                        ) : (
                          filteredReportDefaulters.map(s => {
                            const isCritical = s.percentage < 60;
                            return (
                              <tr key={s.studentId} className={`${trHover} transition`}>
                                <td className="p-3.5">
                                  <p className={`font-semibold ${textPrimary}`}>{s.name}</p>
                                  <p className={`text-xs ${textSecondary}`}>{s.email}</p>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-xs text-rose-500">{s.rollNumber}</td>
                                <td className={`p-3.5 text-xs ${textSecondary}`}>{s.department}</td>
                                <td className={`p-3.5 font-semibold text-xs ${textPrimary}`}>
                                  {s.presentCount} / {s.totalClasses}
                                </td>
                                <td className={`p-3.5 font-extrabold text-sm ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
                                  {s.percentage}%
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    isCritical ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  }`}>
                                    {isCritical ? '🚨 Critical Action' : '⚠️ Warning Watchlist'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Report Table 4: FACULTY */}
                {reportType === 'faculty' && (
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-3.5">Faculty Name</th>
                          <th className="p-3.5">Employee ID</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Sessions Conducted</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {filteredReportFaculty.length === 0 ? (
                          <tr>
                            <td colSpan={5} className={`p-8 text-center ${textSecondary}`}>
                              No faculty records match your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredReportFaculty.map(f => (
                            <tr key={f.id} className={`${trHover} transition`}>
                              <td className={`p-3.5 font-semibold ${textPrimary}`}>{f.user?.name}</td>
                              <td className="p-3.5 font-mono text-purple-500 text-xs font-bold">{f.employeeId}</td>
                              <td className={`p-3.5 text-xs ${textSecondary}`}>{f.department?.name || 'General'}</td>
                              <td className={`p-3.5 text-xs ${textSecondary}`}>{f.user?.email}</td>
                              <td className="p-3.5 font-semibold text-xs text-amber-500">{f._count?.sessions || 0} lectures</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL: ADD FACULTY */}
      <AnimatePresence>
        {showAddFacultyModal && (
          <div className={`fixed inset-0 z-50 ${overlayBg} backdrop-blur-sm flex items-center justify-center p-4`}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`${modalBg} border rounded-2xl max-w-md w-full p-6 shadow-2xl`}>
              <h3 className="text-xl font-bold mb-4">Add Faculty Member</h3>
              {formMsg.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${formMsg.isError ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={handleAddFaculty} className="space-y-4">
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Full Name</label>
                  <input type="text" required value={facForm.name} onChange={e => setFacForm({ ...facForm, name: e.target.value })} placeholder="Dr. Jane Doe" className={`w-full rounded-xl p-2.5 text-sm border ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Email Address</label>
                  <input type="email" required value={facForm.email} onChange={e => setFacForm({ ...facForm, email: e.target.value })} placeholder="jane@college.edu" className={`w-full rounded-xl p-2.5 text-sm border ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Employee ID</label>
                  <input type="text" required value={facForm.employeeId} onChange={e => setFacForm({ ...facForm, employeeId: e.target.value })} placeholder="FAC-CSE-005" className={`w-full rounded-xl p-2.5 text-sm border ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Department</label>
                  <select required value={facForm.departmentId} onChange={e => setFacForm({ ...facForm, departmentId: e.target.value })} className={`w-full rounded-xl p-2.5 text-sm border ${selectCls}`}>
                    <option value="">Select Department...</option>
                    {departmentsTree.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button type="button" onClick={() => setShowAddFacultyModal(false)} className={`px-4 py-2 rounded-xl ${cardInner} ${textSecondary} text-sm`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md">Save Faculty</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD DEPARTMENT */}
      <AnimatePresence>
        {showAddDeptModal && (
          <div className={`fixed inset-0 z-50 ${overlayBg} backdrop-blur-sm flex items-center justify-center p-4`}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`${modalBg} border rounded-2xl max-w-md w-full p-6 shadow-2xl`}>
              <h3 className="text-xl font-bold mb-4">Add Academic Department</h3>
              {formMsg.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${formMsg.isError ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={handleAddDept} className="space-y-4">
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Department Name</label>
                  <input type="text" required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. Civil Engineering" className={`w-full rounded-xl p-2.5 text-sm border ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Department Code</label>
                  <input type="text" required value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="e.g. CIVIL" className={`w-full rounded-xl p-2.5 text-sm border uppercase ${inputCls}`} />
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button type="button" onClick={() => setShowAddDeptModal(false)} className={`px-4 py-2 rounded-xl ${cardInner} ${textSecondary} text-sm`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md">Save Department</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD COURSE */}
      <AnimatePresence>
        {showAddCourseModal && (
          <div className={`fixed inset-0 z-50 ${overlayBg} backdrop-blur-sm flex items-center justify-center p-4`}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`${modalBg} border rounded-2xl max-w-md w-full p-6 shadow-2xl`}>
              <h3 className="text-xl font-bold mb-4">Add New Course</h3>
              {formMsg.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${formMsg.isError ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Course Name</label>
                  <input type="text" required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="e.g. Computer Graphics" className={`w-full rounded-xl p-2.5 text-sm border ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Course Code</label>
                  <input type="text" required value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="e.g. CS401" className={`w-full rounded-xl p-2.5 text-sm border uppercase ${inputCls}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} block mb-1`}>Department</label>
                  <select required value={courseForm.departmentId} onChange={e => setCourseForm({ ...courseForm, departmentId: e.target.value })} className={`w-full rounded-xl p-2.5 text-sm border ${selectCls}`}>
                    <option value="">Select Department...</option>
                    {departmentsTree.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button type="button" onClick={() => setShowAddCourseModal(false)} className={`px-4 py-2 rounded-xl ${cardInner} ${textSecondary} text-sm`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md">Save Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
