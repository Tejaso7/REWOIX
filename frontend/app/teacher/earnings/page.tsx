'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function TeacherEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');

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
    try {
      await fetchApi('/teacher/payouts/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(payoutAmount),
          notes: 'Standard settlement request',
        }),
      });
      setPayoutMessage('Payout request submitted to platform admin!');
      setPayoutAmount('');
    } catch (err: any) {
      setPayoutMessage(err.message || 'Payout request failed');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading financial ledger...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Teacher Financial Ledger & Earnings</h1>
        <p className="text-xs text-slate-400">Transparent 70/30 platform revenue split records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Gross Earnings (70% Share)</div>
          <div className="text-3xl font-extrabold text-white">₹{data?.total_gross_earnings || '0.00'}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">{data?.total_sales_count || 0} Paid Enrollments</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Available Payout Balance</div>
          <div className="text-3xl font-extrabold text-emerald-400">₹{data?.available_payout_balance || '0.00'}</div>
          <div className="text-[11px] text-slate-400">Eligible for instant withdrawal</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Paid Out Settlements</div>
          <div className="text-3xl font-extrabold text-purple-400">₹{data?.paid_payouts || '0.00'}</div>
          <div className="text-[11px] text-slate-400">Settled to bank account</div>
        </div>
      </div>

      {/* Request Payout Box */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
        <h3 className="font-bold text-white text-lg">Request Payout Settlement</h3>
        {payoutMessage && <div className="p-3 rounded-xl bg-blue-500/10 text-blue-300 text-xs">{payoutMessage}</div>}
        <form onSubmit={handleRequestPayout} className="flex gap-4 max-w-md">
          <input
            type="number"
            required
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Amount in INR (e.g. 2000)"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
          <button type="submit" className="gradient-button px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md">
            Request Payout
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-lg">Recent Revenue Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Course</th>
                <th className="p-4">Gross Sale</th>
                <th className="p-4">Teacher Share (70%)</th>
                <th className="p-4">Platform Fee (30%)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recent_transactions?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-mono text-[11px] text-slate-400">{tx.id.slice(0, 8)}...</td>
                  <td className="p-4 font-semibold text-white">{tx.course_title}</td>
                  <td className="p-4 font-bold text-white">₹{tx.gross_amount}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{tx.teacher_amount}</td>
                  <td className="p-4 text-slate-400">₹{tx.platform_commission_amount}</td>
                  <td className="p-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">{tx.status}</span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
