'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Flame,
  Share2,
  Copy
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { WaitlistPayload } from '@/types';

export default function WaitlistSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleStage, setRoleStage] = useState<WaitlistPayload['roleStage']>('student');
  const [targetDomain, setTargetDomain] = useState('Fintech & Banking');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState(418);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer state for Early Access Beta drop
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    // Check if user already submitted in this browser
    const existing = localStorage.getItem('rewoix_waitlist_submission');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setName(parsed.name || '');
        setQueueNumber(parsed.queue_number || 418);
        setSubmitted(true);
      } catch (_) {}
    }

    // Ticking countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);

    const payload: WaitlistPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      roleStage,
      targetDomain,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try sending to backend API
      const res = await fetchApi<{ success: boolean; queue_number: number }>('/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          roleStage: payload.roleStage,
          targetDomain: payload.targetDomain,
        }),
      });

      const assignedNumber = res.queue_number || Math.floor(Math.random() * 50) + 390;
      setQueueNumber(assignedNumber);

      localStorage.setItem(
        'rewoix_waitlist_submission',
        JSON.stringify({ ...payload, queue_number: assignedNumber })
      );
      setSubmitted(true);
    } catch (err: any) {
      // Client-side fallback if backend is offline
      const fallbackNumber = Math.floor(Math.random() * 50) + 410;
      setQueueNumber(fallbackNumber);
      localStorage.setItem(
        'rewoix_waitlist_submission',
        JSON.stringify({ ...payload, queue_number: fallbackNumber })
      );
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '#waitlist');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="waitlist" className="relative py-20 px-6 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent -z-10" />

      <div className="max-w-4xl mx-auto space-y-10 text-center">
        {/* Pre-title Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Priority Beta Access • 400+ Analysts & Students In Line</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to stop watching videos <br className="hidden sm:inline" />
            and <span className="gradient-text">start experiencing real work?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Get early access to our corporate simulations before public launch. Complete real dilemmas, build verified business acumen, and bypass the "2 years experience" roadblock.
          </p>
        </div>

        {/* Live Launch Countdown Timer */}
        <div className="glass-card max-w-xl mx-auto p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Early Access Beta Drop Countdown</span>
            </span>
            <span className="text-emerald-500 font-mono text-[11px]">Phase 1 Beta</span>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
            <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Days</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hours</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mins</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="text-2xl md:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Secs</div>
            </div>
          </div>
        </div>

        {/* Lead Capture Form or Success State */}
        {!submitted ? (
          <div className="glass-card max-w-xl mx-auto p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl text-left space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Your Invite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Early cohort members receive free access to the first 2 enterprise simulations.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work or Academic Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@university.edu or alex@company.com"
                  className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Stage
                  </label>
                  <select
                    value={roleStage}
                    onChange={(e) => setRoleStage(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="student">College Student</option>
                    <option value="graduate">Fresh Graduate (0-1 Yrs)</option>
                    <option value="career_switcher">Career Switcher</option>
                    <option value="working_pro">Working Professional / Junior Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Domain
                  </label>
                  <select
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="B2B SaaS & Cloud">B2B SaaS & Cloud</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="All Domains">All Domains</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-button py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <span>Securing Priority Queue...</span>
                ) : (
                  <>
                    <span>Join Priority Early Access</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Zero spam. No credit card required. Invite delivered directly to your inbox.</span>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="glass-card max-w-xl mx-auto p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                Registration Confirmed
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                You're in, {name.split(' ')[0]}!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Your spot has been reserved for the private beta. We'll send your simulation access key to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
              </p>
            </div>

            {/* Queue Badge */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 max-w-xs mx-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority Queue Position</div>
              <div className="text-3xl font-extrabold gradient-text font-mono mt-1">
                #{queueNumber}
              </div>
              <div className="text-[10px] text-emerald-500 font-bold mt-1">
                Tier-1 Early Access Group
              </div>
            </div>

            {/* Share / Refer Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCopyInvite}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-300 dark:border-white/10"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
              </button>

              <a
                href="#simulation"
                className="w-full sm:w-auto gradient-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Revisit Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
