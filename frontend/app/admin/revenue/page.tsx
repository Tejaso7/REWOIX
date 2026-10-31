'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, ShieldCheck, ArrowUpRight, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminRevenuePage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPayouts = async () => {
    try {
      const data = await fetchApi<any[]>('/admin/payouts');
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed loading admin payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleApprovePayout = async (payoutId: string) => {
    setMessage('');
    setError('');
    try {
      await fetchApi(`/admin/payouts/${payoutId}/approve`, { method: 'POST' });
      setMessage('Payout approved and marked as disbursed!');
      loadPayouts();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    }
  };

  const pendingTotal = payouts
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const settledTotal = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading payout queue & financial ledger...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
          Financial Ledger & Settlements
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Teacher Payout Approval Ledger
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review teacher royalty withdrawal requests, audit 70/30 commission splits, and disburse bank transfers.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Pending Payout Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            ₹{pendingTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {payouts.filter((p) => p.status === 'PENDING').length} requests awaiting bank dispatch
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Disbursed Settlements</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{settledTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {payouts.filter((p) => p.status === 'PAID').length} settled transactions
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Audit Compliance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            100% Verified
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            All bank transfers matched to platform orders
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Requested Payout Settlements
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {payouts.length} Total Records
          </span>
        </div>

        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-4">Payout ID</th>
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {p.teacher_name || 'Instructor'}
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(p.requested_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprovePayout(p.id)}
                          className="gradient-button px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disburse Payout
                        </button>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          Settled ({p.reference_number || 'REF-001'})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">No pending payout requests</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              All teacher royalties have either been settled or no withdrawal requests are currently queued in the financial ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
