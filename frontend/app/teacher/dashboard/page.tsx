'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchApi<any>('/teacher/dashboard');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Teacher access required');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading teacher metrics...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Teacher Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage courses, student enrollments, and earnings</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="gradient-button px-5 py-3 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-lg self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create New Course
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{(data?.total_earnings || 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">70% Teacher Commission</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.total_students || 0}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Active learners enrolled</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Courses</span>
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.total_courses || 0}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">{data?.published_courses || 0} Published</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Sales</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.total_sales_count || 0}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Completed purchases</div>
        </div>
      </div>

      {/* Quick Nav Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/teacher/earnings" className="glass-card p-6 rounded-2xl hover:border-blue-500/40 transition-all">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Financial Ledger & Payouts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">View detailed sales breakdown, 70/30 commission logs, and request payout settlements.</p>
        </Link>
        <Link href="/courses" className="glass-card p-6 rounded-2xl hover:border-blue-500/40 transition-all">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Course Catalog Explorer</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review public course listings and learner feedback ratings.</p>
        </Link>
      </div>
    </div>
  );
}
