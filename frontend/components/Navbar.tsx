'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Briefcase, 
  DollarSign, 
  Users, 
  Menu, 
  X,
  ArrowRight,
  Layers
} from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { User } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/80 dark:border-white/10 px-6 py-3.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-button flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                REWO<span className="gradient-text">IX</span>
              </span>
            </div>
          </Link>
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400">
            Corporate Experience Simulator
          </span>
        </div>

        {/* Primary Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/#simulation" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Simulation
          </Link>
          <Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            How It Works
          </Link>
          <Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Tracks
          </Link>
          <Link href="/#comparison" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Comparison
          </Link>
          <Link href="/#personas" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Who It's For
          </Link>
          <Link href="/courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" /> Catalog
          </Link>

          {/* Role specific portals */}
          {user && (
            <Link href="/learn/my-courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-3.5 h-3.5" /> My Learning
            </Link>
          )}

          {isTeacher && (
            <Link href="/teacher/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <LayoutDashboard className="w-3.5 h-3.5" /> Teacher
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin/dashboard" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </div>

        {/* Right Actions: Theme Toggle, Waitlist CTA, Auth */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-white/10"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Join Waitlist Action Button */}
          <Link
            href="/#waitlist"
            className="hidden sm:inline-flex items-center gap-1.5 gradient-button px-4 py-2 text-xs font-bold rounded-xl shadow-md"
          >
            Join Waitlist <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {user.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">{user.full_name || 'User'}</span>
                <span className="text-[9px] uppercase tracking-wider bg-blue-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-700 dark:text-cyan-300 font-bold">
                  {user.roles && user.roles.length > 0 ? user.roles[0] : 'USER'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-slate-200 dark:border-white/10 mt-3 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link 
              href="/#simulation" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Simulation Mockup
            </Link>
            <Link 
              href="/#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              How It Works
            </Link>
            <Link 
              href="/#tracks" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Simulation Tracks
            </Link>
            <Link 
              href="/#comparison" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Courses vs. REWOIX
            </Link>
            <Link 
              href="/#personas" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Target Personas
            </Link>
            <Link 
              href="/courses" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-cyan-400"
            >
              Course Catalog
            </Link>
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-left px-3 py-2 text-red-500 font-semibold"
              >
                Sign Out ({user.full_name})
              </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/#waitlist"
              onClick={() => setMobileMenuOpen(false)}
              className="gradient-button text-center py-2.5 rounded-xl font-bold text-white text-xs mt-2"
            >
              Request Early Access
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
