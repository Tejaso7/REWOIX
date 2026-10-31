'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  DollarSign,
  Clock,
  Activity,
  MapPin,
  Shield,
  RefreshCw,
  Laptop,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AuditLogItem {
  id: string;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string | null;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        fetchApi<any>('/admin/dashboard'),
        fetchApi<AuditLogItem[]>('/admin/audit-logs?limit=30'),
      ]);
      setMetrics(metricsRes);
      setLogs(logsRes);
    } catch (err: any) {
      setError(err.message || 'Admin privileges required');
    } finally {
      setLoading(false);
      setRefreshingLogs(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRefresh() {
    setRefreshingLogs(true);
    try {
      const logsRes = await fetchApi<AuditLogItem[]>('/admin/audit-logs?limit=30');
      setLogs(logsRes);
    } catch (err: any) {
      console.error('Failed to refresh audit telemetry', err);
    } finally {
      setRefreshingLogs(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'AUTH') return ['USER_LOGIN', 'OTP_LOGIN', 'USER_REGISTERED'].includes(log.action);
    if (selectedFilter === 'ENROLLMENT') return log.action === 'COURSE_ENROLLED';
    if (selectedFilter === 'CERTIFICATES') return log.action === 'CERTIFICATE_ISSUED';
    if (selectedFilter === 'ADMIN') return log.action.startsWith('ADMIN_') || log.action.startsWith('PAYOUT_');
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
      case 'OTP_LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            {action.replace('_', ' ')}
          </span>
        );
      case 'USER_REGISTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Users className="w-3 h-3" />
            REGISTERED
          </span>
        );
      case 'COURSE_ENROLLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <BookOpen className="w-3 h-3" />
            ENROLLED
          </span>
        );
      case 'CERTIFICATE_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <GraduationCap className="w-3 h-3" />
            CERTIFIED
          </span>
        );
      case 'ADMIN_APPROVED_COURSE':
      case 'PAYOUT_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Shield className="w-3 h-3" />
            {action.replace('_', ' ')}
          </span>
        );
      case 'PAYOUT_REJECTED':
      case 'ADMIN_REJECTED_COURSE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            {action.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {action}
          </span>
        );
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-semibold">Connecting to live security telemetry & business operations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-1">Access Restricted</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
            <Shield className="w-3.5 h-3.5" />
            REWOIX Administration & Telemetry
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Business & Security Operations Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform metrics, course approvals, dynamic commissions, and live user activity telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshingLogs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingLogs ? 'animate-spin text-blue-500' : ''}`} />
            {refreshingLogs ? 'Syncing Logs...' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Platform Revenue (30%)</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{(metrics?.total_platform_revenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {metrics?.total_sales_count || 0} Platform Sales Settled
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Teacher Payouts (70%)</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{(metrics?.total_teacher_earnings || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Disbursed to instructors</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {metrics?.pending_course_approvals || 0}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Submitted course drafts</div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Community</span>
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {(metrics?.total_learners || 0) + (metrics?.total_teachers || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics?.total_learners} Students · {metrics?.total_teachers} Teachers
          </div>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/courses/pending"
          className="glass-card p-6 rounded-2xl hover:border-amber-500/40 border border-slate-200/80 dark:border-slate-800 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-500 transition-colors">
                Course Approval Queue
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review submitted corporate simulation drafts and pricing.
            </p>
          </div>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-xs border border-amber-500/20 shrink-0 ml-4">
            {metrics?.pending_course_approvals} Pending
          </span>
        </Link>

        <Link
          href="/admin/revenue"
          className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 border border-slate-200/80 dark:border-slate-800 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-500 transition-colors">
                Financial Ledger & Payouts
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit 70/30 commission breakdowns & approve instructor withdrawals.
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-xs border border-emerald-500/20 shrink-0 ml-4">
            {metrics?.pending_payouts_count || 0} Payouts
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="glass-card p-6 rounded-2xl hover:border-blue-500/40 border border-slate-200/80 dark:border-slate-800 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-500 transition-colors">
                User Management & Roles
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect active accounts, instructor commission rates, and profile verifications.
            </p>
          </div>
          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-full text-xs border border-blue-500/20 shrink-0 ml-4">
            Directory
          </span>
        </Link>
      </div>

      {/* Live User Activity & Security Telemetry Stream */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live User Activity & Location Telemetry Stream
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time audit log receiving actor sessions, logins, course enrollments, client IP, geographic location, and devices.
            </p>
          </div>

          {/* Filter Pill Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Activity' },
              { id: 'AUTH', label: 'Auth & Logins' },
              { id: 'ENROLLMENT', label: 'Enrollments' },
              { id: 'CERTIFICATES', label: 'Certificates' },
              { id: 'ADMIN', label: 'Admin Ops' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-6">User / Actor</th>
                <th className="py-3 px-6">Event</th>
                <th className="py-3 px-6">Details</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">IP & Device</th>
                <th className="py-3 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No activity telemetry found matching filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Actor */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/20">
                          {log.actor_name ? log.actor_name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {log.actor_name || 'System / Guest'}
                          </div>
                          {log.actor_email && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {log.actor_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Action Pill */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-6 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {log.details || '—'}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{log.location || 'Local Network (Development)'}</span>
                      </div>
                    </td>

                    {/* IP & Device */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {log.ip_address || '127.0.0.1'}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          <span>{log.user_agent || 'Web Client'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-6 text-right whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {formatTimestamp(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
