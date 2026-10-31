'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PlusCircle, Video, CheckCircle2, ArrowRight, ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Course Details
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2999');
  const [level, setLevel] = useState('ALL_LEVELS');

  // Created course state
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  // Section / Lesson state
  const [sectionTitle, setSectionTitle] = useState('Stage 1: Production Data Audit & Ingestion');
  const [lessonTitle, setLessonTitle] = useState('Task 1.1: Diagnosing Webhook Failure Schemas');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  const handleCreateBaseCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi<any>('/courses', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subtitle,
          description,
          price: parseFloat(price),
          level,
        }),
      });

      setCreatedCourseId(res.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Course creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSectionAndLesson = async () => {
    if (!createdCourseId) return;
    setLoading(true);
    setError('');

    try {
      // 1. Add section
      const secRes = await fetchApi<any>(`/courses/${createdCourseId}/sections`, {
        method: 'POST',
        body: JSON.stringify({ title: sectionTitle, order_index: 1 }),
      });

      // 2. Add lesson to section
      await fetchApi<any>(`/courses/sections/${secRes.id}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          title: lessonTitle,
          description: 'Production workplace scenario step',
          video_url: videoUrl,
          video_duration_seconds: 600,
          is_preview: true,
        }),
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed adding curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!createdCourseId) return;
    setLoading(true);

    try {
      await fetchApi(`/courses/${createdCourseId}/submit`, { method: 'POST' });
      router.push('/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
            Workplace Simulation Studio
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Author New Course / Track
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step {step} of 3 — Structure messy corporate datasets, author curriculum, and submit to Admin review.
          </p>
        </div>

        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Stepper Header */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div className={`p-3 rounded-xl border transition-all ${
          step === 1 ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-400'
        }`}>
          1. Simulation Metadata
        </div>
        <div className={`p-3 rounded-xl border transition-all ${
          step === 2 ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-400'
        }`}>
          2. Curriculum & Sandbox
        </div>
        <div className={`p-3 rounded-xl border transition-all ${
          step === 3 ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-400'
        }`}>
          3. Final Review & Submit
        </div>
      </div>

      {/* STEP 1: BASIC DETAILS */}
      {step === 1 && (
        <form onSubmit={handleCreateBaseCourse} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3">
            Track Specifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Simulation Track Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fintech Churn Prediction & High-Volume Payment Auditing"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Executive Subtitle & Problem Statement
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Investigate an 18.4% drop in European subscription renewals across Snowflake partitions"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Base Price (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min="499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Competency Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="BEGINNER">Foundational</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">Executive / All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Scenario Overview & Deliverables
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed context of the enterprise scenario, data schema constraints, and business deliverables expected from students..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
          >
            {loading ? 'Creating Draft Track...' : 'Save & Proceed to Curriculum Builder'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: CURRICULUM BUILDER */}
      {step === 2 && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" /> Stage & Task Structure
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Stage 1 Title
              </label>
              <input
                type="text"
                required
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Lesson / Sandbox Task Title
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Video Masterclass URL (MP4 / WebM)
              </label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Back
            </button>
            <button
              onClick={handleAddSectionAndLesson}
              disabled={loading}
              className="flex-1 gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
            >
              {loading ? 'Adding Curriculum Stage...' : 'Save Stage & Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUBMIT TO REVIEW */}
      {step === 3 && (
        <div className="glass-card p-8 rounded-3xl space-y-6 text-center border border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Track Configured Successfully!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your scenario brief and initial sandbox module have been saved. Submit now to send this track to the Admin review queue. Once approved, it will be published live to the REWOIX student marketplace.
            </p>
          </div>

          <button
            onClick={handleSubmitForReview}
            disabled={loading}
            className="gradient-button px-8 py-3.5 rounded-xl font-bold text-white text-xs shadow-lg hover:scale-105 transition-transform"
          >
            {loading ? 'Submitting to Review Queue...' : 'Submit Track for Admin Review'}
          </button>
        </div>
      )}
    </div>
  );
}
