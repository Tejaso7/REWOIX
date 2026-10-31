'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, LogIn, Sparkles, Loader2 } from 'lucide-react';
import { saveAuthSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await fetchApi<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveAuthSession(data.access_token, data.refresh_token, data.user);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.roles?.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (data.user.roles?.includes('TEACHER')) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/learn/my-courses');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
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

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

        {/* Quick Demo Credentials Autofill */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> One-Click Demo Logins:
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
