import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Keyboard,
  BookOpen,
  Clock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SessionResult {
  id: string;
  date: string;
  course?: { name: string; code: string };
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

// ─── Component ───────────────────────────────────────────────────────────────

export default function MarkAttendance() {
  const { isDark } = useTheme();
  const { token } = useAuthStore();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<SessionResult | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');
  const isComplete = digits.every(d => d !== '');

  // ── Input handlers ───────────────────────────────────────────────────────

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const reset = () => {
    setDigits(['', '', '', '', '', '']);
    setState('idle');
    setMessage('');
    setSession(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || state === 'loading') return;

    setState('loading');
    setMessage('');
    setSession(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/smart-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setMessage(data.error || 'Failed to mark attendance. Please try again.');
        return;
      }

      setState('success');
      setMessage(data.message ?? 'Attendance marked successfully!');
      setSession(data.session ?? null);
    } catch {
      setState('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── SUCCESS ───────────────────────────────────────────────── */}
          {state === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </motion.div>

              <h2 className={`text-3xl font-extrabold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>You're In! ✅</h2>
              <p className="text-emerald-500 font-semibold text-sm mb-6">{message}</p>

              {session && (
                <div className={`rounded-2xl p-5 mb-6 text-left space-y-3 border ${
                  isDark ? 'bg-slate-900/80 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
                }`}>
                  {session.course && (
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Course</p>
                        <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {session.course.name}
                          <span className="ml-2 text-xs font-mono text-emerald-500">{session.course.code}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Session Date</p>
                      <p className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {new Date(session.date).toLocaleString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        PRESENT
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Mark Another Session
              </button>
            </motion.div>
          ) : (

            /* ── INPUT ──────────────────────────────────────────────── */
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Keyboard className="w-8 h-8 text-white" />
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Mark Attendance</h1>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Enter the <span className="text-cyan-500 font-bold">6-digit code</span> shown by your teacher
                </p>
              </div>

              {/* Security tip */}
              <div className={`flex items-start gap-2 rounded-xl p-3 mb-6 text-xs border ${
                isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
              }`}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
                <span>The code refreshes every 15 seconds — enter it quickly before it changes.</span>
              </div>

              {/* OTP boxes */}
              <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-3 mb-8">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      disabled={state === 'loading'}
                      className={`w-12 h-14 text-center text-2xl font-extrabold font-mono rounded-xl border-2 outline-none transition
                        ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm'}
                        ${d
                          ? 'border-cyan-500 text-cyan-500 shadow-lg shadow-cyan-500/20'
                          : isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
                        }
                        ${state === 'error' ? '!border-rose-500 !text-rose-500' : ''}
                        focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20
                        disabled:opacity-50 cursor-text`}
                    />
                  ))}
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {state === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl px-4 py-3 text-xs font-semibold mb-5"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isComplete || state === 'loading'}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-base shadow-lg shadow-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {state === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mark Me Present
                    </>
                  )}
                </button>

                {state === 'error' && (
                  <button
                    type="button"
                    onClick={reset}
                    className={`w-full mt-3 py-2.5 rounded-xl font-medium text-sm transition border ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    Clear & Try Again
                  </button>
                )}
              </form>

              <p className={`text-center text-xs mt-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Only students enrolled in the class section can mark attendance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
