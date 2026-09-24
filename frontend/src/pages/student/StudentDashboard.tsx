import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertTriangle, LogOut,
  LayoutDashboard, History, BookOpen, GraduationCap, ShieldAlert, Check,
  Search, FileText, Keyboard
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import MarkAttendance from './MarkAttendance';
import type { AttendanceRecord, SubjectStat, AttendanceSummary } from '../../types/attendance.types';


export default function StudentDashboard() {
  const { isDark } = useTheme();
  const { user, logout, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'history' | 'corrections' | 'mark'>('overview');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [myCorrections, setMyCorrections] = useState<any[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for correction request
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [requestedStatus, setRequestedStatus] = useState<'PRESENT' | 'LATE'>('PRESENT');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState('');
  const [correctionError, setCorrectionError] = useState('');

  // ─── Theme-aware class helpers ──────────────────────────
  const page = isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900';
  const sidebar = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const card = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const cardInner = isDark ? 'bg-slate-800/60 border-slate-700/70' : 'bg-gray-50 border-gray-200';
  const thead = isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-500';
  const trHover = isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50';
  const divider = isDark ? 'border-slate-800' : 'border-gray-200';
  const inputCls = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500';
  const selectCls = isDark
    ? 'bg-slate-800 border-slate-700 text-slate-100'
    : 'bg-white border-gray-300 text-gray-900';
  const textPrimary = isDark ? 'text-slate-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const modalBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const overlayBg = isDark ? 'bg-black/75' : 'bg-black/40';
  const navActive = isDark
    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
    : 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm';
  const navInactive = isDark
    ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      setProfile(meData);

      if (meData.student?.id) {
        const attRes = await fetch(`${API_BASE_URL}/api/attendance/student/${meData.student.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const attData = await attRes.json();
        setRecords(attData.records || []);
        setSummary(attData.summary || null);
        setSubjects(attData.subjects || []);

        const corrRes = await fetch(`${API_BASE_URL}/api/attendance/corrections/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const corrData = await corrRes.json();
        setMyCorrections(corrData || []);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmitting(true);
    setCorrectionError('');
    setCorrectionSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attendanceId: selectedRecord.id,
          requestedStatus,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit correction request');

      setCorrectionSuccess('Correction request submitted successfully! Pending approval.');
      setReason('');
      fetchProfileAndData();
      setTimeout(() => {
        setSelectedRecord(null);
        setCorrectionSuccess('');
      }, 2000);
    } catch (err: any) {
      setCorrectionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pct = summary ? parseFloat(summary.attendancePercentage) : 0;
  const isLowAttendance = pct < 75 && (summary?.totalClasses || 0) > 0;

  const filteredRecords = records.filter(r =>
    r.session?.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.session?.course?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Categorize records by date ─────────────────────────
  const today = new Date().toDateString();
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  const todayRecords = filteredRecords.filter(r => new Date(r.session?.date).toDateString() === today);
  const thisWeekRecords = filteredRecords.filter(r => {
    const d = new Date(r.session?.date);
    return d.toDateString() !== today && d >= thisWeekStart;
  });
  const olderRecords = filteredRecords.filter(r => new Date(r.session?.date) < thisWeekStart);

  // Categorize subjects by status
  const eligibleSubjects = subjects.filter(s => parseFloat(s.percentage) >= 75);
  const warningSubjects = subjects.filter(s => parseFloat(s.percentage) < 75);

  // Categorize corrections by status
  const pendingCorrections = myCorrections.filter(c => c.status === 'PENDING');
  const resolvedCorrections = myCorrections.filter(c => c.status !== 'PENDING');

  // ─── Records Table ──────────────────────────────────────
  const RecordTable = ({ recs, emptyMsg }: { recs: AttendanceRecord[]; emptyMsg?: string }) => {
    if (recs.length === 0 && emptyMsg) {
      return <p className={`text-xs ${textMuted} italic py-2`}>{emptyMsg}</p>;
    }
    return (
      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`${thead} uppercase text-xs`}>
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Course</th>
                <th className="p-4">Faculty</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {recs.map(record => (
                <tr key={record.id} className={`${trHover} transition`}>
                  <td className={`p-4 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    {new Date(record.session?.date).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'} text-xs mr-2 font-bold`}>{record.session?.course?.code}</span>
                    <span className={`${textPrimary} text-xs font-medium`}>{record.session?.course?.name}</span>
                  </td>
                  <td className={`p-4 ${textSecondary} text-xs`}>{record.session?.faculty?.user?.name || 'Faculty'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      record.status === 'PRESENT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : record.status === 'LATE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {record.status === 'ABSENT' && (
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className={`text-xs px-3 py-1.5 rounded-lg ${isDark ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200'} border font-bold transition`}
                      >
                        Request Fix
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen ${page} flex flex-col md:flex-row`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 ${sidebar} border-r p-6 flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`font-bold text-base leading-tight ${textPrimary}`}>Student Portal</h1>
                <p className={`text-xs ${textSecondary}`}>Smart Attendance</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1.5">
            {/* Mark Attendance — primary CTA at top */}
            <button
              onClick={() => setActiveTab('mark')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'mark'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Mark Attendance</span>
              <span className="ml-auto text-xs bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">LIVE</span>
            </button>

            <div className={`border-t ${isDark ? 'border-slate-800/60' : 'border-gray-200'} pt-1.5 mt-1.5`} />

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview' ? navActive : navInactive
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'subjects' ? navActive : navInactive
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'history' ? navActive : navInactive
              }`}
            >
              <History className="w-4 h-4" />
              <span>Attendance Records</span>
            </button>

            <button
              onClick={() => setActiveTab('corrections')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'corrections' ? navActive : navInactive
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>My Corrections</span>
              </div>
              {myCorrections.length > 0 && (
                <span className={`text-xs ${isDark ? 'bg-slate-800 text-cyan-300' : 'bg-cyan-50 text-cyan-600'} px-2 py-0.5 rounded-full font-bold`}>
                  {myCorrections.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className={`pt-6 border-t ${divider} mt-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-cyan-100 border-cyan-200 text-cyan-600'} border flex items-center justify-center font-bold`}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className={`font-semibold text-sm truncate ${textPrimary}`}>{user?.name}</p>
              <p className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-mono font-bold truncate`}>{profile?.student?.rollNumber || 'Student'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Profile Banner */}
        <div className={`relative rounded-2xl ${isDark ? 'bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-slate-800' : 'bg-gradient-to-r from-cyan-50 via-cyan-100 to-cyan-50 border-cyan-200'} border p-6 md:p-8 mb-8 overflow-hidden shadow-xl`}>
          <div className={`absolute top-0 right-0 w-96 h-96 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-200/30'} rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border-cyan-200'} border mb-2`}>
                STUDENT PROFILE
              </span>
              <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textPrimary}`}>
                Welcome, {user?.name}!
              </h2>
              <p className={`${textSecondary} mt-1 text-xs`}>
                Real-time course attendance, deficit warnings, and discrepancy resolution.
              </p>
            </div>

            {profile?.student && (
              <div className={`flex flex-wrap gap-3 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200'} backdrop-blur border p-4 rounded-xl text-xs`}>
                <div>
                  <span className={textMuted + ' block'}>Roll No:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{profile.student.rollNumber}</span>
                </div>
                <div className={`border-l ${divider} pl-3`}>
                  <span className={textMuted + ' block'}>Department:</span>
                  <span className={`font-semibold ${textPrimary}`}>{profile.student.department?.name || 'CSE'}</span>
                </div>
                <div className={`border-l ${divider} pl-3`}>
                  <span className={textMuted + ' block'}>Class & Sec:</span>
                  <span className={`font-semibold ${textPrimary}`}>
                    {profile.student.class?.name || '3rd Year'} ({profile.student.section?.name || 'A'})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 0: MARK ATTENDANCE */}
            {activeTab === 'mark' && (
              <motion.div key="mark" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MarkAttendance />
              </motion.div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                
                {/* Quick Action Banner */}
                <button
                  onClick={() => setActiveTab('mark')}
                  className={`w-full rounded-2xl ${isDark ? 'bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900/40 border-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200'} border p-5 shadow-lg ${isDark ? 'shadow-emerald-500/5' : ''} flex items-center justify-between group hover:border-emerald-500/40 transition`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Keyboard className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-emerald-300 text-sm">Mark Your Attendance</p>
                      <p className={`text-xs ${textSecondary} mt-0.5`}>Enter the 6-digit live code from your teacher</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full group-hover:bg-emerald-500/20 transition">
                    Open →
                  </span>
                </button>

                {/* Low Attendance Alert */}
                {isLowAttendance && (
                  <div className={`rounded-2xl ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border p-6 flex items-start space-x-4`}>
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'} text-base`}>Attendance Deficit Warning (&lt;75%)</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'} mt-1 leading-relaxed`}>
                        Your overall attendance is currently <span className="font-bold text-amber-400">{pct}%</span>.
                        Minimum requirement for exam eligibility is 75%. Please attend upcoming sessions regularly or submit correction requests for any wrongly recorded absences.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className={`${card} p-6 rounded-2xl border`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Overall Rate</p>
                        <h3 className={`text-3xl font-extrabold mt-2 ${pct >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {summary?.attendancePercentage || '0.0'}%
                        </h3>
                      </div>
                      <div className={`p-3 rounded-xl ${pct >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {pct >= 75 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>
                    </div>
                    <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-gray-200'} h-2 rounded-full mt-4 overflow-hidden`}>
                      <div className={`h-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>

                  <div className={`${card} p-6 rounded-2xl border`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Total Lectures</p>
                        <h3 className={`text-3xl font-extrabold ${textPrimary} mt-2`}>{summary?.totalClasses || 0}</h3>
                      </div>
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <p className={`text-xs ${textMuted} mt-4`}>Conducted across all subjects</p>
                  </div>

                  <div className={`${card} p-6 rounded-2xl border`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Attended</p>
                        <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{summary?.presentCount || 0}</h3>
                      </div>
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <p className={`text-xs ${textMuted} mt-4`}>Marked Present / Late</p>
                  </div>

                  <div className={`${card} p-6 rounded-2xl border`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Absences</p>
                        <h3 className="text-3xl font-extrabold text-rose-400 mt-2">{summary?.absentCount || 0}</h3>
                      </div>
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                        <XCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <p className={`text-xs ${textMuted} mt-4`}>Missed sessions</p>
                  </div>
                </div>

                {/* Subject Quick Breakdown — Categorized */}
                <div className={`${card} rounded-2xl p-6 border`}>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>Course Attendance Breakdown</h3>
                    <button onClick={() => setActiveTab('subjects')} className={`text-xs font-bold ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}>
                      View Detailed Subjects →
                    </button>
                  </div>

                  {warningSubjects.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} mb-2 uppercase tracking-wider flex items-center gap-1.5`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {warningSubjects.map(s => {
                          const spct = parseFloat(s.percentage);
                          return (
                            <div key={s.code} className={`${cardInner} p-4 rounded-xl border`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-mono text-xs font-bold ${isDark ? 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40' : 'text-cyan-600 bg-cyan-50 border-cyan-200'} px-2 py-0.5 rounded border`}>{s.code}</span>
                                <span className="text-xs font-bold text-amber-400">{s.percentage}%</span>
                              </div>
                              <h4 className={`font-semibold text-sm ${textPrimary} truncate mb-2`}>{s.name}</h4>
                              <p className={`text-xs ${textSecondary}`}>{s.present} of {s.total} sessions attended</p>
                              <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} h-1.5 rounded-full mt-3 overflow-hidden`}>
                                <div className="h-full bg-amber-500" style={{ width: `${Math.min(spct, 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {eligibleSubjects.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-2 uppercase tracking-wider flex items-center gap-1.5`}>
                        <CheckCircle className="w-3.5 h-3.5" /> On Track
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {eligibleSubjects.map(s => {
                          const spct = parseFloat(s.percentage);
                          return (
                            <div key={s.code} className={`${cardInner} p-4 rounded-xl border`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-mono text-xs font-bold ${isDark ? 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40' : 'text-cyan-600 bg-cyan-50 border-cyan-200'} px-2 py-0.5 rounded border`}>{s.code}</span>
                                <span className="text-xs font-bold text-emerald-400">{s.percentage}%</span>
                              </div>
                              <h4 className={`font-semibold text-sm ${textPrimary} truncate mb-2`}>{s.name}</h4>
                              <p className={`text-xs ${textSecondary}`}>{s.present} of {s.total} sessions attended</p>
                              <div className={`w-full ${isDark ? 'bg-slate-900' : 'bg-gray-200'} h-1.5 rounded-full mt-3 overflow-hidden`}>
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(spct, 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: SUBJECTS DETAIL — Categorized by status */}
            {activeTab === 'subjects' && (
              <motion.div key="subjects" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Subject-Wise Attendance Metrics</h1>
                  <p className={`${textSecondary} text-xs`}>Individual compliance metrics for each enrolled subject</p>
                </div>

                {warningSubjects.length > 0 && (
                  <section>
                    <div className={`flex items-center gap-2 border-b ${isDark ? 'border-amber-500/20' : 'border-amber-200'} pb-2 mb-4`}>
                      <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>Needs Improvement</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>{warningSubjects.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {warningSubjects.map(sub => {
                        const subPct = parseFloat(sub.percentage);
                        return (
                          <div key={sub.code} className={`${card} rounded-2xl p-6 border`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className={`font-mono text-xs font-bold ${isDark ? 'text-cyan-300 bg-cyan-950/60 border-cyan-800/50' : 'text-cyan-600 bg-cyan-50 border-cyan-200'} px-2.5 py-1 rounded-lg border`}>{sub.code}</span>
                                <h3 className={`text-lg font-bold ${textPrimary} mt-2`}>{sub.name}</h3>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Warning</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 my-4 text-center">
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Total</span>
                                <span className={`text-lg font-bold ${textPrimary}`}>{sub.total}</span>
                              </div>
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Present</span>
                                <span className="text-lg font-bold text-emerald-400">{sub.present}</span>
                              </div>
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Absent</span>
                                <span className="text-lg font-bold text-rose-400">{sub.absent}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className={textSecondary}>Attendance Percentage</span>
                                <span className="text-rose-400 font-bold">{sub.percentage}%</span>
                              </div>
                              <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
                                <div className="h-full bg-rose-500" style={{ width: `${Math.min(subPct, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {eligibleSubjects.length > 0 && (
                  <section>
                    <div className={`flex items-center gap-2 border-b ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'} pb-2 mb-4`}>
                      <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Eligible</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>{eligibleSubjects.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {eligibleSubjects.map(sub => {
                        const subPct = parseFloat(sub.percentage);
                        return (
                          <div key={sub.code} className={`${card} rounded-2xl p-6 border`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className={`font-mono text-xs font-bold ${isDark ? 'text-cyan-300 bg-cyan-950/60 border-cyan-800/50' : 'text-cyan-600 bg-cyan-50 border-cyan-200'} px-2.5 py-1 rounded-lg border`}>{sub.code}</span>
                                <h3 className={`text-lg font-bold ${textPrimary} mt-2`}>{sub.name}</h3>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Eligible</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 my-4 text-center">
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Total</span>
                                <span className={`text-lg font-bold ${textPrimary}`}>{sub.total}</span>
                              </div>
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Present</span>
                                <span className="text-lg font-bold text-emerald-400">{sub.present}</span>
                              </div>
                              <div className={`${cardInner} p-3 rounded-xl border`}>
                                <span className={`text-xs ${textSecondary} block`}>Absent</span>
                                <span className="text-lg font-bold text-rose-400">{sub.absent}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className={textSecondary}>Attendance Percentage</span>
                                <span className="text-emerald-400 font-bold">{sub.percentage}%</span>
                              </div>
                              <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(subPct, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {/* TAB 3: ATTENDANCE RECORDS — Categorized by date */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Complete Attendance History</h1>
                    <p className={`${textSecondary} text-xs`}>Full log of all lectures and your status</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className={`absolute left-3.5 top-3 w-4 h-4 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Filter by subject..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full ${inputCls} border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none`}
                    />
                  </div>
                </div>

                {todayRecords.length > 0 && (
                  <section>
                    <div className={`flex items-center gap-2 border-b ${isDark ? 'border-cyan-500/20' : 'border-cyan-200'} pb-2 mb-3`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>Today</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>{todayRecords.length}</span>
                    </div>
                    <RecordTable recs={todayRecords} />
                  </section>
                )}

                {thisWeekRecords.length > 0 && (
                  <section>
                    <div className={`flex items-center gap-2 border-b ${divider} pb-2 mb-3`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>This Week</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{thisWeekRecords.length}</span>
                    </div>
                    <RecordTable recs={thisWeekRecords} />
                  </section>
                )}

                {olderRecords.length > 0 && (
                  <section>
                    <div className={`flex items-center gap-2 border-b ${divider} pb-2 mb-3`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Earlier</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{olderRecords.length}</span>
                    </div>
                    <RecordTable recs={olderRecords} />
                  </section>
                )}

                {filteredRecords.length === 0 && (
                  <div className={`${card} rounded-2xl p-16 text-center border`}>
                    <History className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
                    <h3 className={`font-bold text-lg ${textPrimary}`}>No Records Found</h3>
                    <p className={`text-xs ${textSecondary} mt-1`}>No attendance records match your search.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: MY CORRECTIONS — Categorized by status */}
            {activeTab === 'corrections' && (
              <motion.div key="corrections" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h1 className={`text-2xl font-extrabold ${textPrimary}`}>My Correction Appeals</h1>
                  <p className={`${textSecondary} text-xs`}>Track the status of your submitted attendance correction requests</p>
                </div>

                {myCorrections.length === 0 ? (
                  <div className={`${card} rounded-2xl p-16 text-center border`}>
                    <FileText className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
                    <h3 className={`font-bold text-lg ${textPrimary}`}>No Correction Requests Filed</h3>
                    <p className={`text-xs ${textSecondary} mt-1 mb-4`}>You can click "Request Fix" next to any absent record in your Attendance Records tab.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Pending */}
                    {pendingCorrections.length > 0 && (
                      <section>
                        <div className={`flex items-center gap-2 border-b ${isDark ? 'border-amber-500/20' : 'border-amber-200'} pb-2 mb-4`}>
                          <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>Awaiting Review</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>{pendingCorrections.length}</span>
                        </div>
                        <div className="space-y-4">
                          {pendingCorrections.map(c => (
                            <div key={c.id} className={`${card} rounded-2xl p-6 border`}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className={`font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-bold text-xs`}>{c.attendance?.session?.course?.name}</span>
                                  <span className={`${textSecondary} text-xs block mt-1`}>Requested Status: <strong className={textPrimary}>{c.requestedStatus}</strong></span>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>
                              </div>
                              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'} ${cardInner} p-3 rounded-xl border`}>
                                <span className={`font-semibold ${textSecondary}`}>Reason:</span> "{c.reason}"
                              </p>
                              <p className={`text-xs ${textMuted} mt-2`}>Submitted on {new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Resolved */}
                    {resolvedCorrections.length > 0 && (
                      <section>
                        <div className={`flex items-center gap-2 border-b ${divider} pb-2 mb-4`}>
                          <CheckCircle className={`w-4 h-4 ${textMuted}`} />
                          <h3 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Resolved</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{resolvedCorrections.length}</span>
                        </div>
                        <div className="space-y-4">
                          {resolvedCorrections.map(c => (
                            <div key={c.id} className={`${card} rounded-2xl p-6 border opacity-75`}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className={`font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-bold text-xs`}>{c.attendance?.session?.course?.name}</span>
                                  <span className={`${textSecondary} text-xs block mt-1`}>Requested Status: <strong className={textPrimary}>{c.requestedStatus}</strong></span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {c.status}
                                </span>
                              </div>
                              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'} ${cardInner} p-3 rounded-xl border`}>
                                <span className={`font-semibold ${textSecondary}`}>Reason:</span> "{c.reason}"
                              </p>
                              <p className={`text-xs ${textMuted} mt-2`}>Submitted on {new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* CORRECTION REQUEST MODAL */}
      <AnimatePresence>
        {selectedRecord && (
          <div className={`fixed inset-0 z-50 ${overlayBg} backdrop-blur-sm flex items-center justify-center p-4`}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`${modalBg} border rounded-2xl max-w-md w-full p-6 shadow-2xl`}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>Request Attendance Correction</h3>
              <p className={`text-xs ${textSecondary} mb-6`}>
                Course: <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-semibold`}>{selectedRecord.session?.course?.name}</span> ({new Date(selectedRecord.session?.date).toLocaleDateString()})
              </p>

              {correctionError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-semibold">
                  {correctionError}
                </div>
              )}
              {correctionSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2 font-semibold">
                  <Check className="w-4 h-4" /> <span>{correctionSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} mb-1 uppercase`}>Requested Status</label>
                  <select
                    value={requestedStatus}
                    onChange={e => setRequestedStatus(e.target.value as 'PRESENT' | 'LATE')}
                    className={`w-full ${selectCls} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500`}
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'} mb-1 uppercase`}>Reason / Proof</label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Explain discrepancy (e.g. Present during lab session bench 3, missed roll call due to setup)"
                    className={`w-full ${selectCls} border rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500`}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setSelectedRecord(null)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-gray-100 text-gray-500 hover:text-gray-700'} text-sm font-medium`}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-600/30 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
