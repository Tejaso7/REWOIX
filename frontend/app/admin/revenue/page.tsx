'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminRevenuePage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    try {
      const data = await fetchApi<any[]>('/admin/payouts');
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed loading admin payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await fetchApi(`/admin/payouts/${payoutId}/approve`, { method: 'POST' });
      loadPayouts();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading payout queue...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Teacher Payout Approval Ledger</h1>
        <p className="text-xs text-slate-400">Review teacher withdrawal requests and disburse payouts</p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-lg">Requested Payout Settlements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Payout ID</th>
                <th className="p-4">Teacher Name</th>
                <th className="p-4">Requested Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Requested Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-mono text-[11px] text-slate-400">{p.id.slice(0, 8)}...</td>
                  <td className="p-4 font-semibold text-white">{p.teacher_name || 'Instructor'}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{p.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(p.requested_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => handleApprovePayout(p.id)}
                        className="gradient-button px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Disburse Payout
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Settled ({p.reference_number || 'REF-001'})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
