'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Award, CheckCircle, ShieldCheck, Calendar, BookOpen, User } from 'lucide-react';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certId = params.certificateId as string;

  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await fetch(`/api/v1/certificates/verify/${certId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Invalid certificate');
        setCertData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (certId) loadCert();
  }, [certId]);

  if (loading) return <div className="p-12 text-center text-slate-400">Verifying certificate cryptographic record...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="glass-card p-8 md:p-12 rounded-3xl border border-purple-500/30 space-y-8 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Official Verified Certificate</span>
              <h1 className="text-xl font-bold text-white">EduFlow Certificate of Completion</h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <CheckCircle className="w-4 h-4" /> Authenticated Record
          </div>
        </div>

        {error ? (
          <div className="text-center py-8 text-red-400 space-y-2">
            <h3 className="text-lg font-bold">Verification Failed</h3>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest">This certifies that</p>
              <h2 className="text-3xl font-extrabold text-white gradient-text">{certData?.learner_name}</h2>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <p className="text-xs text-slate-400">has successfully completed the comprehensive course curriculum for</p>
              <h3 className="text-2xl font-bold text-white">{certData?.course_title}</h3>
            </div>

            <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400 max-w-2xl mx-auto">
              <div>
                <span className="block font-semibold text-slate-300">Instructor</span>
                <span className="text-white font-medium">{certData?.teacher_name}</span>
              </div>
              <div>
                <span className="block font-semibold text-slate-300">Issue Date</span>
                <span className="text-white font-medium">{new Date(certData?.issue_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block font-semibold text-slate-300">Certificate Number</span>
                <span className="text-purple-300 font-mono font-bold">{certData?.certificate_number}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
