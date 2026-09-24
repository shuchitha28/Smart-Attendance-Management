import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle,
  GraduationCap, BookOpen, ShieldCheck, Check, Eye, EyeOff, Hash, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

interface Dept { id: string; name: string; code: string; }
interface Class { id: string; name: string; }
interface Section { id: string; name: string; }

const ROLES = [
  { value: 'STUDENT', label: 'Student', icon: GraduationCap, desc: 'View attendance, request corrections', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
  { value: 'FACULTY', label: 'Faculty', icon: BookOpen, desc: 'Mark attendance, manage sessions', color: 'from-purple-500 to-violet-500', glow: 'shadow-purple-500/20' },
  { value: 'ADMIN', label: 'Admin', icon: ShieldCheck, desc: 'Full system access & reports', color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
];

const steps = ['Account', 'Role', 'Details', 'Confirm'];

const Register: React.FC = () => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  // Student-specific
  const [rollNumber, setRollNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  // Faculty-specific
  const [employeeId, setEmployeeId] = useState('');

  // Dropdown data
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/departments`).then(r => setDepartments(r.data));
  }, []);

  useEffect(() => {
    if (departmentId) {
      setClassId(''); setSectionId('');
      axios.get(`${API_BASE_URL}/api/auth/classes?departmentId=${departmentId}`).then(r => setClasses(r.data));
    }
  }, [departmentId]);

  useEffect(() => {
    if (classId) {
      setSectionId('');
      axios.get(`${API_BASE_URL}/api/auth/sections?classId=${classId}`).then(r => setSections(r.data));
    }
  }, [classId]);

  const nextStep = () => {
    setError('');
    if (step === 0) {
      if (!name.trim()) return setError('Full name is required');
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('Valid email required');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');
    }
    if (step === 2) {
      if (role === 'STUDENT') {
        if (!rollNumber.trim()) return setError('Roll number is required');
        if (!departmentId) return setError('Please select a department');
        if (!classId) return setError('Please select a class');
        if (!sectionId) return setError('Please select a section');
      }
      if (role === 'FACULTY') {
        if (!employeeId.trim()) return setError('Employee ID is required');
        if (!departmentId) return setError('Please select a department');
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const payload: any = { name, email, password, role };
      if (role === 'STUDENT') Object.assign(payload, { rollNumber, departmentId, classId, sectionId });
      if (role === 'FACULTY') Object.assign(payload, { employeeId, departmentId });
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setStep(0);
    } finally { setLoading(false); }
  };

  const inputCls = `w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all ${
    isDark
      ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
  }`;

  const selectCls = `w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none text-sm appearance-none transition-all ${
    isDark
      ? 'bg-slate-800/80 border-slate-700 text-white'
      : 'bg-slate-50 border-slate-300 text-slate-900'
  }`;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };
  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); nextStep(); };
  const goPrev = () => { setDirection(-1); setError(''); setStep(s => s - 1); };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#0a0c14] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header Bar for navigation & theme toggle */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
        <ThemeToggle />
      </div>

      {/* Animated background */}
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className={`absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
          isDark ? 'bg-purple-600/10' : 'bg-purple-400/20'
        }`} />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }}
        className={`absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none ${
          isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'
        }`} />

      <div className="w-full max-w-lg relative z-10 pt-14 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30 text-white">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h1 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Join Smart Attendance Management</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-purple-600 text-white ring-4 ring-purple-500/30' :
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'
                }`}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-semibold ${
                  i === step ? 'text-purple-500' : i < step ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${
                  i < step ? 'bg-emerald-500' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        }`}>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* ── STEP 0: Account Info ── */}
            {step === 0 && (
              <motion.div key="step0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-4">
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Account Info</h2>

                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                </div>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input type={showPw ? 'text' : 'password'} placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} />
                </div>
                {password && confirmPassword && (
                  <p className={`text-xs ${password === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── STEP 1: Role Selection ── */}
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose Your Role</h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Select how you'll use the platform</p>
                <div className="space-y-3">
                  {ROLES.map(r => (
                    <motion.button key={r.value} onClick={() => setRole(r.value)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        role === r.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : isDark
                            ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0 shadow-lg ${r.glow}`}>
                        <r.icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.label}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        role === r.value ? 'border-purple-500 bg-purple-500' : isDark ? 'border-slate-600' : 'border-slate-300'
                      }`}>
                        {role === r.value && <Check size={12} className="text-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Role-Specific Details ── */}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-4">
                <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {role === 'STUDENT' ? '🎓 Student Details' : role === 'FACULTY' ? 'Faculty Details' : 'Admin Setup'}
                </h2>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {role === 'ADMIN' ? 'No additional details required for admin accounts.' : 'Fill in your academic information below.'}
                </p>

                {role === 'STUDENT' && (
                  <>
                    <div className="relative">
                      <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input type="text" placeholder="Roll Number (e.g. CS2024001)" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={`text-xs mb-1.5 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Department</label>
                      <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={selectCls}>
                        <option value="">-- Select Department --</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`text-xs mb-1.5 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Class</label>
                      <select value={classId} onChange={e => setClassId(e.target.value)} disabled={!departmentId} className={selectCls + (departmentId ? '' : ' opacity-40 cursor-not-allowed')}>
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`text-xs mb-1.5 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Section</label>
                      <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} className={selectCls + (classId ? '' : ' opacity-40 cursor-not-allowed')}>
                        <option value="">-- Select Section --</option>
                        {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {role === 'FACULTY' && (
                  <>
                    <div className="relative">
                      <Briefcase className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input type="text" placeholder="Employee ID (e.g. EMP002)" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={`text-xs mb-1.5 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Department</label>
                      <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={selectCls}>
                        <option value="">-- Select Department --</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {role === 'ADMIN' && (
                  <div className={`flex items-center gap-4 p-5 rounded-2xl border ${
                    isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <ShieldCheck size={40} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-500">Admin Account</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>You'll have full administrative access to manage campus students, faculty, departments, and attendance records.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 3: Confirmation ── */}
            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Confirm & Create Account</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Full Name', value: name },
                    { label: 'Email', value: email },
                    { label: 'Role', value: role },
                    ...(role === 'STUDENT' ? [
                      { label: 'Roll Number', value: rollNumber },
                      { label: 'Department', value: departments.find(d => d.id === departmentId)?.name || departmentId },
                      { label: 'Class', value: classes.find(c => c.id === classId)?.name || classId },
                      { label: 'Section', value: sections.find(s => s.id === sectionId)?.name || sectionId },
                    ] : []),
                    ...(role === 'FACULTY' ? [
                      { label: 'Employee ID', value: employeeId },
                      { label: 'Department', value: departments.find(d => d.id === departmentId)?.name || departmentId },
                    ] : []),
                  ].map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</span>
                      <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-500/25"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                  ) : (
                    <><Check size={18} /> Create My Account</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 3 && (
            <div className={`flex mt-6 gap-3 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
              {step > 0 && (
                <motion.button onClick={goPrev} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors text-sm border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}>
                  <ArrowLeft size={16} /> Back
                </motion.button>
              )}
              <motion.button onClick={goNext} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 text-sm">
                {step === 2 ? 'Review' : 'Continue'} <ArrowRight size={16} />
              </motion.button>
            </div>
          )}
        </div>

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 hover:text-purple-600 font-semibold transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
