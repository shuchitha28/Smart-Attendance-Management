import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, Sparkles, Shield, GraduationCap, BookOpen, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Login: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        role
      });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setRole(demoRole);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header Bar for navigation & theme toggle */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Background Animated Blobs */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
        }`}
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-cyan-600/20' : 'bg-cyan-400/20'
        }`}
        animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`backdrop-blur-xl border p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 transition-colors duration-200 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart Attendance</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sign in to your institutional account</p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className={`mb-6 p-3 rounded-2xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('admin@college.edu', 'ADMIN')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition flex items-center justify-center gap-1 ${
                isDark ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              <Shield className="w-3 h-3" /> Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('smith@college.edu', 'FACULTY')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition flex items-center justify-center gap-1 ${
                isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20' : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
              }`}
            >
              <BookOpen className="w-3 h-3" /> Faculty
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student1@college.edu', 'STUDENT')}
              className={`py-1.5 px-2 rounded-lg border font-medium transition flex items-center justify-center gap-1 ${
                isDark ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/20' : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" /> Student
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'STUDENT', label: 'Student' },
                { id: 'FACULTY', label: 'Faculty' },
                { id: 'ADMIN', label: 'Admin' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    role === r.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 font-bold'
                      : isDark
                        ? 'bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-800'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Email Address
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <User className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
                placeholder="name@college.edu"
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <p className={`mt-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          New to the platform?{' '}
          <Link to="/register" className="text-purple-500 hover:text-purple-600 font-semibold transition">
            Create an Account →
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
