'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, BookOpen, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Course } from '@/types';
import { fetchApi } from '@/lib/api';

export default function PendingCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const loadPending = async () => {
    try {
      const data = await fetchApi<Course[]>('/admin/courses/pending');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed loading pending courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (courseId: string) => {
    setStatusMsg('');
    try {
      await fetchApi(`/admin/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved: true }),
      });
      setStatusMsg('Course successfully approved and published to the student catalog!');
      loadPending();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (courseId: string) => {
    setStatusMsg('');
    try {
      await fetchApi(`/admin/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          approved: false,
          rejection_reason: rejectionReason || 'Does not meet REWOIX enterprise quality guidelines',
        }),
      });
      setStatusMsg('Course submission rejected with feedback.');
      setActiveCourseId(null);
      setRejectionReason('');
      loadPending();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading pending approval queue...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            Quality Assurance & Verification
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Pending Course Approval Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit teacher course submissions, verify real-world curriculum quality, and approve for public publishing.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {statusMsg}
        </div>
      )}

      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
                    <Clock className="w-4 h-4" /> Submitted for Review
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instructor: <span className="font-semibold text-slate-800 dark:text-slate-200">{course.teacher_name || 'Verified Lead'}</span> | Category: {course.category_name || 'Simulation'} | Base Price: ₹{course.price.toLocaleString('en-IN')}
                  </p>
                  {course.subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      "{course.subtitle}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleApprove(course.id)}
                    className="gradient-button px-5 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                  </button>
                  <button
                    onClick={() => setActiveCourseId(activeCourseId === course.id ? null : course.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject Course
                  </button>
                </div>
              </div>

              {activeCourseId === course.id && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Rejection Feedback Reason for Teacher
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Please add interactive SQL test datasets and fix video audio level in Module 2..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveCourseId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(course.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-3xl text-center space-y-4 border border-slate-200 dark:border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Course Submissions Reviewed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              There are currently no instructor courses pending quality review. All submitted workplace simulations are approved or returned with feedback.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
