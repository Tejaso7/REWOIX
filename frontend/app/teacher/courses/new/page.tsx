'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, PlusCircle, Video, CheckCircle, ArrowRight } from 'lucide-react';
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
  const [sectionTitle, setSectionTitle] = useState('Section 1: Core Fundamentals');
  const [lessonTitle, setLessonTitle] = useState('Lesson 1.1: Getting Started');
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
          description: 'Lesson content overview',
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
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Create New Course</h1>
        <p className="text-xs text-slate-400">Step {step} of 3 - Build curriculum and submit for admin review</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleCreateBaseCourse} className="glass-card p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Course Basic Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Full-Stack Architecture with Next.js 15 & FastAPI"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtitle / Catchphrase</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Build production ready scalable LMS systems with PostgreSQL and Redis"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price (INR ₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Difficulty Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive course overview..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Continue to Curriculum Builder'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Curriculum & Video Content</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section Title</label>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lesson Title</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Asset URL (or Signed Storage Key)</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddSectionAndLesson}
            disabled={loading}
            className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Adding Curriculum...' : 'Save Curriculum & Proceed'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Course Draft Ready!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your course draft has been saved. Submit your course to platform admins for quality verification and publishing approval.
          </p>
          <button
            onClick={handleSubmitForReview}
            disabled={loading}
            className="gradient-button px-8 py-3.5 text-xs font-bold text-white rounded-xl shadow-lg"
          >
            {loading ? 'Submitting...' : 'Submit Course for Admin Approval'}
          </button>
        </div>
      )}
    </div>
  );
}
