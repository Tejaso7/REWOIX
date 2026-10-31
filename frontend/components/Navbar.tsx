'use client';

import { useState, useEffect, useRef } from 'react';
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
  Menu, 
  X,
  ArrowRight,
  Layers,
  Bell,
  CheckCheck,
  ShieldAlert,
  Clock,
  Info
} from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { fetchApi } from '@/lib/api';
import { User } from '@/types';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
}

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetchApi<{ unread_count: number }>('/notifications/unread-count'),
        fetchApi<NotificationItem[]>('/notifications?limit=8'),
      ]);
      setUnreadCount(countRes.unread_count || 0);
      setNotifications(listRes || []);
    } catch {
      // Non-critical background failure (e.g. unauthenticated or network drop)
    }
  };

  useEffect(() => {
    const updateUser = () => {
      const u = getCurrentUser();
      setUser(u);
      if (u) {
        fetchNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);
    window.addEventListener('auth-change', updateUser);

    // Click outside to dismiss notification dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('auth-change', updateUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    router.push('/login');
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetchApi('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
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

        {/* Right Actions: Theme Toggle, Notifications, Waitlist CTA, Auth */}
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

          {/* Notification Bell Dropdown (When Logged In) */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) fetchNotifications();
                }}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-white/10"
                title="Notifications & Security Alerts"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-slate-950 shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] glass-card rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden text-xs">
                  {/* Header */}
                  <div className="p-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Security & Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-1">
                        <CheckCheck className="w-6 h-6 mx-auto text-emerald-500 opacity-80" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">All Caught Up!</p>
                        <p className="text-[11px]">No active notifications or alerts at this time.</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => !item.is_read && handleMarkAsRead(item.id, e)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 cursor-pointer ${
                            !item.is_read ? 'bg-blue-500/5 dark:bg-cyan-500/5 font-medium' : 'opacity-80'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {item.event_type === 'SECURITY_LOGIN' ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                            ) : item.event_type?.includes('COURSE') ? (
                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                <Info className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 dark:text-white leading-tight">
                                {item.title}
                              </span>
                              {!item.is_read && (
                                <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" title="Unread" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                              {item.message}
                            </p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
              Comparison Matrix
            </Link>
            <Link 
              href="/#personas" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Who It's For
            </Link>
            <Link 
              href="/courses" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Catalog</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </Link>

            {user && (
              <>
                <Link 
                  href="/learn/my-courses" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-cyan-400 flex items-center justify-between"
                >
                  <span>My Learning Workspace</span>
                  <GraduationCap className="w-4 h-4" />
                </Link>
                {isTeacher && (
                  <Link 
                    href="/teacher/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-between"
                  >
                    <span>Teacher Studio</span>
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    href="/admin/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-between"
                  >
                    <span>Platform Admin Console</span>
                    <ShieldCheck className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
            <Link
              href="/#waitlist"
              onClick={() => setMobileMenuOpen(false)}
              className="gradient-button w-full py-2.5 rounded-xl text-center text-xs font-bold"
            >
              Join Waitlist
            </Link>
            {!user ? (
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-blue-600 text-white"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({user.full_name || 'User'})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
