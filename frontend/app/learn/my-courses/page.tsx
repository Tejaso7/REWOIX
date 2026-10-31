'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  CheckCircle, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Users,
  Compass,
  Clock,
  ChevronRight
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { Enrollment, Course, User } from '@/types';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());

    async function loadData() {
      try {
        const enrData = await fetchApi<Enrollment[]>('/learning/my-courses');
        setEnrollments(Array.isArray(enrData) ? enrData : []);
      } catch (err) {
        console.error('Failed loading my-courses:', err);
      }

      try {
        const coursesData = await fetchApi<Course[]>('/courses?limit=3');
        setFeaturedCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error('Failed loading recommended courses:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header Banner with Personalized Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
            Enterprise Learner Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {user?.full_name ? `Welcome back, ${user.full_name}` : 'My Workplace Simulations'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Your active production scenarios, real corporate schema partitions, progress telemetry, and verifiable certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 transition-colors inline-flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Browse More Tracks</span>
          </Link>
        </div>
      </div>

      {!user && !loading && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <span>You are viewing this portal in guest preview mode. Sign in to sync your verified progress.</span>
          <Link
            href="/login?redirect=/learn/my-courses"
            className="font-bold underline flex items-center gap-1 hover:text-amber-500"
          >
            Sign In Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Enrolled Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card h-64 rounded-3xl animate-pulse bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5" />
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Active Corporate Simulations ({enrollments.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <div
                key={enr.id}
                className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 bg-white/60 dark:bg-slate-900/40"
              >
                {/* Card Thumbnail Banner */}
                <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
                  {enr.course_thumbnail_url ? (
                    <img
                      src={enr.course_thumbnail_url}
                      alt={enr.course_title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                      <Layers className="w-8 h-8 text-cyan-400 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3">
                    {enr.is_completed ? (
                      <span className="bg-emerald-500/90 text-white backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="bg-blue-600/90 text-white backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                        In Progress
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 text-xs font-medium text-slate-300">
                    Mentor: <span className="font-bold text-white">{enr.teacher_name}</span>
                  </div>
                </div>

                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {enr.course_title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Workplace Scenario Progress</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {enr.progress_percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.max(enr.progress_percentage, 6)}%` }}
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
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Recommended Simulations */
        <div className="space-y-8">
          <div className="glass-card p-10 md:p-14 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-4 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900/60 dark:to-blue-950/20 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Ready for your first corporate scenario?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You do not have any active simulations yet. Browse our verified tracks below to experience real business datasets, stakeholder pushback, and measurable ROI.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 gradient-button px-6 py-3 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
              >
                Browse Simulation Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recommended Starter Tracks */}
          {featuredCourses.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recommended Starter Tracks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Handpicked workplace scenarios to build your production portfolio
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  View full catalog <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="h-32 w-full bg-slate-950 relative overflow-hidden">
                      {c.thumbnail_url ? (
                        <img
                          src={c.thumbnail_url}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-950 to-slate-950 flex items-center justify-center">
                          <Layers className="w-6 h-6 text-cyan-400 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur text-cyan-400 px-2 py-0.5 rounded border border-white/10">
                          {c.level}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {c.subtitle || c.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                        <div>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{(c.discount_price || c.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link
                          href={`/courses/${c.id}`}
                          className="px-3.5 py-1.5 rounded-lg gradient-button text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                        >
                          Enroll Now
                        </Link>
                      </div>
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
