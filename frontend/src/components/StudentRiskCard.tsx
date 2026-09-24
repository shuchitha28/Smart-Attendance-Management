import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface RiskAnalytics {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  className: string;
  totalClasses: number;
  presentClasses: number;
  attendancePercentage: number;
  riskLevel: string;
  riskScore: number;
  reason: string;
}

interface StudentRiskCardProps {
  student: RiskAnalytics;
  idx: number;
}

const StudentRiskCard: React.FC<StudentRiskCardProps> = ({ student, idx }) => {
  const { isDark } = useTheme();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High Risk':
        return isDark
          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
          : 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Moderate Risk':
        return isDark
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
          : 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Safe':
        return isDark
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return isDark
          ? 'text-slate-400 bg-slate-500/10 border-slate-500/30'
          : 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High Risk': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'Moderate Risk': return <Info className="w-4 h-4 text-amber-500" />;
      case 'Safe': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  const getCardBg = () => {
    if (student.riskLevel === 'High Risk') {
      return isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50/60 border-rose-200 shadow-sm';
    }
    if (student.riskLevel === 'Moderate Risk') {
      return isDark ? 'bg-amber-950/20 border-amber-500/20' : 'bg-amber-50/60 border-amber-200 shadow-sm';
    }
    return isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`rounded-2xl border p-6 transition-all duration-200 ${getCardBg()}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{student.name}</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{student.rollNumber} • {student.className}</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${getRiskColor(student.riskLevel)}`}>
          {getRiskIcon(student.riskLevel)}
          {student.riskLevel}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Attendance Ratio</span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{student.attendancePercentage}% ({student.presentClasses}/{student.totalClasses})</span>
          </div>
          <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${student.attendancePercentage >= 75 ? 'bg-emerald-500' : student.attendancePercentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(student.attendancePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <p className="text-xs leading-relaxed">
            <span className="text-purple-500 font-bold mr-1.5">AI Insight:</span>
            {student.reason}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentRiskCard;
