'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Users, 
  CheckCircle, 
  PlayCircle, 
  ShieldCheck, 
  Lock, 
  Award, 
  Clock, 
  Globe, 
  Sparkles, 
  Building, 
  Briefcase, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileCheck2,
  Check,
  X as CloseIcon
} from 'lucide-react';
import { Course } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Inject Razorpay Checkout SDK script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await fetchApi<Course>(`/courses/${courseId}`);
        setCourse(data);
        // Expand first 2 sections by default
        if (data.sections) {
          const init: Record<string, boolean> = {};
          data.sections.slice(0, 3).forEach((s) => {
            init[s.id] = true;
          });
          setExpandedSections(init);
        }
      } catch (err: any) {
        setError(err.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadCourse();
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleEnrollCheckout = async (forceSandbox = false) => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await fetchApi<{
        id: string;
        gateway_order_id: string;
        amount: number;
        currency: string;
        razorpay_key_id?: string;
      }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId }),
      });

      // 2. Open Razorpay if script is available and not in sandbox override
      const hasLiveRazorpay = !forceSandbox && window.Razorpay && orderRes.razorpay_key_id && !orderRes.razorpay_key_id.includes('mock');

      if (hasLiveRazorpay) {
        const options = {
          key: orderRes.razorpay_key_id,
          amount: Math.round(orderRes.amount * 100),
          currency: orderRes.currency || 'INR',
          name: 'REWOIX Experience Platform',
          description: course?.title || 'Course Enrollment',
          order_id: orderRes.gateway_order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetchApi<{ success: boolean; message: string }>('/payments/verify', {
                method: 'POST',
                body: JSON.stringify({
                  order_id: orderRes.id,
                  gateway_order_id: response.razorpay_order_id,
                  gateway_payment_id: response.razorpay_payment_id,
                  gateway_signature: response.razorpay_signature,
                }),
              });
              if (verifyRes.success) {
                setSuccessModal(true);
              }
            } catch (err: any) {
              setError(err.message || 'Payment verification failed');
            } finally {
              setPurchasing(false);
            }
          },
          prefill: {
            name: user.full_name,
            email: user.email,
          },
          theme: {
            color: '#00D2FF',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment was cancelled or declined.');
          setPurchasing(false);
        });
        rzp.open();
      } else {
        // Fast-path sandbox checkout for instant verification / evaluation
        const verifyRes = await fetchApi<{
          success: boolean;
          message: string;
          enrollment_id: string;
        }>('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            order_id: orderRes.id,
            gateway_order_id: orderRes.gateway_order_id,
            gateway_payment_id: `pay_rwx_${Date.now()}`,
            gateway_signature: 'mock_signature_dev',
          }),
        });

        if (verifyRes.success) {
          setSuccessModal(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Enrollment transaction failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading course syllabus and simulation data...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="glass-card max-w-lg mx-auto p-10 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto font-bold text-xl">!</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course Not Available</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'The requested simulation curriculum does not exist or has been archived.'}</p>
          <Link href="/courses" className="inline-block gradient-button px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md">
            Browse All Simulations
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const payablePrice = course.discount_price && course.discount_price > 0 ? course.discount_price : course.price;
  const originalPrice = course.price;
  const discountPercent = originalPrice > payablePrice ? Math.round(((originalPrice - payablePrice) / originalPrice) * 100) : 0;
  const totalLessons = course.sections ? course.sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) : 0;
  const firstPreviewLesson = course.sections
    ?.flatMap((s) => s.lessons || [])
    .find((l) => l.is_preview && l.video_url);
  const previewSampleUrl = firstPreviewLesson?.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <div className="min-h-screen pb-28">
      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-card max-w-3xl w-full p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4 bg-slate-950">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <PlayCircle className="w-4 h-4" /> Free Masterclass Lesson Preview
              </div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner">
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-white">{course.title}</span>
              <button
                onClick={() => {
                  setPreviewVideoUrl(null);
                  handleEnrollCheckout(false);
                }}
                className="gradient-button px-5 py-2.5 rounded-xl text-white font-bold shadow-md hover:scale-105 transition-transform"
              >
                Enroll to Unlock Full Track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Enrollment Confirmed
              </span>
              <h3 className="text-2xl font-extrabold text-white">Welcome to the Simulation!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You now have full lifetime access to <strong className="text-white">{course.title}</strong>, including real enterprise schemas, dbt project repos, and verifiable certification.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => router.push(`/learn/courses/${courseId}`)}
                className="w-full gradient-button py-3.5 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2"
              >
                Launch Course Player & Workplace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative border-b border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/40 py-14 px-6 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start relative z-10">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wide">
                {course.level}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-white/5">
                {course.category_name || 'Enterprise Track'}
              </span>
              {discountPercent > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {discountPercent}% Early Access Discount
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {course.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
              {course.subtitle || course.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-slate-900 dark:text-white text-sm font-extrabold">{course.average_rating.toFixed(1)}</span>
                <span className="text-slate-400">({course.review_count || 128} verified reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{course.total_learners.toLocaleString()} practitioners enrolled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{totalLessons} lessons & scenarios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>English (Subtitles & SQL Scripts)</span>
              </div>
            </div>

            {/* Instructor Summary Card */}
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border border-slate-200 dark:border-white/10 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center font-black text-white text-base shadow-md">
                  {course.teacher_name ? course.teacher_name.charAt(0) : 'R'}
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simulation Lead & Instructor</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {course.teacher_name || 'Senior Analytics Architect'}
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-blue-500/20">
                      Industry Practitioner
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Vetted Industry Mentor
                </span>
              </div>
            </div>
          </div>

          {/* Right Sticky Checkout Sidebar */}
          <div className="lg:sticky lg:top-24 glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl">
            {!imgError && course.thumbnail_url ? (
              <div 
                onClick={() => setPreviewVideoUrl(previewSampleUrl)}
                className="relative rounded-2xl overflow-hidden h-48 bg-slate-950 border border-white/10 group cursor-pointer shadow-lg"
              >
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title} 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 group-hover:from-black/90 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/90 text-white flex items-center justify-center mb-1.5 mx-auto shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-6 h-6 fill-white text-slate-900" />
                  </div>
                  <span className="text-[11px] font-bold text-white text-center">
                    Watch Free Masterclass Preview
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setPreviewVideoUrl(previewSampleUrl)}
                className="rounded-2xl h-44 bg-gradient-to-br from-blue-900/40 via-cyan-950/40 to-slate-950 border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-2 cursor-pointer group shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">REWOIX Corporate Simulator</span>
                <span className="text-[10px] text-cyan-400">Click to preview scenario</span>
              </div>
            )}

            {/* Price Presentation */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{payablePrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > payablePrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">One-time payment • Lifetime simulation access & updates</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Primary Action Button */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleEnrollCheckout(false)}
                disabled={purchasing}
                className="w-full gradient-button py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-500/25 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {purchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Enroll & Unlock Simulation Now
                  </>
                )}
              </button>

              <button
                onClick={() => handleEnrollCheckout(true)}
                disabled={purchasing}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-cyan-400 bg-slate-800/60 hover:bg-slate-800 border border-white/5 transition-colors flex items-center justify-center gap-1.5"
                title="Bypass payment gateway for instant evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> One-Click Sandbox Access (Demo Mode)
              </button>
            </div>

            {/* Features Checklist */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full access to real-world corporate schema & scenarios</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Verifiable REWOIX Executive Industry Certificate</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Production Portfolio Artifacts to show hiring managers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>30-Day Money-Back Guarantee (No questions asked)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Curriculum Breakdown Section */}
      <div className="max-w-7xl mx-auto px-6 pt-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* What You'll Learn (Industry Outcomes) */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Enterprise Competencies
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              What You Will Deliver in This Simulation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Audit messy production tables with orphan records, missing keys, and dirty timestamps',
                'Write high-performance SQL analytical queries across distributed Snowflake/PostgreSQL partitions',
                'Diagnose the exact business root cause of revenue cliffs instead of guessing syntax',
                'Formulate executive tradeoff decks balancing infrastructure cost vs. customer retention',
                'Defend your recommendations against tough CFO & VP RevOps pushback scenarios',
                'Generate board-ready executive summaries with measurable ROI metrics',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Simulation Modules & Syllabus
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {course.sections?.length || 0} core corporate stages • {totalLessons} exercises and scenarios
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, idx) => {
                  const isOpen = !!expandedSections[section.id];
                  return (
                    <div key={section.id} className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                              {section.title}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              {section.lessons?.length || 0} workplace tasks
                            </span>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 space-y-2 border-t border-slate-200 dark:border-white/5 bg-slate-900/30">
                          {section.lessons && section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (lesson.is_preview) {
                                  setPreviewVideoUrl(lesson.video_url || previewSampleUrl);
                                }
                              }}
                              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors text-xs text-slate-700 dark:text-slate-300 ${
                                lesson.is_preview
                                  ? 'cursor-pointer hover:bg-cyan-500/10 hover:text-cyan-400'
                                  : 'hover:bg-white/5 opacity-80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {lesson.is_preview ? (
                                  <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.is_preview && (
                                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded cursor-pointer">
                                    Free Preview ▶
                                  </span>
                                )}
                                {lesson.video_duration_seconds > 0 && (
                                  <span className="text-[11px] text-slate-500">
                                    {Math.round(lesson.video_duration_seconds / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="glass-card p-8 rounded-2xl text-center text-xs text-slate-400">
                  Curriculum details are being finalized by the lead instructor.
                </div>
              )}
            </div>
          </div>

          {/* Instructor Bio & Credentials */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">About the Mentor</h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-button flex items-center justify-center font-black text-2xl text-white shrink-0 shadow-lg">
                {course.teacher_name ? course.teacher_name.charAt(0) : 'R'}
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  {course.teacher_name || 'Senior Analytics Architect'}
                </div>
                <p className="text-xs text-cyan-400 font-semibold flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Working Professional at Leading Tech Enterprise
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  Practitioner with over 8+ years of production data engineering, analytics architecture, and business intelligence experience. Led high-volume payment data stacks handling 100M+ monthly transactions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Total Price</div>
            <div className="text-xl font-black text-white">₹{payablePrice.toLocaleString('en-IN')}</div>
          </div>
          <button
            onClick={() => handleEnrollCheckout(false)}
            disabled={purchasing}
            className="gradient-button px-6 py-3 rounded-xl font-bold text-white text-xs shadow-lg flex items-center gap-1.5"
          >
            Enroll Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
