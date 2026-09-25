import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, LogOut,
  LayoutDashboard, ClipboardList, Users, BookOpen, X, Plus, Search, Check, Download, Calendar, Clock,
  Filter, Layers, GraduationCap, Building2
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import EarlyWarningAnalytics from './EarlyWarningAnalytics';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import Pagination from '../../components/Pagination';

interface Session {
  id: string;
  date: string;
  isActive?: boolean;
  attendanceCode?: string | null;
  course: { name: string; code: string };
  section: { id: string; name: string; class: { name: string } };
}

interface Student {
  id: string;
  rollNumber: string;
  user: { name: string; email: string };
  department?: { name: string; code?: string };
}

interface LowStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  className?: string;
  percentage: number;
  totalClasses: number;
  presentCount: number;
}

interface CorrectionReq {
  id: string;
  reason: string;
  requestedStatus: string;
  status: string;
  createdAt: string;
  attendance: {
    student: { user: { name: string; email: string }; department: { name: string } };
    session: { course: { name: string; code: string } };
  };
}

const navItems = [
  { id: 'dashboard', label: 'My Sessions', icon: LayoutDashboard },
  { id: 'mark', label: 'Mark Attendance', icon: ClipboardList },
  { id: 'students', label: 'Student Directory', icon: Users },
  { id: 'low', label: 'Low Attendance', icon: AlertTriangle },
  { id: 'corrections', label: 'Correction Requests', icon: CheckCircle },
  { id: 'analytics', label: 'AI Risk Analytics', icon: Search },
];

const FacultyDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('dashboard');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [markingDone, setMarkingDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lowStudents, setLowStudents] = useState<LowStudent[]>([]);
  const [corrections, setCorrections] = useState<CorrectionReq[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [secFilter, setSecFilter] = useState('ALL');

  // ─── Pagination states ──────────────────────────────────
  const PAGE_SIZE_SESSIONS = 6;
  const PAGE_SIZE_STUDENTS = 20;
  const PAGE_SIZE_MARK = 20;
  const PAGE_SIZE_LOW = 20;
  const PAGE_SIZE_CORRECTIONS = 10;

  const [sessionPage, setSessionPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [markPage, setMarkPage] = useState(1);
  const [lowPage, setLowPage] = useState(1);
  const [correctionPage, setCorrectionPage] = useState(1);

  const [lowSeverityFilter, setLowSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'CAUTION'>('ALL');
  const [correctionStatusFilter, setCorrectionStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  // Reset pagination when filters change
  useEffect(() => {
    setStudentPage(1);
    setLowPage(1);
    setSessionPage(1);
  }, [searchQuery, deptFilter, batchFilter, secFilter]);

  useEffect(() => {
    setLowPage(1);
  }, [lowSeverityFilter]);

  useEffect(() => {
    setCorrectionPage(1);
  }, [correctionStatusFilter]);

  // New Session Creation Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [newSessionData, setNewSessionData] = useState({
    courseId: '',
    sectionId: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });
  const [createError, setCreateError] = useState('');

  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // ─── Theme-aware class helpers ──────────────────────────
  const page = isDark ? 'bg-slate-950 text-slate-100 relative overflow-hidden' : 'bg-slate-50 text-slate-900 relative overflow-hidden';
  const sidebar = isDark ? 'bg-slate-900/90 backdrop-blur-xl border-slate-800/80 shadow-2xl z-10' : 'bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-xl z-10';
  const card = isDark ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/80 shadow-xl hover:border-purple-500/40 transition-all duration-300' : 'bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-md hover:border-purple-400 transition-all duration-300';
  const cardInner = isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-100/70 border-slate-200';
  const thead = isDark ? 'bg-slate-800/80 text-purple-300' : 'bg-slate-100 text-slate-700';
  const trHover = isDark ? 'hover:bg-purple-950/20' : 'hover:bg-purple-50/50';
  const divider = isDark ? 'border-slate-800/80' : 'border-slate-200';
  const inputCls = isDark
    ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-purple-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500';
  const selectCls = isDark
    ? 'bg-slate-900/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-300 text-slate-900';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const modalBg = isDark ? 'bg-slate-900/95 backdrop-blur-2xl border-purple-500/20 shadow-2xl' : 'bg-white/95 backdrop-blur-2xl border-purple-100 shadow-2xl';
  const overlayBg = isDark ? 'bg-slate-950/80' : 'bg-slate-900/50';
  const navActive = isDark
    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30'
    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md';
  const navInactive = isDark
    ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900';

  useEffect(() => {
    fetchSessions();
    fetchMetadata();
  }, []);

  const fetchSessions = () => {
    axios.get(`${API_BASE_URL}/api/sessions`, auth).then(r => setSessions(r.data)).catch(console.error);
  };

  const fetchMetadata = () => {
    axios.get(`${API_BASE_URL}/api/sessions/courses`, auth).then(r => setCourses(r.data)).catch(console.error);
    axios.get(`${API_BASE_URL}/api/sessions/sections`, auth).then(r => setSections(r.data)).catch(console.error);
  };

  useEffect(() => {
    if (tab === 'low') axios.get(`${API_BASE_URL}/api/attendance/low`, auth).then(r => setLowStudents(r.data)).catch(console.error);
    if (tab === 'students') axios.get(`${API_BASE_URL}/api/students`, auth).then(r => setAllStudents(r.data)).catch(console.error);
    if (tab === 'corrections') axios.get(`${API_BASE_URL}/api/attendance/corrections`, auth).then(r => setCorrections(r.data)).catch(console.error);
  }, [tab]);

  // Poll for live attendance updates and rotate code
  useEffect(() => {
    let codeInterval: ReturnType<typeof setInterval>;
    let pollInterval: ReturnType<typeof setInterval>;

    if (selectedSession?.isActive) {
      codeInterval = setInterval(() => {
        axios.patch(`${API_BASE_URL}/api/sessions/${selectedSession.id}/rotate-code`, {}, auth)
          .then(res => {
            setSelectedSession(prev => prev ? { ...prev, attendanceCode: res.data.code } : null);
          }).catch(console.error);
      }, 15000);

      pollInterval = setInterval(() => {
        axios.get(`${API_BASE_URL}/api/attendance/session/${selectedSession.id}`, auth)
          .then(res => {
            setAttendance(prev => {
              const newAtt = { ...prev };
              res.data.forEach((rec: any) => { newAtt[rec.studentId] = rec.status; });
              return newAtt;
            });
          }).catch(console.error);
      }, 5000);
    }

    return () => {
      clearInterval(codeInterval);
      clearInterval(pollInterval);
    };
  }, [selectedSession?.id, selectedSession?.isActive]);

  const loadSession = async (session: Session) => {
    setSelectedSession(session);
    setMarkingDone(false);
    setMarkPage(1);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/attendance/session/${session.id}`, auth);
      const existing: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      r.data.forEach((rec: any) => { existing[rec.studentId] = rec.status; });

      const studentsRes = await axios.get(`${API_BASE_URL}/api/students`, auth);
      const filtered = studentsRes.data.filter((s: any) => s.sectionId === session.section?.id || s.sectionId === (session as any).sectionId);
      setSessionStudents(filtered);

      const defaultAtt: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      filtered.forEach((s: any) => { defaultAtt[s.id] = existing[s.id] || 'ABSENT'; });
      setAttendance(Object.keys(existing).length > 0 ? { ...defaultAtt, ...existing } : defaultAtt);
      setTab('mark');
    } catch (e) {
      console.error(e);
    }
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    const all: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    sessionStudents.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const submitAttendance = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await axios.post(`${API_BASE_URL}/api/attendance/mark`, { sessionId: selectedSession.id, records }, auth);
      setMarkingDone(true);
      setTimeout(() => setMarkingDone(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sessions`, newSessionData, auth);
      setShowCreateModal(false);
      fetchSessions();
      loadSession(res.data);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleEndLiveSession = async () => {
    if (!selectedSession) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/sessions/${selectedSession.id}/end`, {}, auth);
      setSelectedSession({ ...selectedSession, isActive: false, attendanceCode: null });
      fetchSessions();
    } catch (e) {
      console.error('Failed to end live session');
    }
  };

  const handleCorrection = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`${API_BASE_URL}/api/attendance/correction/${id}`, { status }, auth);
      setCorrections(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    setShowExportMenu(false);
    if (!selectedSession) return;
    if (!sessionStudents || sessionStudents.length === 0) {
      alert('No student records found in this session to export.');
      return;
    }

    const headers = ['Roll Number', 'Student Name', 'Email', 'Department', 'Attendance Status'];
    const rows = sessionStudents.map(s => [
      s.rollNumber,
      s.user?.name || 'Unknown',
      s.user?.email || 'N/A',
      s.department?.name || 'N/A',
      attendance[s.id] || 'ABSENT'
    ]);

    const presentCount = rows.filter(r => r[4] === 'PRESENT').length;
    const dateStr = new Date(selectedSession.date).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const meta = {
      title: `Session Attendance Report: ${selectedSession.course?.code}`,
      subtitle: `${selectedSession.course?.name} | Section ${selectedSession.section?.name} | ${dateStr}`,
      filename: `Session_${selectedSession.course?.code}_${selectedSession.date.slice(0, 10)}`,
      summaryStats: [
        { label: 'Total Enrolled', value: sessionStudents.length },
        { label: 'Total Present', value: presentCount },
        { label: 'Attendance Rate', value: `${Math.round((presentCount / sessionStudents.length) * 100)}%` },
      ]
    };

    if (type === 'pdf') {
      exportToPDF(meta, headers, rows);
    } else {
      exportToExcel(meta.filename, 'Session Attendance', headers, rows);
    }
  };

  // ─── Organization Filters (Dept, Batch, Section) ────────
  const matchesOrgFilter = (deptName?: string, className?: string, sectionName?: string, rollNumber?: string) => {
    const matchesDept = deptFilter === 'ALL' || (deptName && deptName.toLowerCase().includes(deptFilter.toLowerCase()));
    const matchesBatch = batchFilter === 'ALL' || (className && className.includes(batchFilter)) || (rollNumber && rollNumber.includes(batchFilter));
    const matchesSec = secFilter === 'ALL' || (sectionName && sectionName.toLowerCase().includes(secFilter.toLowerCase()));
    return matchesDept && matchesBatch && matchesSec;
  };

  const filteredAllStudents = allStudents.filter(s => {
    const matchesSearch = s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = matchesOrgFilter(
      s.department?.name,
      (s as any).class?.name,
      (s as any).section?.name,
      s.rollNumber
    );
    return matchesSearch && matchesOrg;
  });

  const filteredSessions = sessions.filter(s =>
    matchesOrgFilter(undefined, s.section?.class?.name, s.section?.name, undefined)
  );

  const filteredLowStudents = lowStudents.filter(s =>
    matchesOrgFilter(s.department, s.className, (s as any).sectionName, s.rollNumber)
  );

  // ─── Categorization helpers ─────────────────────────────
  const today = new Date().toDateString();
  const activeSessions = filteredSessions.filter(s => s.isActive);
  const todaySessions = filteredSessions.filter(s => !s.isActive && new Date(s.date).toDateString() === today);
  const olderSessions = filteredSessions.filter(s => !s.isActive && new Date(s.date).toDateString() !== today);

  // Categorize sessions by course
  const sessionsByCourse: Record<string, Session[]> = {};
  olderSessions.forEach(s => {
    const key = s.course?.code || 'Uncategorized';
    if (!sessionsByCourse[key]) sessionsByCourse[key] = [];
    sessionsByCourse[key].push(s);
  });

  // Categorize students by department
  const studentsByDept: Record<string, Student[]> = {};
  filteredAllStudents.forEach(s => {
    const dept = s.department?.name || 'Unknown';
    if (!studentsByDept[dept]) studentsByDept[dept] = [];
    studentsByDept[dept].push(s);
  });

  // Categorize low attendance by severity
  const criticalLow = filteredLowStudents.filter(s => s.percentage < 50);
  const warningLow = filteredLowStudents.filter(s => s.percentage >= 50 && s.percentage < 65);
  const cautionLow = filteredLowStudents.filter(s => s.percentage >= 65 && s.percentage < 75);

  // Categorize corrections by status
  const pendingCorrections = corrections.filter(c => c.status === 'PENDING');
  const resolvedCorrections = corrections.filter(c => c.status !== 'PENDING');

  // ─── Paged datasets for Pagination ──────────────────────
  const pagedOlderSessions = olderSessions.slice(
    (sessionPage - 1) * PAGE_SIZE_SESSIONS,
    sessionPage * PAGE_SIZE_SESSIONS
  );
  const pagedSessionStudents = sessionStudents.slice(
    (markPage - 1) * PAGE_SIZE_MARK,
    markPage * PAGE_SIZE_MARK
  );
  const pagedAllStudents = filteredAllStudents.slice(
    (studentPage - 1) * PAGE_SIZE_STUDENTS,
    studentPage * PAGE_SIZE_STUDENTS
  );

  const filteredLowStudentsBySeverity = filteredLowStudents.filter(s => {
    if (lowSeverityFilter === 'CRITICAL') return s.percentage < 50;
    if (lowSeverityFilter === 'WARNING') return s.percentage >= 50 && s.percentage < 65;
    if (lowSeverityFilter === 'CAUTION') return s.percentage >= 65 && s.percentage < 75;
    return true;
  });
  const pagedLowStudents = filteredLowStudentsBySeverity.slice(
    (lowPage - 1) * PAGE_SIZE_LOW,
    lowPage * PAGE_SIZE_LOW
  );

  const filteredCorrectionsByStatus = corrections.filter(c => {
    if (correctionStatusFilter === 'PENDING') return c.status === 'PENDING';
    if (correctionStatusFilter === 'RESOLVED') return c.status !== 'PENDING';
    return true;
  });
  const pagedCorrections = filteredCorrectionsByStatus.slice(
    (correctionPage - 1) * PAGE_SIZE_CORRECTIONS,
    correctionPage * PAGE_SIZE_CORRECTIONS
  );

  // ─── Organization Filter Bar Component ───────────────────
  const OrgFilterBar = () => (
    <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 transition-all ${
      isDark ? 'bg-slate-900/80 backdrop-blur-xl border-purple-500/30 shadow-lg shadow-purple-950/20' : 'bg-white/90 backdrop-blur-xl border-purple-200 shadow-md'
    }`}>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
          <Filter className="w-4 h-4" />
        </div>
        <div>
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            Organize & Filter Roster
          </h4>
          <p className={`text-[11px] ${textMuted}`}>Department • Batch Year • Section</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Department Filter */}
        <div className="flex items-center space-x-1.5">
          <Building2 className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition ${selectCls}`}
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="AIDS">AI & Data Science (AIDS)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="CIVIL">Civil (CIVIL)</option>
            <option value="CYBER">Cyber Security (CYBER)</option>
          </select>
        </div>

        {/* Batch / Year Filter */}
        <div className="flex items-center space-x-1.5">
          <GraduationCap className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <select
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition ${selectCls}`}
          >
            <option value="ALL">All Batches / Years</option>
            <option value="2025">1st Year (Batch 2025)</option>
            <option value="2024">2nd Year (Batch 2024)</option>
            <option value="2023">3rd Year (Batch 2023)</option>
            <option value="2022">4th Year (Batch 2022)</option>
            <option value="2021">M.Tech / PG (Batch 2021)</option>
          </select>
        </div>

        {/* Section Filter */}
        <div className="flex items-center space-x-1.5">
          <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <select
            value={secFilter}
            onChange={e => setSecFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition ${selectCls}`}
          >
            <option value="ALL">All Sections</option>
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>
        </div>

        {(deptFilter !== 'ALL' || batchFilter !== 'ALL' || secFilter !== 'ALL') && (
          <button
            onClick={() => { setDeptFilter('ALL'); setBatchFilter('ALL'); setSecFilter('ALL'); }}
            className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );

  // ─── Session Card ──────────────────────────────────────
  const SessionCard = ({ s }: { s: Session }) => (
    <motion.div
      key={s.id}
      whileHover={{ scale: 1.01 }}
      onClick={() => loadSession(s)}
      className={`${card} hover:border-purple-500/40 rounded-2xl p-6 cursor-pointer transition shadow-lg flex flex-col justify-between group`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'} font-mono text-xs font-bold border`}>
            {s.course?.code || 'COURSE'}
          </span>
          {s.isActive ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              LIVE
            </span>
          ) : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-purple-600 group-hover:text-white' : 'bg-green-50 text-green-600 border-green-200 group-hover:bg-purple-600 group-hover:text-white'} border transition`}>
              Open Roster →
            </span>
          )}
        </div>
        <h3 className={`font-bold text-base ${textPrimary} mb-1`}>{s.course?.name}</h3>
        <p className={`text-xs ${textSecondary}`}>
          {s.section?.class?.name || 'Class'} • Section {s.section?.name || 'A'}
        </p>
      </div>

      <div className={`pt-4 mt-4 border-t ${divider} flex items-center justify-between text-xs ${textMuted}`}>
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );

  // ─── Category Section Header ───────────────────────────
  const SectionHeader = ({ label, count, color = 'purple' }: { label: string; count: number; color?: string }) => {
    const colorMap: Record<string, string> = {
      purple: isDark ? 'text-purple-300 border-purple-500/20' : 'text-purple-600 border-purple-200',
      emerald: isDark ? 'text-emerald-300 border-emerald-500/20' : 'text-emerald-600 border-emerald-200',
      amber: isDark ? 'text-amber-300 border-amber-500/20' : 'text-amber-600 border-amber-200',
      rose: isDark ? 'text-rose-300 border-rose-500/20' : 'text-rose-600 border-rose-200',
      cyan: isDark ? 'text-cyan-300 border-cyan-500/20' : 'text-cyan-600 border-cyan-200',
    };
    return (
      <div className={`flex items-center gap-2 border-b ${colorMap[color]} pb-2 mb-4`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${colorMap[color]?.split(' ')[0]}`}>{label}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? `bg-${color}-500/20 text-${color}-300` : `bg-${color}-50 text-${color}-600`}`}>
          {count}
        </span>
      </div>
    );
  };


  return (
    <>
      <div className={`min-h-screen ${page} flex flex-col md:flex-row z-10 relative`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 ${sidebar} border-r p-6 flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`font-bold text-base leading-tight ${textPrimary}`}>Faculty Portal</h1>
                <p className={`text-xs ${textSecondary}`}>Attendance System</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id ? navActive : navInactive
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'low' && lowStudents.length > 0 && (
                  <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {lowStudents.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Faculty User Info */}
        <div className={`pt-6 border-t ${divider} mt-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gradient-to-tr from-purple-600 to-cyan-600 text-white' : 'bg-purple-600 text-white'} flex items-center justify-center font-bold shadow-md`}>
              {user?.name?.charAt(0) || 'F'}
            </div>
            <div className="overflow-hidden">
              <p className={`font-semibold text-sm truncate ${textPrimary}`}>{user?.name}</p>
              <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium`}>Faculty Member</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* TAB 1: SESSIONS OVERVIEW — CATEGORIZED */}
          {tab === 'dashboard' && (
            <motion.div key="sessions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200'} border mb-2`}>
                    LECTURE SESSIONS
                  </span>
                  <h1 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>Active Class Sessions</h1>
                  <p className={`${textSecondary} text-sm mt-1`}>Select any session below to view roster or record student attendance.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold transition flex items-center space-x-2 shadow-lg shadow-purple-600/30"
                >
                  <Plus className="w-4 h-4" /> <span>Create New Session</span>
                </button>
              </div>

              <OrgFilterBar />

              {sessions.length === 0 ? (
                <div className={`${card} rounded-2xl p-16 text-center`}>
                  <BookOpen className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Sessions Available</h3>
                  <p className={`text-xs ${textSecondary} mt-1 mb-4`}>Click "Create New Session" above to launch a class.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Live Sessions */}
                  {activeSessions.length > 0 && (
                    <section>
                      <div className={`flex items-center gap-2 border-b ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'} pb-2 mb-4`}>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Live Now</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>{activeSessions.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {activeSessions.map(s => <SessionCard key={s.id} s={s} />)}
                      </div>
                    </section>
                  )}

                  {/* Today's Sessions */}
                  {todaySessions.length > 0 && (
                    <section>
                      <SectionHeader label="Today's Sessions" count={todaySessions.length} color="cyan" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {todaySessions.map(s => <SessionCard key={s.id} s={s} />)}
                      </div>
                    </section>
                  )}

                  {/* Earlier Sessions */}
                  {olderSessions.length > 0 && (
                    <section>
                      <SectionHeader label="Previous Sessions" count={olderSessions.length} color="purple" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pagedOlderSessions.map(s => <SessionCard key={s.id} s={s} />)}
                      </div>
                      <div className="mt-4">
                        <Pagination
                          totalItems={olderSessions.length}
                          itemsPerPage={PAGE_SIZE_SESSIONS}
                          currentPage={sessionPage}
                          onPageChange={setSessionPage}
                          itemLabel="sessions"
                          colorScheme="purple"
                        />
                      </div>
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: MARK ATTENDANCE */}
          {tab === 'mark' && (
            <motion.div key="mark" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {!selectedSession ? (
                <div className={`${card} rounded-2xl p-16 text-center`}>
                  <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Session Selected</h3>
                  <p className={`text-xs ${textSecondary} mt-1 mb-4`}>Please pick a session from the "My Sessions" tab first.</p>
                  <button onClick={() => setTab('dashboard')} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
                    View My Sessions
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Session Header Card */}
                  <div className={`${isDark ? 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-purple-900/40' : 'bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 border-purple-200'} border rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4`}>
                    <div>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} uppercase`}>{selectedSession.course?.code}</span>
                      <h2 className={`text-2xl font-extrabold ${textPrimary}`}>{selectedSession.course?.name}</h2>
                      <p className={`text-xs ${textSecondary} mt-1`}>
                        {selectedSession.section?.class?.name} • Section {selectedSession.section?.name} •{' '}
                        {new Date(selectedSession.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {selectedSession.isActive ? (
                      <div className={`${isDark ? 'bg-slate-950 border-purple-500/30' : 'bg-white border-purple-200'} border p-4 rounded-xl text-center shadow-lg ${isDark ? 'shadow-purple-500/20' : 'shadow-purple-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'} font-bold mb-1 uppercase tracking-widest flex justify-center items-center gap-2`}>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          Live Smart Code
                        </p>
                        <h1 className="text-4xl font-extrabold font-mono text-emerald-400 tracking-[0.2em]">{selectedSession.attendanceCode}</h1>
                        <button onClick={handleEndLiveSession} className="mt-3 text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500 border border-rose-500/30 hover:text-white transition px-4 py-1.5 rounded-lg font-bold">
                          End Live Session
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button onClick={() => markAll('PRESENT')} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold transition">
                            Mark All Present
                          </button>
                          <button onClick={() => markAll('ABSENT')} className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold transition">
                            Mark All Absent
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setShowExportMenu(!showExportMenu)}
                              className={`px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'} border text-xs font-medium transition flex items-center space-x-1`}
                            >
                              <Download className="w-3.5 h-3.5" /> <span>Export Report</span>
                            </button>
                            <AnimatePresence>
                              {showExportMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className={`absolute right-0 mt-2 w-40 rounded-xl shadow-lg border z-20 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-900/50' : 'bg-white border-gray-200 shadow-gray-200'}`}
                                >
                                  <button
                                    onClick={() => handleExport('pdf')}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center space-x-2 transition ${isDark ? 'text-red-400 hover:bg-slate-700/50' : 'text-red-600 hover:bg-red-50'}`}
                                  >
                                    <span>Download PDF</span>
                                  </button>
                                  <button
                                    onClick={() => handleExport('excel')}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center space-x-2 transition ${isDark ? 'text-emerald-400 hover:bg-slate-700/50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                  >
                                    <span>Download Excel</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <button
                          onClick={submitAttendance}
                          disabled={saving}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex justify-center items-center space-x-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> <span>{saving ? 'Saving...' : 'Save Manual Attendance'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {markingDone && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Attendance saved successfully to institutional database!</span>
                    </div>
                  )}

                  {/* Student Roll Call Matrix */}
                  <div className={`${card} rounded-2xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className={`${thead} uppercase text-xs`}>
                          <tr>
                            <th className="p-4">Roll Number</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 text-center">Mark Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${divider}`}>
                          {pagedSessionStudents.map(student => {
                            const status = attendance[student.id] || 'ABSENT';
                            return (
                              <tr key={student.id} className={`${trHover} transition`}>
                                <td className={`p-4 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'} text-xs`}>{student.rollNumber}</td>
                                <td className={`p-4 font-semibold ${textPrimary}`}>{student.user?.name}</td>
                                <td className={`p-4 ${textSecondary} text-xs`}>{student.user?.email}</td>
                                <td className="p-4">
                                  <div className="flex justify-center space-x-1.5">
                                    {(['PRESENT', 'LATE', 'ABSENT'] as const).map(s => (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => setAttendance(prev => ({ ...prev, [student.id]: s }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                          status === s
                                            ? s === 'PRESENT'
                                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                              : s === 'LATE'
                                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                              : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                            : isDark
                                            ? 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 border border-slate-700/60'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      totalItems={sessionStudents.length}
                      itemsPerPage={PAGE_SIZE_MARK}
                      currentPage={markPage}
                      onPageChange={setMarkPage}
                      itemLabel="students"
                      colorScheme="purple"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: STUDENT DIRECTORY — PAGINATED */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Student Directory</h1>
                <p className={`${textSecondary} text-xs`}>Organized student directory with department, batch year, and section breakdown</p>
              </div>

              <OrgFilterBar />

              <div className="relative">
                <Search className={`absolute left-3.5 top-3 w-4 h-4 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search students by name or roll number..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setStudentPage(1); }}
                  className={`w-full ${inputCls} border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none`}
                />
              </div>

              {filteredAllStudents.length === 0 ? (
                <div className={`${card} rounded-2xl p-16 text-center`}>
                  <Users className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Students Found</h3>
                  <p className={`text-xs ${textSecondary} mt-1`}>Try clearing your search query or adjusting your filters.</p>
                </div>
              ) : (
                <div className={`${card} rounded-2xl overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className={`${thead} uppercase text-xs`}>
                        <tr>
                          <th className="p-4">Roll Number</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Department</th>
                          <th className="p-4">Batch & Section</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divider}`}>
                        {pagedAllStudents.map(s => (
                          <tr key={s.id} className={`${trHover} transition`}>
                            <td className={`p-4 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'} text-xs`}>{s.rollNumber}</td>
                            <td className="p-4">
                              <p className={`font-semibold ${textPrimary}`}>{s.user?.name}</p>
                              <p className={`text-xs ${textSecondary}`}>{s.user?.email}</p>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-semibold border border-purple-500/20">
                                {s.department?.name || 'Department'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md text-xs font-medium border border-cyan-500/20">
                                  {(s as any).class?.name || 'Class N/A'}
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-medium border border-emerald-500/20">
                                  Sec {(s as any).section?.name || 'A'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    totalItems={filteredAllStudents.length}
                    itemsPerPage={PAGE_SIZE_STUDENTS}
                    currentPage={studentPage}
                    onPageChange={setStudentPage}
                    itemLabel="students"
                    colorScheme="purple"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: LOW ATTENDANCE — CATEGORIZED & PAGINATED */}
          {tab === 'low' && (
            <motion.div key="low" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h1 className={`text-2xl font-extrabold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>⚠️ Low Attendance Watchlist (&lt;75%)</h1>
                <p className={`${textSecondary} text-xs`}>Students falling behind the required attendance percentage</p>
              </div>

              <OrgFilterBar />

              {lowStudents.length === 0 ? (
                <div className={`${card} rounded-2xl p-16 text-center`}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>All Students On Track!</h3>
                  <p className={`text-xs ${textSecondary} mt-1`}>No students are below the 75% attendance threshold.</p>
                </div>
              ) : (
                <div>
                  {/* Interactive summary stats / filters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setLowSeverityFilter('ALL')}
                      className={`${card} rounded-2xl p-4 text-center border transition cursor-pointer text-left ${
                        lowSeverityFilter === 'ALL'
                          ? 'ring-2 ring-purple-500 border-purple-500 shadow-md shadow-purple-500/20'
                          : 'hover:border-purple-500/40'
                      }`}
                    >
                      <span className="text-2xl font-bold text-purple-400">{filteredLowStudents.length}</span>
                      <p className={`text-xs ${textSecondary} mt-1 font-bold`}>All Low (&lt;75%)</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLowSeverityFilter('CRITICAL')}
                      className={`${card} rounded-2xl p-4 text-center border transition cursor-pointer text-left ${
                        lowSeverityFilter === 'CRITICAL'
                          ? 'ring-2 ring-rose-500 border-rose-500 shadow-md shadow-rose-500/20'
                          : 'hover:border-rose-500/40'
                      }`}
                    >
                      <span className="text-2xl font-bold text-rose-400">{criticalLow.length}</span>
                      <p className={`text-xs ${textSecondary} mt-1 font-bold`}>Critical (&lt;50%)</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLowSeverityFilter('WARNING')}
                      className={`${card} rounded-2xl p-4 text-center border transition cursor-pointer text-left ${
                        lowSeverityFilter === 'WARNING'
                          ? 'ring-2 ring-amber-500 border-amber-500 shadow-md shadow-amber-500/20'
                          : 'hover:border-amber-500/40'
                      }`}
                    >
                      <span className="text-2xl font-bold text-amber-400">{warningLow.length}</span>
                      <p className={`text-xs ${textSecondary} mt-1 font-bold`}>Warning (50-65%)</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLowSeverityFilter('CAUTION')}
                      className={`${card} rounded-2xl p-4 text-center border transition cursor-pointer text-left ${
                        lowSeverityFilter === 'CAUTION'
                          ? 'ring-2 ring-orange-500 border-orange-500 shadow-md shadow-orange-500/20'
                          : 'hover:border-orange-500/40'
                      }`}
                    >
                      <span className="text-2xl font-bold text-orange-400">{cautionLow.length}</span>
                      <p className={`text-xs ${textSecondary} mt-1 font-bold`}>Caution (65-75%)</p>
                    </button>
                  </div>

                  {filteredLowStudentsBySeverity.length === 0 ? (
                    <div className={`${card} rounded-2xl p-12 text-center`}>
                      <p className={`text-sm ${textSecondary}`}>No students in this severity category.</p>
                    </div>
                  ) : (
                    <div className={`${card} rounded-2xl overflow-hidden`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className={`${thead} uppercase text-xs`}>
                            <tr>
                              <th className="p-4">Student</th>
                              <th className="p-4">Roll Number</th>
                              <th className="p-4">Department</th>
                              <th className="p-4">Attended / Total</th>
                              <th className="p-4">Attendance Rate</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${divider}`}>
                            {pagedLowStudents.map(s => {
                              const severity = s.percentage < 50 ? 'Critical' : s.percentage < 65 ? 'Warning' : 'Caution';
                              const colorText = severity === 'Critical' ? (isDark ? 'text-rose-400' : 'text-rose-600') :
                                                severity === 'Warning' ? (isDark ? 'text-amber-400' : 'text-amber-600') :
                                                (isDark ? 'text-orange-400' : 'text-orange-600');
                              const barColor = severity === 'Critical' ? 'bg-rose-500' :
                                               severity === 'Warning' ? 'bg-amber-500' : 'bg-orange-400';
                              return (
                                <tr key={s.studentId} className={`${trHover} transition`}>
                                  <td className={`p-4 font-semibold ${textPrimary}`}>{s.name}</td>
                                  <td className={`p-4 font-mono font-bold ${colorText} text-xs`}>{s.rollNumber}</td>
                                  <td className={`p-4 text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{s.department}</td>
                                  <td className={`p-4 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{s.presentCount} / {s.totalClasses}</td>
                                  <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-24 ${isDark ? 'bg-slate-800' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
                                        <div className={`${barColor} h-full`} style={{ width: `${s.percentage}%` }} />
                                      </div>
                                      <span className={`font-extrabold ${colorText} text-sm`}>{s.percentage}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination
                        totalItems={filteredLowStudentsBySeverity.length}
                        itemsPerPage={PAGE_SIZE_LOW}
                        currentPage={lowPage}
                        onPageChange={setLowPage}
                        itemLabel="students"
                        colorScheme="purple"
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: CORRECTIONS — CATEGORIZED & PAGINATED */}
          {tab === 'corrections' && (
            <motion.div key="corrections" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Student Attendance Corrections</h1>
                  <p className={`${textSecondary} text-xs`}>Approve or reject discrepancies submitted by students</p>
                </div>
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2">
                  {(['ALL', 'PENDING', 'RESOLVED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCorrectionStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        correctionStatusFilter === st
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30'
                          : isDark
                          ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {st === 'ALL' ? `All (${corrections.length})` : st === 'PENDING' ? `Pending (${pendingCorrections.length})` : `Resolved (${resolvedCorrections.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCorrectionsByStatus.length === 0 ? (
                <div className={`${card} rounded-2xl p-16 text-center`}>
                  <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>No Correction Requests</h3>
                  <p className={`text-xs ${textSecondary} mt-1`}>No requests matching the selected status filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pagedCorrections.map(c => (
                    <div key={c.id} className={`${card} rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${c.status !== 'PENDING' ? 'opacity-70' : ''}`}>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`font-bold ${textPrimary}`}>{c.attendance?.student?.user?.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            c.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                          Course: <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-semibold`}>{c.attendance?.session?.course?.name}</span> • Requested: <span className="font-bold text-emerald-400">{c.requestedStatus}</span>
                        </p>
                        <p className={`text-xs ${textSecondary} mt-2 ${cardInner} p-3 rounded-xl border`}>
                          "{c.reason}"
                        </p>
                      </div>
                      {c.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button onClick={() => handleCorrection(c.id, 'APPROVED')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-emerald-600/30">
                            <Check className="w-4 h-4" /> <span>Approve</span>
                          </button>
                          <button onClick={() => handleCorrection(c.id, 'REJECTED')} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center space-x-1 hover:bg-rose-600 hover:text-white transition">
                            <X className="w-4 h-4" /> <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Pagination
                    totalItems={filteredCorrectionsByStatus.length}
                    itemsPerPage={PAGE_SIZE_CORRECTIONS}
                    currentPage={correctionPage}
                    onPageChange={setCorrectionPage}
                    itemLabel="requests"
                    colorScheme="purple"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: AI ANALYTICS */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <EarlyWarningAnalytics />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CREATE SESSION MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className={`fixed inset-0 z-50 ${overlayBg} backdrop-blur-sm flex items-center justify-center p-4`}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`${modalBg} border rounded-2xl max-w-md w-full p-6 shadow-2xl`}>
              <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>Create Class Session</h3>
              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4 font-semibold">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} block mb-1`}>Course</label>
                  <select required value={newSessionData.courseId} onChange={e => setNewSessionData({ ...newSessionData, courseId: e.target.value })} className={`w-full ${selectCls} border rounded-xl p-2.5 text-sm`}>
                    <option value="">Select Course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} block mb-1`}>Target Section</label>
                  <select required value={newSessionData.sectionId} onChange={e => setNewSessionData({ ...newSessionData, sectionId: e.target.value })} className={`w-full ${selectCls} border rounded-xl p-2.5 text-sm`}>
                    <option value="">Select Section...</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.class?.name} - Section {sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} block mb-1`}>Date</label>
                  <input type="date" required value={newSessionData.date} onChange={e => setNewSessionData({ ...newSessionData, date: e.target.value })} className={`w-full ${selectCls} border rounded-xl p-2.5 text-sm`} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} block mb-1`}>Start Time</label>
                    <input type="datetime-local" required value={newSessionData.startTime} onChange={e => setNewSessionData({ ...newSessionData, startTime: e.target.value })} className={`w-full ${selectCls} border rounded-xl p-2 text-xs`} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} block mb-1`}>End Time</label>
                    <input type="datetime-local" required value={newSessionData.endTime} onChange={e => setNewSessionData({ ...newSessionData, endTime: e.target.value })} className={`w-full ${selectCls} border rounded-xl p-2 text-xs`} />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'} text-sm`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30">Launch Session</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default FacultyDashboard;
