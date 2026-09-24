import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Users, Shield, BarChart2, Sparkles, AlertTriangle, BookOpen, GraduationCap, Zap, Activity, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

/* 3D Floating animation keyframes injected once */
const floatStyles = `
  @keyframes float3DTeacher {
    0%,100% { transform: translateY(0px) rotateY(-6deg) rotateX(4deg); }
    25% { transform: translateY(-18px) rotateY(8deg) rotateX(2deg); }
    75% { transform: translateY(-10px) rotateY(-10deg) rotateX(6deg); }
  }
  @keyframes float3DStudent {
    0%,100% { transform: translateY(0px) rotateY(6deg) rotateX(-4deg); }
    30% { transform: translateY(-22px) rotateY(-8deg) rotateX(-2deg); }
    70% { transform: translateY(-8px) rotateY(10deg) rotateX(-6deg); }
  }
  @keyframes bobBook3D {
    0%,100% { transform: rotate(-5deg) translateY(0px); }
    50% { transform: rotate(5deg) translateY(-5px); }
  }
  @keyframes orbitT1 { 0% { transform: rotate(0deg) translateX(55px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(55px) rotate(-360deg); } }
  @keyframes orbitT2 { 0% { transform: rotate(130deg) translateX(45px) rotate(-130deg); } 100% { transform: rotate(490deg) translateX(45px) rotate(-490deg); } }
  @keyframes orbitS1 { 0% { transform: rotate(60deg) translateX(55px) rotate(-60deg); } 100% { transform: rotate(420deg) translateX(55px) rotate(-420deg); } }
  @keyframes orbitS2 { 0% { transform: rotate(200deg) translateX(42px) rotate(-200deg); } 100% { transform: rotate(560deg) translateX(42px) rotate(-560deg); } }
  .t3d { animation: float3DTeacher 7s ease-in-out infinite; transform-style: preserve-3d; filter: drop-shadow(0 24px 32px rgba(139,92,246,0.4)); }
  .s3d { animation: float3DStudent 8s ease-in-out infinite; transform-style: preserve-3d; filter: drop-shadow(0 24px 32px rgba(6,182,212,0.4)); }
  .bk3d { animation: bobBook3D 3s ease-in-out infinite; transform-origin: center bottom; }
  .ot1 { animation: orbitT1 4s linear infinite; }
  .ot2 { animation: orbitT2 5.5s linear infinite; }
  .os1 { animation: orbitS1 4.5s linear infinite; }
  .os2 { animation: orbitS2 6s linear infinite; }
  @keyframes bgFloat1 {
    0%,100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.4; }
    33% { transform: translateY(-30px) rotate(120deg) scale(1.1); opacity: 0.6; }
    66% { transform: translateY(-15px) rotate(240deg) scale(0.95); opacity: 0.5; }
  }
  @keyframes bgFloat2 {
    0%,100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.3; }
    50% { transform: translateY(-40px) rotate(180deg) scale(1.15); opacity: 0.55; }
  }
  @keyframes bgFloat3 {
    0%,100% { transform: translateX(0px) translateY(0px) scale(1); opacity: 0.25; }
    40% { transform: translateX(20px) translateY(-25px) scale(1.05); opacity: 0.45; }
    80% { transform: translateX(-10px) translateY(-10px) scale(0.9); opacity: 0.3; }
  }
  @keyframes particleRise {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; transform: translateY(80vh) scale(1); }
    90% { opacity: 0.5; }
    100% { transform: translateY(-5vh) scale(0.5); opacity: 0; }
  }
  .bg-shape-1 { animation: bgFloat1 9s ease-in-out infinite; }
  .bg-shape-2 { animation: bgFloat2 12s ease-in-out infinite; }
  .bg-shape-3 { animation: bgFloat3 15s ease-in-out infinite; }
  .bg-shape-4 { animation: bgFloat1 11s ease-in-out infinite 3s; }
  .bg-shape-5 { animation: bgFloat2 8s ease-in-out infinite 5s; }
  .bg-shape-6 { animation: bgFloat3 13s ease-in-out infinite 2s; }
  .p-rise { animation: particleRise linear infinite; }
`;

