import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Brain, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import StudentRiskCard, { type RiskAnalytics } from '../../components/StudentRiskCard';
import { useTheme } from '../../context/ThemeContext';

const EarlyWarningAnalytics: React.FC = () => {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState<RiskAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics/early-warning`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Categorize students by risk level for a cleaner layout
  const highRisk = analytics.filter(s => s.riskLevel === 'High Risk');
  const moderateRisk = analytics.filter(s => s.riskLevel === 'Moderate Risk');
  const safe = analytics.filter(s => s.riskLevel === 'Safe');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Brain className="w-8 h-8 text-purple-500" />
            AI Early Warning System
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Predictive analytics identifying students at risk of falling behind. Categorized by urgency.
          </p>
        </div>
        
        {/* Quick Summary Stats */}
        <div className="flex gap-4">
          <div className={`rounded-xl p-4 flex flex-col items-center min-w-[100px] border ${
            isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <span className="text-2xl font-bold">{highRisk.length}</span>
            <span className="text-xs uppercase font-bold tracking-wider mt-1 opacity-80">High Risk</span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center min-w-[100px] border ${
            isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <span className="text-2xl font-bold">{moderateRisk.length}</span>
            <span className="text-xs uppercase font-bold tracking-wider mt-1 opacity-80">Watchlist</span>
          </div>
          <div className={`rounded-xl p-4 flex flex-col items-center min-w-[100px] border ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <span className="text-2xl font-bold">{safe.length}</span>
            <span className="text-xs uppercase font-bold tracking-wider mt-1 opacity-80">Safe</span>
          </div>
        </div>
      </div>

      {analytics.length === 0 && (
        <div className={`text-center py-16 rounded-3xl border ${
          isDark ? 'text-slate-400 bg-slate-900/40 border-slate-800' : 'text-slate-500 bg-slate-100/70 border-slate-200'
        }`}>
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-40 text-purple-400" />
          <p className="text-base font-semibold">No students found or insufficient data to run AI analytics.</p>
        </div>
      )}

      {/* Category: High Risk */}
      {highRisk.length > 0 && (
        <section className="space-y-4">
          <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-rose-500/20 text-rose-400' : 'border-rose-200 text-rose-600'}`}>
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Critical Action Required (&lt;60% attendance)</h3>
            <span className="ml-2 bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full text-xs font-bold">{highRisk.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {highRisk.map((student, idx) => (
              <StudentRiskCard key={student.studentId} student={student} idx={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Category: Moderate Risk */}
      {moderateRisk.length > 0 && (
        <section className="space-y-4">
          <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-amber-500/20 text-amber-400' : 'border-amber-200 text-amber-600'}`}>
            <Info className="w-6 h-6" />
            <h3 className="text-xl font-bold">Watchlist (60% - 74% attendance)</h3>
            <span className="ml-2 bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">{moderateRisk.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {moderateRisk.map((student, idx) => (
              <StudentRiskCard key={student.studentId} student={student} idx={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Category: Safe */}
      {safe.length > 0 && (
        <section className="space-y-4 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-emerald-500/20 text-emerald-400' : 'border-emerald-200 text-emerald-600'}`}>
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-xl font-bold">On Track (&ge;75% attendance)</h3>
            <span className="ml-2 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">{safe.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {safe.map((student, idx) => (
              <StudentRiskCard key={student.studentId} student={student} idx={idx} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default EarlyWarningAnalytics;
