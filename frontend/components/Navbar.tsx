'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, ShieldCheck, GraduationCap, LayoutDashboard, Sun, Moon, Briefcase, DollarSign, Users } from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { User } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const updateUser = () => setUser(getCurrentUser());
    updateUser();
    window.addEventListener('storage', updateUser);
    window.addEventListener('auth-change', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('auth-change', updateUser);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/login');
  };

  const isTeacher = user?.roles?.includes('TEACHER');
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            REWO<span className="gradient-text">IX</span>
          </span>
        </Link>

        {/* Dynamic Role Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Browse Courses
          </Link>

          {user && (
            <Link href="/learn/my-courses" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> My Learning
            </Link>
          )}

          {user && !isTeacher && !isAdmin && (
            <Link href="/learn/onboarding" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-blue-600 dark:text-blue-400">
              Student Profile
            </Link>
          )}

          {isTeacher && (
            <>
              <Link href="/teacher/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <LayoutDashboard className="w-4 h-4" /> Teacher Portal
              </Link>
              <Link href="/teacher/onboarding" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-purple-500" /> Verification & Bank
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/admin/dashboard" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </Link>
              <Link href="/admin/users" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-blue-500" /> Users & Commission %
              </Link>
              <Link href="/admin/courses/manage" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Pricing Controller
              </Link>
            </>
          )}
        </div>

        {/* Controls: Theme Switcher & User Auth CTAs */}
        <div className="flex items-center gap-4">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors border border-slate-300/50 dark:border-slate-700"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-300/60 dark:border-slate-700">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.full_name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.full_name}</span>
                <span className="text-[10px] uppercase tracking-wider bg-blue-100 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300 font-bold">
                  {user.roles[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="gradient-button px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
