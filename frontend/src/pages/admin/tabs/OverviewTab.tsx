import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Building2, BookOpen, Users, Clock, CheckCircle, XCircle, Layers, AlertTriangle } from 'lucide-react';
import type { Stats, ThemeClasses } from '../types';

interface OverviewTabProps {
  stats: Stats | null;
  setTab: (tab: string) => void;
  theme: ThemeClasses;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, setTab, theme }) => {
  const { textPrimary, textSecondary, cardInner, card } = theme;

  const academicStatCards = [
    { label: 'Total Enrolled Students', value: stats?.totalStudents ?? '—', icon: Users, gradient: 'from-blue-500 to-indigo-600', note: 'Active across all branches' },
    { label: 'Faculty Members', value: stats?.totalFaculty ?? '—', icon: BookOpen, gradient: 'from-purple-500 to-violet-600', note: 'Instructors & lecturers' },
    { label: 'Academic Departments', value: stats?.totalDepartments ?? '—', icon: Building2, gradient: 'from-amber-500 to-orange-600', note: 'Accredited branches' },
  ];

  const attendanceStatCards = [
    { label: 'Total Sessions Recorded', value: stats?.totalSessions ?? '—', icon: Clock, gradient: 'from-cyan-500 to-blue-600', note: 'Aggregate term lectures' },
    { label: 'Present Today', value: stats?.presentToday ?? '—', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', note: 'Attended live sessions' },
    { label: 'Absent Today', value: stats?.absentToday ?? '—', icon: XCircle, gradient: 'from-rose-500 to-red-600', note: 'Unexcused absences' },
  ];

  return (
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
  );
};

export default OverviewTab;
