'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, LogIn, Sparkles, Loader2, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { saveAuthSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const routeByRole = (user: any) => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (user.roles?.includes('ADMIN')) {
      router.push('/admin/dashboard');
    } else if (user.roles?.includes('TEACHER')) {
      router.push('/teacher/dashboard');
    } else {
      router.push('/learn/my-courses');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMsg('');

    try {
      const data = await fetchApi<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveAuthSession(data.access_token, data.refresh_token, data.user);
      routeByRole(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address first.');
      return;
    }

    setSendingOtp(true);
    setError('');
    setStatusMsg('');

    try {
      const res = await fetchApi<any>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'login' }),
      });

      setOtpSent(true);
      setStatusMsg('One-time verification code sent to your email.');
      if (res.debug_otp) {
        setDebugOtp(res.debug_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchApi<any>('/auth/login-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      saveAuthSession(data.access_token, data.refresh_token, data.user);
      routeByRole(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setStatusMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Log in to your REWOIX workspace account</p>
        </div>

        {/* Tab Switcher: Password vs Email OTP */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError('');
              setStatusMsg('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'password'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError('');
              setStatusMsg('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'otp'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email OTP (2FA)
          </button>
        </div>

        {/* Status Messages & Error Badges */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {statusMsg}
          </div>
        )}

        {debugOtp && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs text-center font-mono">
            Development Debug Code: <span className="font-bold underline tracking-widest">{debugOtp}</span>
          </div>
        )}

        {/* Standard Password Form */}
        {authMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@example.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to REWOIX</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Passwordless Email OTP Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@example.com"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={sendingOtp || !email}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
                >
                  {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{otpSent ? 'Resend' : 'Send Code'}</span>
                </button>
              </div>
            </div>

            {otpSent && (
              <form onSubmit={handleOtpLogin} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="Enter code (e.g. 123456)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-center tracking-[0.3em] font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                    Enter the one-time authentication code sent to your inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !otp}
                  className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Access Workspace</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Credentials Autofill */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@example.com', 'admin123')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-cyan-400 font-bold border border-slate-200 dark:border-white/5 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('teacher@example.com', 'teacher123')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 font-bold border border-slate-200 dark:border-white/5 transition-colors"
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('student@example.com', 'student123')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold border border-slate-200 dark:border-white/5 transition-colors"
            >
              Learner
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 dark:text-cyan-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
