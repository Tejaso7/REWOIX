'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Building, CreditCard, Link as LinkIcon, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    headline: '',
    company_name: '',
    domain_expertise: '',
    ctc_bracket: '',
    experience_years: '',
    linkedin_url: '',
    github_url: '',
    website: '',
    technical_skills: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    upi_id: '',
  });

  const [customCommission, setCustomCommission] = useState(70.0);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await fetchApi<any>('/auth/me');
        if (user.teacher_profile) {
          const tp = user.teacher_profile;
          setForm({
            headline: tp.headline || '',
            company_name: tp.company_name || '',
            domain_expertise: tp.domain_expertise || '',
            ctc_bracket: tp.ctc_bracket || '',
            experience_years: tp.experience_years || '',
            linkedin_url: tp.linkedin_url || '',
            github_url: tp.github_url || '',
            website: tp.website || '',
            technical_skills: tp.technical_skills || '',
            bank_name: tp.bank_name || '',
            account_number: tp.account_number || '',
            ifsc_code: tp.ifsc_code || '',
            account_holder_name: tp.account_holder_name || '',
            upi_id: tp.upi_id || '',
          });
          if (tp.custom_commission_percent) {
            setCustomCommission(tp.custom_commission_percent);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Please log in as a Teacher');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await fetchApi('/auth/teacher-onboarding', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Teacher onboarding profile & banking details saved successfully!');
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading teacher onboarding details...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold mb-3">
          <Briefcase className="w-4 h-4" /> Instructor & Professional Verification
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Teacher Professional Onboarding</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete your working professional credentials, portfolio links, and bank account for automated payouts.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Commission Share Banner */}
      <div className="glass-card p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-600">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Your Platform Revenue Share</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current assigned instructor payout cut per sale</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{customCommission}%</span>
          <p className="text-[10px] text-slate-400">(Platform cut: {100 - customCommission}%)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Professional Information */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Working Professional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline / Designation</label>
              <input
                type="text"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="e.g. Lead Cloud Architect @ Google"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Company Name</label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. Microsoft, Amazon, Stripe"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Domain Expertise</label>
              <input
                type="text"
                name="domain_expertise"
                value={form.domain_expertise}
                onChange={handleChange}
                placeholder="e.g. AI/ML, System Design, DevOps"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Experience (Years)</label>
              <input
                type="text"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                placeholder="e.g. 8+ Years"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CTC Bracket / Compensation</label>
              <select
                name="ctc_bracket"
                value={form.ctc_bracket}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">Select CTC Bracket</option>
                <option value="10-20 LPA">10 - 20 LPA</option>
                <option value="20-35 LPA">20 - 35 LPA</option>
                <option value="35-50 LPA">35 - 50 LPA</option>
                <option value="50+ LPA">50+ LPA / $150k+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Technical Skills & Bio</label>
              <textarea
                rows={3}
                name="technical_skills"
                value={form.technical_skills}
                onChange={handleChange}
                placeholder="e.g. Python, Rust, Kubernetes, Distributed Systems, PyTorch"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Portfolio & Professional Links */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <LinkIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Portfolio & Verification Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={form.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                name="github_url"
                value={form.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Website / Portfolio</label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourportfolio.dev"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Account & Payout Details */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Banking & Payout Account Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="account_holder_name"
                value={form.account_holder_name}
                onChange={handleChange}
                placeholder="Name as per Bank Account"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
                placeholder="9 to 18 Digit Account Number"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={form.ifsc_code}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">UPI ID (Optional)</label>
              <input
                type="text"
                name="upi_id"
                value={form.upi_id}
                onChange={handleChange}
                placeholder="username@okicici / username@paytm"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full gradient-button py-4 rounded-xl font-extrabold text-white text-sm shadow-xl flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          {saving ? 'Saving Onboarding Details...' : 'Save & Verify Teacher Onboarding'}
        </button>
      </form>
    </div>
  );
}
