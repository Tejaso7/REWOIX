'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function TeacherEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');
  const [payoutError, setPayoutError] = useState('');

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetchApi<any>('/teacher/earnings');
        setData(res);
      } catch (err) {
        console.error('Failed loading earnings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMessage('');
    setPayoutError('');

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayoutError('Please enter a valid payout amount.');
      return;
    }

    try {
      await fetchApi('/teacher/payouts/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          notes: 'Standard settlement request to registered bank account',
        }),
      });
      setPayoutMessage('Payout request successfully submitted to platform admin for settlement!');
      setPayoutAmount('');
      const updated = await fetchApi<any>('/teacher/earnings');
      setData(updated);
    } catch (err: any) {
      setPayoutError(err.message || 'Payout request failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading teacher financial ledger...</div>;
  }

  const transactions = Array.isArray(data?.recent_transactions) 
    ? data.recent_transactions 
    : (Array.isArray(data?.transactions) ? data.transactions : []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
            Royalty & Payout Ledger
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Teacher Financial Ledger & Earnings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent breakdown of your 70% revenue share per student enrollment and bank disbursements.
          </p>
        </div>

        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teacher Console
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Total Gross Royalty (70% Share)
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{parseFloat(data?.total_gross_earnings || '0').toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {data?.total_sales_count || 0} Paid Enrollments
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Available Payout Balance
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{parseFloat(data?.available_payout_balance || '0').toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Eligible for immediate withdrawal to registered bank
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Disbursed Bank Settlements
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            ₹{parseFloat(data?.paid_payouts || '0').toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Settled to your verified bank account
          </div>
        </div>
      </div>

      {/* Request Payout Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 dark:border-white/10">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Request Payout Settlement</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Withdraw your earned balance directly to your bank account or UPI ID configured in your onboarding profile.
          </p>
        </div>

        {payoutMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {payoutMessage}
          </div>
        )}

        {payoutError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {payoutError}
          </div>
        )}

        <form onSubmit={handleRequestPayout} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="number"
            min="100"
            step="10"
            required
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Amount in INR (e.g. 5000)"
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="gradient-button px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md shrink-0 hover:scale-[1.02] transition-transform"
          >
            Request Payout
          </button>
        </form>
      </div>

      {/* Itemized Transactions Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Recent Revenue Transactions
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {transactions.length} Transactions
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Gross Amount</th>
                  <th className="p-4">Your Cut (70%)</th>
                  <th className="p-4">Platform Cut (30%)</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {tx.course_title || 'Workplace Simulation'}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                      ₹{parseFloat(tx.gross_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{parseFloat(tx.teacher_amount ?? tx.teacher_share_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      ₹{parseFloat(tx.platform_commission_amount ?? tx.platform_share_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">No transaction history yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Once learners purchase your simulation tracks, individual royalty cuts and automated 70/30 split breakdowns will appear in this ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
