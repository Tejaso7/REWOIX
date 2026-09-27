'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { Course } from '@/types';
import { fetchApi } from '@/lib/api';

export default function PendingCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

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
    try {
      await fetchApi(`/admin/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved: true }),
      });
      loadPending();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      await fetchApi(`/admin/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          approved: false,
          rejection_reason: rejectionReason || 'Does not meet quality guidelines',
        }),
      });
      setActiveCourseId(null);
      setRejectionReason('');
      loadPending();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading pending courses...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Pending Course Approval Queue</h1>
        <p className="text-xs text-slate-400">Review teacher course submissions and approve for public publishing</p>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                    <Clock className="w-4 h-4" /> Submitted for Review
                  </div>
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400">Instructor: {course.teacher_name} | Price: ₹{course.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(course.id)}
                    className="gradient-button px-5 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve & Publish
                  </button>
                  <button
                    onClick={() => setActiveCourseId(course.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject Course
                  </button>
                </div>
              </div>

              {activeCourseId === course.id && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">Rejection Feedback Reason</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide constructive feedback for teacher revision..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setActiveCourseId(null)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                    <button onClick={() => handleReject(course.id)} className="px-4 py-1.5 rounded-lg bg-red-600 text-xs font-bold text-white">Confirm Rejection</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-3xl text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No pending course submissions</h3>
          <p className="text-xs text-slate-400">All submitted courses have been reviewed!</p>
        </div>
      )}
    </div>
  );
}
