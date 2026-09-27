'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, PlayCircle, Award, CheckCircle } from 'lucide-react';
import { Enrollment } from '@/types';
import { fetchApi } from '@/lib/api';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEnrolled() {
      try {
        const data = await fetchApi<Enrollment[]>('/learning/my-courses');
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Please log in to view your courses');
      } finally {
        setLoading(false);
      }
    }
    loadEnrolled();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">My Learning Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track your enrolled course progress and certificates</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card h-48 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enr) => (
            <div key={enr.id} className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span>Instructor: {enr.teacher_name}</span>
                  {enr.is_completed ? (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded font-bold border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded font-bold border border-blue-500/20">
                      In Progress
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{enr.course_title}</h3>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Course Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{enr.progress_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${enr.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <Link
                  href={`/learn/courses/${enr.course_id}`}
                  className="flex-1 gradient-button py-2.5 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <PlayCircle className="w-4 h-4" /> Continue Learning
                </Link>
                {enr.is_completed && (
                  <Link
                    href={`/certificates/verify/EDU-DEMO-CERT`}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4" /> Certificate
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No enrolled courses yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Explore the course catalog and start your learning journey!</p>
          <Link
            href="/courses"
            className="inline-block gradient-button px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
