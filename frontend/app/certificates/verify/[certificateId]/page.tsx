'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, CheckCircle, ShieldCheck, Calendar, BookOpen, User, Download, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certId = params.certificateId as string;

  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCert() {
      try {
        const data = await fetchApi<any>(`/certificates/verify/${certId}`);
        setCertData(data);
      } catch (err: any) {
        if (certId === 'RWX-CERT-DEMO') {
          // Demo certificate presentation
          setCertData({
            learner_name: 'Elena Rostova',
            course_title: 'Fintech Payment Rail Churn Diagnostics & SEPA Retention Modeling',
            teacher_name: 'Lead BI Architect @ NexusPay Global',
            issue_date: new Date().toISOString(),
            certificate_number: 'RWX-CERT-DEMO',
          });
        } else {
          setError(err.message || 'Invalid certificate or certificate not found');
        }
      } finally {
        setLoading(false);
      }
    }
    if (certId) loadCert();
  }, [certId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-400">Verifying cryptographic certificate hash on REWOIX registry...</p>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Certificate Verification Failed</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {error || `The credential identifier "${certId}" is invalid or could not be found in the REWOIX registry.`}
          </p>
        </div>
        <div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 gradient-button px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md"
          >
            Explore Corporate Tracks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
      <Link href="/learn/my-courses" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Learning
      </Link>

      <div className="glass-card p-8 md:p-14 rounded-3xl border border-blue-500/30 space-y-8 relative overflow-hidden bg-gradient-to-b from-[#0B0F17] via-[#0D121F] to-blue-950/20 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Official Verified Credential</span>
              <h1 className="text-xl font-extrabold text-white">REWOIX Corporate Experience Certificate</h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
            <CheckCircle className="w-4 h-4" /> Cryptographically Validated
          </div>
        </div>

        {/* Certificate Body */}
        <div className="space-y-8 text-center relative z-10 py-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">This certifies that</p>
            <h2 className="text-3xl md:text-4xl font-black text-white gradient-text">{certData?.learner_name || 'Verified Practitioner'}</h2>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <p className="text-xs text-slate-400">has successfully defended corporate deliverables and completed the real-world track</p>
            <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug">{certData?.course_title}</h3>
          </div>

          {/* Details Grid */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400 max-w-2xl mx-auto text-center sm:text-left">
            <div>
              <span className="block font-semibold text-slate-400">Industry Mentor</span>
              <span className="text-white font-bold">{certData?.teacher_name || 'Lead BI Architect'}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Issued On</span>
              <span className="text-white font-bold">{new Date(certData?.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Credential ID</span>
              <span className="text-cyan-400 font-mono font-bold">{certData?.certificate_number}</span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Permanent URL record on the REWOIX Verification Network</span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Printable PDF
          </button>
        </div>
      </div>
    </div>
  );
}
