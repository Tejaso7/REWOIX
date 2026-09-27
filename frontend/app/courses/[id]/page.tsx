'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Users, CheckCircle, PlayCircle, ShieldCheck, Lock, Award } from 'lucide-react';
import { Course } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await fetchApi<Course>(`/courses/${courseId}`);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadCourse();
  }, [courseId]);

  const handleEnrollCheckout = async () => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      // 1. Create order
      const orderRes = await fetchApi<{
        id: string;
        gateway_order_id: string;
        amount: number;
        currency: string;
      }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId }),
      });

      // 2. Verify payment (Razorpay simulation or HMAC verification)
      const verifyRes = await fetchApi<{
        success: boolean;
        message: string;
        enrollment_id: string;
      }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderRes.id,
          gateway_order_id: orderRes.gateway_order_id,
          gateway_payment_id: `pay_mock_${Date.now()}`,
          gateway_signature: 'mock_signature_dev',
        }),
      });

      if (verifyRes.success) {
        router.push(`/learn/courses/${courseId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-16 text-center text-slate-500">Loading course...</div>;
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p className="text-slate-500">{error || 'Course not found'}</p>
      </div>
    );
  }

  const payablePrice = course.discount_price || course.price;

  return (
    <div className="pb-20">
      {/* Header Banner */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 rounded font-bold border border-blue-500/20">
                {course.level}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{course.category_name || 'Category'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              {course.subtitle || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{course.average_rating.toFixed(1)}</span>
                <span className="text-slate-400 dark:text-slate-500">({course.review_count} ratings)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{course.total_learners} students enrolled</span>
              </div>
              <div>Created by <span className="text-slate-900 dark:text-white font-bold">{course.teacher_name}</span></div>
            </div>
          </div>

          {/* Pricing Box Sticky Card */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            {course.thumbnail_url && (
              <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-200 dark:bg-slate-800">
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{payablePrice.toLocaleString()}</div>
              {course.discount_price && course.price > course.discount_price && (
                <div className="text-xs text-slate-400 line-through">₹{course.price.toLocaleString()}</div>
              )}
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}

            <button
              onClick={handleEnrollCheckout}
              disabled={purchasing}
              className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-sm flex items-center justify-center gap-2"
            >
              {purchasing ? 'Processing Order...' : 'Enroll & Buy Now'}
            </button>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Full lifetime access</div>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-purple-500" /> Verifiable Certificate of Completion</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Secure Payment & Instant Grant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Course Curriculum</h2>
            <div className="space-y-4">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div key={section.id} className="glass-card rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between">
                      <span>Section {idx + 1}: {section.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{section.lessons.length} lessons</span>
                    </h3>
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between py-2 text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            {lesson.is_preview ? (
                              <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                            <span>{lesson.title}</span>
                          </div>
                          {lesson.is_preview && (
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              Free Preview
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No curriculum added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
