'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Terminal, 
  LogIn,
  Layers,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Enrollment, Course, User } from '@/types';
import { fetchApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export default function MyCoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());

    async function loadData() {
      try {
        const data = await fetchApi<Enrollment[]>('/learning/my-courses');
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Please log in to access your personal learning workspace');
      }

      // Also load public featured tracks to show recommendations if 0 enrollments
      try {
        const catalog = await fetchApi<Course[]>('/courses?limit=3&sort_by=popular');
        setFeaturedCourses(Array.isArray(catalog) ? catalog : []);
      } catch (_) {}

      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Personalized Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 text-cyan-500 uppercase tracking-wider mb-2">
            <Terminal className="w-3.5 h-3.5" /> Learner Workplace Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {user ? `Welcome back, ${user.full_name}` : 'My Learning Portal'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your corporate scenario milestones, active SQL sandbox notebooks, and verified certificates.
          </p>
        </div>

        <Link
          href="/courses"
          className="gradient-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Compass className="w-4 h-4" /> Browse All Tracks
        </Link>
      </div>

      {/* Error / Auth Required Notice */}
      {error && !user && (
        <div className="glass-card p-8 rounded-3xl border border-amber-500/30 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please log in with your REWOIX credentials to inspect your active corporate simulations and progress.
          </p>
          <Link
            href="/login?redirect=/learn/my-courses"
            className="inline-flex items-center gap-2 gradient-button px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
          >
            Sign In Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Enrolled Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card h-48 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Active Corporate Simulations ({enrollments.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <div key={enr.id} className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="font-medium">Mentor: {enr.teacher_name}</span>
                    {enr.is_completed ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded font-bold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="bg-blue-500/10 text-cyan-400 px-2.5 py-0.5 rounded font-bold border border-blue-500/20">
                        In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {enr.course_title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Scenario Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{enr.progress_percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${Math.max(enr.progress_percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <Link
                    href={`/learn/courses/${enr.course_id}`}
                    className="flex-1 gradient-button py-2.5 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-transform"
                  >
                    <PlayCircle className="w-4 h-4" /> Enter Workspace Lab
                  </Link>

                  {enr.is_completed && (
                    <Link
                      href={`/certificates/verify/RWX-CERT-${enr.course_id.slice(0, 8).toUpperCase()}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-4 h-4" /> Certificate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Recommended Simulations */
        <div className="space-y-8">
          <div className="glass-card p-10 md:p-12 rounded-3xl border border-white/10 text-center space-y-4 bg-gradient-to-br from-slate-900/60 to-blue-950/20">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Ready for your first corporate scenario?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You do not have any active simulations yet. Browse our verified tracks below to experience real business datasets, stakeholder pushback, and measurable ROI.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 gradient-button px-6 py-3 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-blue-500/20"
              >
                Browse Simulation Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recommended Starter Tracks */}
          {featuredCourses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recommended Starter Tracks</h3>
                <Link href="/courses" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((c) => (
                  <div key={c.id} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {c.level}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mt-2">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{c.subtitle || c.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                      <div>
                        <span className="text-base font-black text-slate-900 dark:text-white">₹{(c.discount_price || c.price).toLocaleString('en-IN')}</span>
                      </div>
                      <Link
                        href={`/courses/${c.id}`}
                        className="px-3.5 py-1.5 rounded-lg gradient-button text-white text-xs font-bold shadow-sm"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
