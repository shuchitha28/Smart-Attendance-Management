import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes floatTeacher {
          0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(5deg); }
          25% { transform: translateY(-18px) rotateY(8deg) rotateX(3deg); }
          75% { transform: translateY(-10px) rotateY(-6deg) rotateX(7deg); }
        }
        @keyframes floatStudent {
          0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(-5deg); }
          30% { transform: translateY(-22px) rotateY(-10deg) rotateX(-3deg); }
          70% { transform: translateY(-8px) rotateY(7deg) rotateX(-8deg); }
        }
        @keyframes bobBook {
          0%, 100% { transform: rotate(-5deg) translateY(0px); }
          50% { transform: rotate(5deg) translateY(-5px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.08); }
        }
        @keyframes orbitDot {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        @keyframes orbitDot2 {
          0% { transform: rotate(120deg) translateX(50px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(50px) rotate(-480deg); }
        }
        @keyframes orbitDot3 {
          0% { transform: rotate(240deg) translateX(70px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(70px) rotate(-600deg); }
        }
        @keyframes particleDrift {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; transform: translateY(80vh) scale(1); }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(0.5); opacity: 0; }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-300px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        .teacher-3d {
          animation: floatTeacher 7s ease-in-out infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 30px 40px rgba(139,92,246,0.35)) drop-shadow(0 0 25px rgba(99,102,241,0.2));
        }
        .student-3d {
          animation: floatStudent 8s ease-in-out infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 30px 40px rgba(6,182,212,0.35)) drop-shadow(0 0 25px rgba(14,165,233,0.2));
        }
        .book-bob {
          animation: bobBook 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .glow-circle-t { animation: glowPulse 4s ease-in-out infinite; }
        .glow-circle-s { animation: glowPulse 4s ease-in-out infinite 2s; }
        .orbit-dot-1 { animation: orbitDot 4s linear infinite; }
        .orbit-dot-2 { animation: orbitDot2 5s linear infinite; }
        .orbit-dot-3 { animation: orbitDot3 6s linear infinite; }
        .orbit-dot-1s { animation: orbitDot 4s linear infinite 0.5s; }
        .orbit-dot-2s { animation: orbitDot2 5s linear infinite 1s; }
        .orbit-dot-3s { animation: orbitDot3 6s linear infinite 1.5s; }
        .particle { animation: particleDrift linear infinite; }
        .shimmer-line { animation: shimmerLine linear infinite; }
      `}</style>

      {/* Gradient bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(139,92,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(6,182,212,0.07) 0%, transparent 60%)' }} />

      {/* Shimmer lines */}
      {[0,1,2].map(i => (
        <div key={i} className="shimmer-line" style={{ position:'absolute', top:`${20+i*30}%`, left:0, width:'200px', height:'1px', background:'linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)', animationDuration:`${8+i*3}s`, animationDelay:`${i*2.5}s` }} />
      ))}

      {/* Particles */}
      {Array.from({length:12}).map((_,i) => (
        <div key={i} className="particle" style={{ position:'absolute', left:`${5+(i*8)%90}%`, width:`${3+(i%3)}px`, height:`${3+(i%3)}px`, borderRadius:'50%', background: i%2===0 ? `rgba(139,92,246,${0.4+(i%3)*0.15})` : `rgba(6,182,212,${0.4+(i%3)*0.15})`, animationDuration:`${10+(i*3)%12}s`, animationDelay:`${(i*1.5)%8}s` }} />
      ))}

      {/* TEACHER */}
      <div style={{ position:'absolute', left:'6%', bottom:'5%', perspective:'600px' }}>
        <div className="glow-circle-t" style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:'180px', height:'220px', borderRadius:'50%', background:'radial-gradient(ellipse at center, rgba(139,92,246,0.35) 0%, transparent 70%)', filter:'blur(20px)' }} />
        <div style={{ position:'absolute', top:'20%', left:'50%', width:0, height:0 }}>
          <div className="orbit-dot-1" style={{position:'absolute'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'rgba(139,92,246,0.8)',boxShadow:'0 0 10px rgba(139,92,246,0.9)'}} /></div>
          <div className="orbit-dot-2" style={{position:'absolute'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'rgba(99,102,241,0.8)',boxShadow:'0 0 8px rgba(99,102,241,0.9)'}} /></div>
          <div className="orbit-dot-3" style={{position:'absolute'}}><div style={{width:'5px',height:'5px',borderRadius:'50%',background:'rgba(167,139,250,0.8)',boxShadow:'0 0 6px rgba(167,139,250,0.9)'}} /></div>
        </div>
        <div className="teacher-3d">
          <svg width="160" height="280" viewBox="0 0 160 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tRobe" x1="45" y1="155" x2="132" y2="260" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="50%" stopColor="#6D28D9"/>
                <stop offset="100%" stopColor="#4C1D95"/>
              </linearGradient>
              <linearGradient id="tShirt" x1="65" y1="146" x2="95" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EEF2FF"/>
                <stop offset="100%" stopColor="#C7D2FE"/>
              </linearGradient>
              <linearGradient id="bkCover" x1="-8" y1="188" x2="14" y2="216" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0EA5E9"/>
                <stop offset="100%" stopColor="#0369A1"/>
              </linearGradient>
            </defs>
            <ellipse cx="80" cy="270" rx="50" ry="8" fill="rgba(0,0,0,0.2)"/>
            <path d="M45 170 Q30 220 28 260 Q55 255 80 256 Q105 255 132 260 Q130 220 115 170 Q100 155 80 155 Q60 155 45 170Z" fill="url(#tRobe)"/>
            <path d="M45 170 Q40 200 38 230 Q55 228 65 230 Q60 200 65 175Z" fill="rgba(0,0,0,0.1)"/>
            <path d="M65 155 L80 175 L95 155 Q90 148 80 146 Q70 148 65 155Z" fill="url(#tShirt)"/>
            <rect x="72" y="130" width="16" height="22" rx="8" fill="#FDDCB5"/>
            <ellipse cx="80" cy="112" rx="28" ry="32" fill="#FDDCB5"/>
            <ellipse cx="72" cy="108" rx="10" ry="14" fill="rgba(255,255,255,0.15)"/>
            <path d="M52 100 Q55 75 80 72 Q105 75 108 100 Q100 88 80 86 Q60 88 52 100Z" fill="#4B2D0A"/>
            <ellipse cx="68" cy="110" rx="5" ry="6" fill="white"/>
            <ellipse cx="92" cy="110" rx="5" ry="6" fill="white"/>
            <circle cx="69" cy="111" r="3" fill="#1e293b"/>
            <circle cx="93" cy="111" r="3" fill="#1e293b"/>
            <circle cx="70" cy="110" r="1.2" fill="white"/>
            <circle cx="94" cy="110" r="1.2" fill="white"/>
            <rect x="60" y="105" width="18" height="12" rx="4" fill="none" stroke="rgba(30,41,59,0.7)" strokeWidth="1.5"/>
            <rect x="82" y="105" width="18" height="12" rx="4" fill="none" stroke="rgba(30,41,59,0.7)" strokeWidth="1.5"/>
            <line x1="78" y1="111" x2="82" y2="111" stroke="rgba(30,41,59,0.7)" strokeWidth="1.5"/>
            <path d="M78 118 Q80 122 82 118" stroke="#C8956A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M70 124 Q80 130 90 124" stroke="#C8956A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="52" cy="112" rx="5" ry="7" fill="#F5C89A"/>
            <ellipse cx="108" cy="112" rx="5" ry="7" fill="#F5C89A"/>
            <path d="M45 170 Q25 175 20 185 Q18 195 22 200 Q35 190 50 185Z" fill="#FDDCB5"/>
            <ellipse cx="14" cy="203" rx="7" ry="8" fill="#FDDCB5"/>
            <g className="book-bob">
              <rect x="-8" y="188" width="22" height="28" rx="2" fill="url(#bkCover)"/>
              <rect x="-8" y="188" width="4" height="28" rx="2" fill="rgba(0,0,0,0.2)"/>
              <line x1="-4" y1="196" x2="12" y2="196" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="-4" y1="200" x2="12" y2="200" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <line x1="-4" y1="204" x2="10" y2="204" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
            </g>
            <path d="M115 170 Q135 160 145 150 Q148 145 144 142 Q138 148 130 155 Q120 162 112 168Z" fill="#FDDCB5"/>
            <ellipse cx="147" cy="140" rx="5" ry="7" fill="#FDDCB5"/>
            <rect x="62" y="175" width="36" height="18" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <text x="80" y="188" textAnchor="middle" fontSize="7" fill="white" fontFamily="monospace">FACULTY</text>
            <ellipse cx="80" cy="82" rx="32" ry="8" fill="#1e293b"/>
            <rect x="60" y="68" width="40" height="14" rx="2" fill="#0f172a"/>
            <line x1="112" y1="82" x2="120" y2="90" stroke="#F59E0B" strokeWidth="2"/>
            <circle cx="120" cy="92" r="3" fill="#F59E0B"/>
          </svg>
        </div>
        <div style={{ position:'absolute', bottom:'-30px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(99,102,241,0.9))', color:'white', fontSize:'10px', fontWeight:700, letterSpacing:'0.08em', padding:'4px 12px', borderRadius:'20px', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(139,92,246,0.4)', border:'1px solid rgba(255,255,255,0.2)' }}>
          ✦ FACULTY PORTAL
        </div>
      </div>

      {/* STUDENT */}
      <div style={{ position:'absolute', right:'6%', bottom:'5%', perspective:'600px' }}>
        <div className="glow-circle-s" style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:'180px', height:'220px', borderRadius:'50%', background:'radial-gradient(ellipse at center, rgba(6,182,212,0.35) 0%, transparent 70%)', filter:'blur(20px)' }} />
        <div style={{ position:'absolute', top:'20%', left:'50%', width:0, height:0 }}>
          <div className="orbit-dot-1s" style={{position:'absolute'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'rgba(6,182,212,0.8)',boxShadow:'0 0 10px rgba(6,182,212,0.9)'}} /></div>
          <div className="orbit-dot-2s" style={{position:'absolute'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'rgba(14,165,233,0.8)',boxShadow:'0 0 8px rgba(14,165,233,0.9)'}} /></div>
          <div className="orbit-dot-3s" style={{position:'absolute'}}><div style={{width:'5px',height:'5px',borderRadius:'50%',background:'rgba(56,189,248,0.8)',boxShadow:'0 0 6px rgba(56,189,248,0.9)'}} /></div>
        </div>
        <div className="student-3d">
          <svg width="145" height="270" viewBox="0 0 145 270" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sPants" x1="35" y1="195" x2="110" y2="255" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E3A5F"/>
                <stop offset="100%" stopColor="#0F2040"/>
              </linearGradient>
              <linearGradient id="sHoodie" x1="30" y1="146" x2="117" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0EA5E9"/>
                <stop offset="50%" stopColor="#0284C7"/>
                <stop offset="100%" stopColor="#0369A1"/>
              </linearGradient>
              <linearGradient id="sShirt" x1="60" y1="138" x2="84" y2="162" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F0FDFF"/>
                <stop offset="100%" stopColor="#BAE6FD"/>
              </linearGradient>
            </defs>
            <ellipse cx="72" cy="260" rx="45" ry="7" fill="rgba(0,0,0,0.18)"/>
            <path d="M35 195 Q30 230 28 255 Q50 252 72 253 Q94 252 117 255 Q115 230 110 195Z" fill="url(#sPants)"/>
            <path d="M40 160 Q28 185 30 200 Q50 198 72 198 Q94 198 115 200 Q117 185 105 160 Q93 148 72 146 Q51 148 40 160Z" fill="url(#sHoodie)"/>
            <rect x="56" y="175" width="32" height="18" rx="4" fill="rgba(0,0,0,0.15)"/>
            <path d="M60 146 L72 162 L84 146 Q80 140 72 138 Q64 140 60 146Z" fill="url(#sShirt)"/>
            <rect x="65" y="122" width="14" height="20" rx="7" fill="#F3C299"/>
            <ellipse cx="72" cy="104" rx="26" ry="30" fill="#F3C299"/>
            <ellipse cx="64" cy="100" rx="10" ry="13" fill="rgba(255,255,255,0.12)"/>
            <path d="M46 98 Q50 72 72 68 Q94 72 98 98 Q90 80 72 78 Q54 80 46 98Z" fill="#2D1810"/>
            <path d="M46 98 Q44 105 46 112 Q48 110 48 98Z" fill="#2D1810"/>
            <path d="M98 98 Q100 105 98 112 Q96 110 96 98Z" fill="#2D1810"/>
            <ellipse cx="61" cy="102" rx="5" ry="5.5" fill="white"/>
            <ellipse cx="83" cy="102" rx="5" ry="5.5" fill="white"/>
            <circle cx="62" cy="103" r="3" fill="#0f172a"/>
            <circle cx="84" cy="103" r="3" fill="#0f172a"/>
            <circle cx="63" cy="102" r="1.2" fill="white"/>
            <circle cx="85" cy="102" r="1.2" fill="white"/>
            <path d="M56 96 Q61 93 66 95" stroke="#2D1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M78 95 Q83 93 88 96" stroke="#2D1810" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M70 110 Q72 114 74 110" stroke="#D4935A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M63 118 Q72 124 81 118" stroke="#D4935A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="46" cy="104" rx="5" ry="7" fill="#F0B882"/>
            <ellipse cx="98" cy="104" rx="5" ry="7" fill="#F0B882"/>
            <circle cx="46" cy="104" r="4" fill="#1e293b"/>
            <circle cx="46" cy="104" r="2" fill="#06B6D4"/>
            <circle cx="98" cy="104" r="4" fill="#1e293b"/>
            <circle cx="98" cy="104" r="2" fill="#06B6D4"/>
            <path d="M40 165 Q22 170 16 182 Q12 192 16 198 Q28 188 42 180Z" fill="#F3C299"/>
            <ellipse cx="14" cy="200" rx="7" ry="8" fill="#F3C299"/>
            <rect x="-2" y="184" width="18" height="24" rx="3" fill="#0f172a"/>
            <rect x="0" y="186" width="14" height="18" rx="2" fill="#06B6D4" opacity="0.9"/>
            <rect x="2" y="188" width="10" height="2" rx="1" fill="white" opacity="0.6"/>
            <rect x="2" y="192" width="8" height="2" rx="1" fill="white" opacity="0.4"/>
            <rect x="2" y="196" width="10" height="2" rx="1" fill="white" opacity="0.6"/>
            <path d="M104 165 Q120 170 126 185 Q128 193 124 196 Q114 186 106 175Z" fill="#F3C299"/>
            <ellipse cx="126" cy="198" rx="7" ry="8" fill="#F3C299"/>
            <ellipse cx="46" cy="253" rx="20" ry="6" fill="#1e293b"/>
            <ellipse cx="98" cy="253" rx="20" ry="6" fill="#1e293b"/>
          </svg>
        </div>
        <div style={{ position:'absolute', bottom:'-30px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(14,165,233,0.9))', color:'white', fontSize:'10px', fontWeight:700, letterSpacing:'0.08em', padding:'4px 12px', borderRadius:'20px', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(6,182,212,0.4)', border:'1px solid rgba(255,255,255,0.2)' }}>
          ✦ STUDENT PORTAL
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
