'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, UserCheck, Target, Phone, CheckCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function LearnerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    user_type: 'STUDENT',
    institution_or_company: '',
    field_of_study_or_role: '',
    primary_learning_goal: '',
    interests: '',
    phone_number: '',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await fetchApi<any>('/auth/me');
        if (user.learner_profile) {
          const lp = user.learner_profile;
          setForm({
            user_type: lp.user_type || 'STUDENT',
            institution_or_company: lp.institution_or_company || '',
            field_of_study_or_role: lp.field_of_study_or_role || '',
            primary_learning_goal: lp.primary_learning_goal || '',
            interests: lp.interests || '',
            phone_number: user.phone_number || '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Please log in');
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
      await fetchApi('/auth/learner-onboarding', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Learner onboarding profile saved successfully!');
      setTimeout(() => {
        router.push('/learn/my-courses');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading student onboarding profile...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
          <GraduationCap className="w-4 h-4" /> Learner Personalization
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Student & Learner Onboarding</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Tell us about your background, career goal, and tech interests so we can tailor your learning path.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Background & Archetype
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Status / Role</label>
              <select
                name="user_type"
                value={form.user_type}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="STUDENT">College Student (Undergrad/Grad)</option>
                <option value="FRESHER">Recent Graduate / Fresher</option>
                <option value="WORKING_PROFESSIONAL">Working Professional</option>
                <option value="JOB_SEEKER">Job Seeker / Career Switcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">College / University / Company</label>
              <input
                type="text"
                name="institution_or_company"
                value={form.institution_or_company}
                onChange={handleChange}
                placeholder="e.g. IIT Delhi, BITS Pilani, TCS, Infosys"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Field of Study / Current Designation</label>
              <input
                type="text"
                name="field_of_study_or_role"
                value={form.field_of_study_or_role}
                onChange={handleChange}
                placeholder="e.g. Computer Science Engineering / Junior Developer"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (For Certificate Verification)</label>
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Learning Goal</label>
              <select
                name="primary_learning_goal"
                value={form.primary_learning_goal}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">Select Primary Goal</option>
                <option value="Land FAANG / Top Tech Job">Land FAANG / Top Product Tech Job</option>
                <option value="Master Full-Stack Next.js & FastAPI">Master Full-Stack Next.js & FastAPI</option>
                <option value="Build Generative AI & LLM Apps">Build Generative AI & LLM Apps</option>
                <option value="Prepare for AWS Cloud Certification">Prepare for AWS Cloud Certification</option>
                <option value="Upskill for Higher Salary Promotion">Upskill for Higher Salary Promotion</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tech Stack Interests</label>
              <textarea
                rows={3}
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="e.g. Next.js, FastAPI, AI Agents, PyTorch, Kubernetes, Rust"
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
          <Target className="w-5 h-5" />
          {saving ? 'Saving Learner Details...' : 'Complete Learner Profile & Start Learning'}
        </button>
      </form>
    </div>
  );
}
