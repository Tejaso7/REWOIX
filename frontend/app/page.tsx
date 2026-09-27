'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, BookOpen, Shield, TrendingUp, Award, ArrowRight } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { Course, Category } from '@/types';
import { fetchApi } from '@/lib/api';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, catRes] = await Promise.all([
          fetchApi<Course[]>('/courses?sort_by=popular&limit=6'),
          fetchApi<Category[]>('/courses/categories'),
        ]);
        setCourses(Array.isArray(cRes) ? cRes : []);
        setCategories(Array.isArray(catRes) ? catRes : []);
      } catch (err) {
        console.error('Failed loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-slate-50 to-slate-50 dark:from-blue-900/30 dark:via-slate-950 dark:to-slate-950 -z-10 transition-colors duration-300" />
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> Enterprise LMS Platform • 10,000+ Active Users Ready
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Learn from Experts. Build Real Systems. <br />
            <span className="gradient-text">Master Your Future.</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Discover production-ready engineering, AI, and cloud courses with interactive video playback, progress auto-saving, graded quizzes, and instant certificates.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4">
            <form action="/courses" method="GET" className="relative flex items-center">
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, skills, or teachers (e.g. Next.js, FastAPI, AI)..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 pl-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none shadow-xl"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 gradient-button px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md"
              >
                Search
              </button>
            </form>
          </div>

          {/* Stats Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Verified Courses</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">70%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Teacher Share Split</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">4.9/5</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Average Student Rating</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Instant</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Verifiable Certificate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Categories</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Browse curated topics across engineering and science</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category_id=${cat.id}`}
                className="glass-card p-5 rounded-2xl hover:border-blue-500/40 transition-all group flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description || 'Explore top rated courses'}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular & Featured Courses</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Top selling courses reviewed and approved by platform admins</p>
          </div>
          <Link href="/courses" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            View All Courses →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No courses published yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Log in as Teacher or Admin to create and publish demo courses!</p>
          </div>
        )}
      </section>

      {/* Trust & Architecture Features */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strict RBAC Security</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Role-based access control with OAuth2 JWT, backend payment verification, and signed media URLs to keep content protected.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Financial Ledger</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated 70/30 commission splits, exact decimal calculations, teacher earnings ledger, and instant payout tracking.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifiable Certificates</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every course completion generates a cryptographic certificate hash and public verification URL.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
