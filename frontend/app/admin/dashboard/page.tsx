'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetchApi<any>('/admin/dashboard');
        setMetrics(res);
      } catch (err: any) {
        setError(err.message || 'Admin privileges required');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading admin business metrics...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Business Operations Console</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Platform overview, approvals, dynamic commission control, and financial ledger</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Platform Revenue (30%)</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{(metrics?.total_platform_revenue || 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{metrics?.total_sales_count || 0} Platform Sales</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Teacher Payouts (70%)</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{(metrics?.total_teacher_earnings || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Disbursed to instructors</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{metrics?.pending_course_approvals || 0}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Submitted course drafts</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Users</span>
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {(metrics?.total_learners || 0) + (metrics?.total_teachers || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{metrics?.total_learners} Students / {metrics?.total_teachers} Teachers</div>
        </div>
      </div>

      {/* Admin Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/courses/pending" className="glass-card p-6 rounded-2xl hover:border-amber-500/40 transition-all flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Course Approval Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review submitted course curriculum, price, and approve/reject with feedback notes.</p>
          </div>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-xs border border-amber-500/20">
            {metrics?.pending_course_approvals} Pending
          </span>
        </Link>

        <Link href="/admin/revenue" className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 transition-all flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Financial Ledger & Payout Approval</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Audit system-wide order payments, 70/30 commission breakdowns, and approve teacher payouts.</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-xs border border-emerald-500/20">
            Audit Ledger
          </span>
        </Link>
      </div>
    </div>
  );
}