/* 3D Teacher SVG Character */
const TeacherCharacter = () => (
  <div style={{ position: 'relative', perspective: '700px', perspectiveOrigin: '50% 50%' }}>
    {/* Orbit dots */}
    <div style={{ position: 'absolute', top: '18%', left: '50%', width: 0, height: 0, zIndex: 10 }}>
      <div className="ot1" style={{ position: 'absolute' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(139,92,246,0.9)', boxShadow: '0 0 10px rgba(139,92,246,1)' }} /></div>
      <div className="ot2" style={{ position: 'absolute' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(99,102,241,0.9)', boxShadow: '0 0 8px rgba(99,102,241,1)' }} /></div>
    </div>
    <div className="t3d">
      <svg width="170" height="300" viewBox="0 0 170 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lTRobe" x1="48" y1="158" x2="138" y2="270" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED"/><stop offset="55%" stopColor="#6D28D9"/><stop offset="100%" stopColor="#4C1D95"/>
          </linearGradient>
          <linearGradient id="lTShirt" x1="68" y1="148" x2="98" y2="178" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EEF2FF"/><stop offset="100%" stopColor="#C7D2FE"/>
          </linearGradient>
          <linearGradient id="lBook" x1="-10" y1="192" x2="16" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0EA5E9"/><stop offset="100%" stopColor="#0369A1"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Shadow */}
        <ellipse cx="85" cy="292" rx="52" ry="8" fill="rgba(0,0,0,0.18)"/>
        {/* Robe */}
        <path d="M48 172 Q32 226 30 268 Q58 262 85 264 Q112 262 140 268 Q138 226 122 172 Q106 158 85 158 Q64 158 48 172Z" fill="url(#lTRobe)"/>
        <path d="M48 172 Q43 204 41 236 Q58 234 68 236 Q63 204 68 178Z" fill="rgba(0,0,0,0.1)"/>
        {/* Shirt */}
        <path d="M68 158 L85 178 L102 158 Q96 150 85 148 Q74 150 68 158Z" fill="url(#lTShirt)"/>
        {/* Neck */}
        <rect x="76" y="132" width="18" height="24" rx="9" fill="#FDDCB5"/>
        {/* Head */}
        <ellipse cx="85" cy="114" rx="30" ry="34" fill="#FDDCB5"/>
        <ellipse cx="76" cy="110" rx="11" ry="15" fill="rgba(255,255,255,0.14)"/>
        {/* Hair */}
        <path d="M55 102 Q58 76 85 73 Q112 76 115 102 Q106 90 85 88 Q64 90 55 102Z" fill="#4B2D0A"/>
        {/* Eyes */}
        <ellipse cx="72" cy="112" rx="5.5" ry="6.5" fill="white"/>
        <ellipse cx="98" cy="112" rx="5.5" ry="6.5" fill="white"/>
        <circle cx="73" cy="113" r="3.2" fill="#1e293b"/>
        <circle cx="99" cy="113" r="3.2" fill="#1e293b"/>
        <circle cx="74" cy="112" r="1.3" fill="white"/>
        <circle cx="100" cy="112" r="1.3" fill="white"/>
        {/* Glasses */}
        <rect x="63" y="107" width="19" height="13" rx="4" fill="none" stroke="rgba(30,41,59,0.65)" strokeWidth="1.5"/>
        <rect x="86" y="107" width="19" height="13" rx="4" fill="none" stroke="rgba(30,41,59,0.65)" strokeWidth="1.5"/>
        <line x1="82" y1="113" x2="86" y2="113" stroke="rgba(30,41,59,0.65)" strokeWidth="1.5"/>
        {/* Nose */}
        <path d="M82 121 Q85 125 88 121" stroke="#C8956A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Smile */}
        <path d="M74 128 Q85 135 96 128" stroke="#C8956A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Ears */}
        <ellipse cx="55" cy="114" rx="5" ry="7" fill="#F5C89A"/>
        <ellipse cx="115" cy="114" rx="5" ry="7" fill="#F5C89A"/>
        {/* Left arm + book */}
        <path d="M48 175 Q26 180 20 192 Q17 202 22 208 Q36 196 52 188Z" fill="#FDDCB5"/>
        <ellipse cx="14" cy="210" rx="8" ry="9" fill="#FDDCB5"/>
        <g className="bk3d">
          <rect x="-10" y="192" width="24" height="30" rx="2" fill="url(#lBook)"/>
          <rect x="-10" y="192" width="5" height="30" rx="2" fill="rgba(0,0,0,0.2)"/>
          <line x1="-3" y1="200" x2="12" y2="200" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
          <line x1="-3" y1="206" x2="12" y2="206" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
          <line x1="-3" y1="212" x2="9" y2="212" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
        </g>
        {/* Right arm — pointing */}
        <path d="M122 175 Q142 164 152 154 Q156 148 152 145 Q145 152 136 160 Q126 167 118 174Z" fill="#FDDCB5"/>
        <ellipse cx="155" cy="143" rx="6" ry="8" fill="#FDDCB5"/>
        {/* Badge */}
        <rect x="65" y="180" width="40" height="19" rx="5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <text x="85" y="194" textAnchor="middle" fontSize="7.5" fill="white" fontFamily="monospace" fontWeight="bold">FACULTY</text>
        {/* Mortarboard */}
        <ellipse cx="85" cy="82" rx="34" ry="9" fill="#1e293b" filter="url(#glow)"/>
        <rect x="63" y="67" width="44" height="16" rx="2" fill="#0f172a"/>
        <line x1="119" y1="82" x2="128" y2="92" stroke="#F59E0B" strokeWidth="2.5"/>
        <circle cx="128" cy="95" r="4" fill="#F59E0B"/>
      </svg>
    </div>
  </div>
);

/* 3D Student SVG Character */
const StudentCharacter = () => (
  <div style={{ position: 'relative', perspective: '700px', perspectiveOrigin: '50% 50%' }}>
    {/* Orbit dots */}
    <div style={{ position: 'absolute', top: '18%', left: '50%', width: 0, height: 0, zIndex: 10 }}>
      <div className="os1" style={{ position: 'absolute' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(6,182,212,0.9)', boxShadow: '0 0 10px rgba(6,182,212,1)' }} /></div>
      <div className="os2" style={{ position: 'absolute' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(14,165,233,0.9)', boxShadow: '0 0 8px rgba(14,165,233,1)' }} /></div>
    </div>
    <div className="s3d">
      <svg width="155" height="285" viewBox="0 0 155 285" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lSPants" x1="36" y1="198" x2="116" y2="264" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0F2040"/>
          </linearGradient>
          <linearGradient id="lSHoodie" x1="32" y1="148" x2="120" y2="205" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0EA5E9"/><stop offset="50%" stopColor="#0284C7"/><stop offset="100%" stopColor="#0369A1"/>
          </linearGradient>
          <linearGradient id="lSShirt" x1="62" y1="138" x2="88" y2="166" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0FDFF"/><stop offset="100%" stopColor="#BAE6FD"/>
          </linearGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="76" cy="276" rx="46" ry="7" fill="rgba(0,0,0,0.17)"/>
        {/* Pants */}
        <path d="M36 198 Q32 232 30 260 Q52 256 76 258 Q100 256 122 260 Q120 232 116 198Z" fill="url(#lSPants)"/>
        {/* Hoodie */}
        <path d="M42 162 Q30 188 32 204 Q52 202 76 202 Q100 202 120 204 Q122 188 110 162 Q96 150 76 148 Q56 150 42 162Z" fill="url(#lSHoodie)"/>
        <rect x="58" y="178" width="36" height="20" rx="5" fill="rgba(0,0,0,0.14)"/>
        {/* Shirt */}
        <path d="M62 148 L76 166 L90 148 Q85 140 76 138 Q67 140 62 148Z" fill="url(#lSShirt)"/>
        {/* Neck */}
        <rect x="68" y="124" width="16" height="22" rx="8" fill="#F3C299"/>
        {/* Head */}
        <ellipse cx="76" cy="106" rx="28" ry="32" fill="#F3C299"/>
        <ellipse cx="67" cy="102" rx="11" ry="14" fill="rgba(255,255,255,0.12)"/>
        {/* Hair */}
        <path d="M48 100 Q52 74 76 70 Q100 74 104 100 Q95 82 76 80 Q57 82 48 100Z" fill="#2D1810"/>
        <path d="M48 100 Q46 108 48 116 Q50 113 50 100Z" fill="#2D1810"/>
        <path d="M104 100 Q106 108 104 116 Q102 113 102 100Z" fill="#2D1810"/>
        {/* Eyes */}
        <ellipse cx="64" cy="104" rx="5.5" ry="6" fill="white"/>
        <ellipse cx="88" cy="104" rx="5.5" ry="6" fill="white"/>
        <circle cx="65" cy="105" r="3.2" fill="#0f172a"/>
        <circle cx="89" cy="105" r="3.2" fill="#0f172a"/>
        <circle cx="66" cy="104" r="1.3" fill="white"/>
        <circle cx="90" cy="104" r="1.3" fill="white"/>
        {/* Eyebrows */}
        <path d="M59 98 Q64 95 69 97" stroke="#2D1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M83 97 Q88 95 93 98" stroke="#2D1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Nose */}
        <path d="M73 113 Q76 117 79 113" stroke="#D4935A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Smile */}
        <path d="M66 120 Q76 128 86 120" stroke="#D4935A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Ears */}
        <ellipse cx="48" cy="106" rx="5" ry="7" fill="#F0B882"/>
        <ellipse cx="104" cy="106" rx="5" ry="7" fill="#F0B882"/>
        {/* Earbuds */}
        <circle cx="48" cy="106" r="4.5" fill="#1e293b"/>
        <circle cx="48" cy="106" r="2.2" fill="#06B6D4"/>
        <circle cx="104" cy="106" r="4.5" fill="#1e293b"/>
        <circle cx="104" cy="106" r="2.2" fill="#06B6D4"/>
        {/* Left arm + tablet */}
        <path d="M42 168 Q24 174 18 186 Q14 196 18 202 Q30 192 44 182Z" fill="#F3C299"/>
        <ellipse cx="16" cy="204" rx="8" ry="9" fill="#F3C299"/>
        <rect x="2" y="186" width="20" height="26" rx="3" fill="#0f172a"/>
        <rect x="4" y="188" width="16" height="20" rx="2" fill="#06B6D4" opacity="0.9"/>
        <rect x="6" y="190" width="11" height="2" rx="1" fill="white" opacity="0.7"/>
        <rect x="6" y="194" width="9" height="2" rx="1" fill="white" opacity="0.5"/>
        <rect x="6" y="198" width="11" height="2" rx="1" fill="white" opacity="0.7"/>
        {/* Right arm */}
        <path d="M110 168 Q126 174 132 188 Q134 196 130 200 Q120 190 110 178Z" fill="#F3C299"/>
        <ellipse cx="132" cy="202" rx="8" ry="9" fill="#F3C299"/>
        {/* Shoes */}
        <ellipse cx="48" cy="259" rx="20" ry="7" fill="#1e293b"/>
        <ellipse cx="104" cy="259" rx="20" ry="7" fill="#1e293b"/>
      </svg>
    </div>
  </div>
);

const features = [
  { icon: Users, title: '5,000+ Students', desc: 'Managed across multiple departments and classes seamlessly.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: CheckCircle, title: 'Instant Tracking', desc: 'One-click attendance recording and QR/OTP verification for faculty.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: BarChart2, title: 'AI & Live Reports', desc: 'Identify low-attendance students instantly with predictive analytics.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Secure portals custom-built for Admins, Faculty, and Students.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Clock, title: 'History & Corrections', desc: 'Full audit logs, transparent timestamps, and appeal workflows.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: ArrowRight, title: 'Smart Defaulter Alerts', desc: 'Automated warnings when attendance drops below the 75% cutoff.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

const Landing: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#0a0c14] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Inject 3D animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: floatStyles }} />
      {/* ── Animated gradient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 80, 0], y: [0, -50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${
            isDark ? 'bg-purple-600/15' : 'bg-purple-300/30'
          }`} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 60, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
            isDark ? 'bg-blue-600/15' : 'bg-blue-300/30'
          }`} />
        <motion.div animate={{ x: [0, 40, 0], y: [0, -80, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className={`absolute top-3/4 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px] ${
            isDark ? 'bg-cyan-600/10' : 'bg-cyan-300/20'
          }`} />

        {/* Floating geometric shapes */}
        <div className={`bg-shape-1 absolute top-[12%] left-[8%] w-14 h-14 rounded-2xl rotate-12 border-2 ${ isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400/40 bg-purple-100/60' }`} />
        <div className={`bg-shape-2 absolute top-[20%] right-[10%] w-10 h-10 rounded-xl rotate-45 border-2 ${ isDark ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-400/40 bg-blue-100/60' }`} />
        <div className={`bg-shape-3 absolute top-[55%] left-[4%] w-8 h-8 rounded-lg rotate-12 border-2 ${ isDark ? 'border-cyan-500/25 bg-cyan-500/5' : 'border-cyan-400/35 bg-cyan-100/50' }`} />
        <div className={`bg-shape-4 absolute top-[70%] right-[6%] w-12 h-12 rounded-2xl -rotate-12 border-2 ${ isDark ? 'border-violet-500/25 bg-violet-500/5' : 'border-violet-400/35 bg-violet-100/50' }`} />
        <div className={`bg-shape-5 absolute top-[40%] right-[3%] w-6 h-6 rounded-full border-2 ${ isDark ? 'border-pink-500/30 bg-pink-500/5' : 'border-pink-400/40 bg-pink-100/60' }`} />
        <div className={`bg-shape-6 absolute top-[85%] left-[15%] w-9 h-9 rotate-45 border-2 ${ isDark ? 'border-amber-500/25 bg-amber-500/5' : 'border-amber-400/35 bg-amber-100/50' }`} />

        {/* Floating icon silhouettes */}
        <div className={`bg-shape-2 absolute top-[30%] left-[2%] ${ isDark ? 'text-purple-500/20' : 'text-purple-400/25' }`}><Zap size={28} /></div>
        <div className={`bg-shape-1 absolute top-[60%] right-[2%] ${ isDark ? 'text-cyan-500/20' : 'text-cyan-400/25' }`}><Activity size={24} /></div>
        <div className={`bg-shape-3 absolute top-[10%] right-[25%] ${ isDark ? 'text-blue-500/15' : 'text-blue-400/20' }`}><Bell size={22} /></div>
        <div className={`bg-shape-4 absolute top-[78%] right-[22%] ${ isDark ? 'text-violet-500/15' : 'text-violet-400/20' }`}><Shield size={20} /></div>

        {/* Rising particles */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} className="p-rise" style={{
            position: 'absolute',
            left: `${10 + i * 11}%`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? `rgba(139,92,246,${0.35 + (i % 3) * 0.1})` : `rgba(6,182,212,${0.35 + (i % 3) * 0.1})`,
            animationDuration: `${9 + (i * 2.5) % 10}s`,
            animationDelay: `${(i * 1.8) % 7}s`,
          }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className={`relative z-10 flex justify-between items-center px-8 lg:px-16 py-5 border-b backdrop-blur-md sticky top-0 transition-colors duration-200 ${
        isDark ? 'border-white/5 bg-[#0a0c14]/75 text-white' : 'border-slate-200 bg-white/80 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-lg shadow-purple-500/30">S</div>
          <span className="font-bold text-lg tracking-tight">Smart Attendance</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}>Log In</Link>
          <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 pt-24 pb-20 flex flex-col lg:flex-row items-center gap-12">
        {/* Left copy */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${
              isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}>
            <Sparkles size={14} /> Next-Generation Campus Management
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
            Smart tracking.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
              Smarter campus.
            </span>
          </h1>
          <p className={`text-lg mb-10 max-w-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Effortlessly manage attendance for 5,000+ students and faculty across all departments, classes and sections — with real-time reports and automated alerts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-bold text-base hover:scale-105 transition-transform shadow-xl shadow-purple-500/25">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login"
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-colors border ${
                isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}>
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Character Illustrations */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex items-end justify-center gap-6 relative">
          {/* Background glow */}
          <div className={`absolute inset-0 rounded-3xl blur-2xl ${
            isDark ? 'bg-gradient-to-b from-purple-500/10 to-blue-500/10' : 'bg-gradient-to-b from-purple-200/40 to-blue-200/40'
          }`} />

          {/* Teacher — CSS 3D float animation built into component */}
          <div className="relative flex flex-col items-center">
            <TeacherCharacter />
            <div className="mt-3 inline-flex items-center gap-1.5 bg-violet-600 border border-violet-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg shadow-violet-600/40">
              <BookOpen size={11} /> Faculty
            </div>
          </div>

          {/* Student — CSS 3D float animation built into component */}
          <div className="relative flex flex-col items-center -mb-4">
            <StudentCharacter />
            <div className="mt-3 inline-flex items-center gap-1.5 bg-cyan-500 border border-cyan-300/50 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg shadow-cyan-500/40">
              <GraduationCap size={11} /> Student
            </div>
          </div>

          {/* Floating stat badges */}
          <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity }}
            className={`absolute -top-4 -left-4 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-xl border flex items-center gap-2 ${
              isDark ? 'bg-[#1a1d27] border-emerald-500/30 text-white' : 'bg-white border-emerald-300 text-slate-800'
            }`}>
            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
            Present <span className="text-emerald-500 font-bold ml-0.5">85%</span>
          </motion.div>
          <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity }}
            className={`absolute -bottom-2 -right-4 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-xl border flex items-center gap-2 ${
              isDark ? 'bg-[#1a1d27] border-amber-500/30 text-white' : 'bg-white border-amber-300 text-slate-800'
            }`}>
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            Low attendance <span className="text-rose-500 font-bold ml-0.5">3</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Categorized Campus Intelligence</h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            A comprehensive solution for colleges handling thousands of students, department hierarchies, and AI-powered risk detection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl p-6 transition-all border cursor-default ${
                isDark ? 'bg-[#1a1d27] border-white/5 hover:border-purple-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300'
              }`}>
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                <f.icon size={24} className={f.color} />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className={`border rounded-3xl p-12 text-center relative overflow-hidden ${
            isDark ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/20' : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 shadow-md'
          }`}>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">Ready to modernize your institution?</h2>
            <p className={`mb-8 text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Join administrators, faculty, and students managing attendance smarter.</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-bold text-base hover:scale-105 transition-transform shadow-xl shadow-purple-500/25">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-8 text-center text-sm ${
        isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        © 2026 Smart Attendance Management System. Built with React, Node.js & PostgreSQL.
      </footer>
    </div>
  );
};

export default Landing;
