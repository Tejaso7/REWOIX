'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Users, Sparkles, Building, PlayCircle, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [imgError, setImgError] = useState(false);

  const displayPrice =
    course.discount_price && course.discount_price > 0
      ? course.discount_price
      : course.price;

  const originalPrice =
    course.discount_price && course.discount_price > 0 ? course.price : null;

  const discountPercent =
    originalPrice && displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  // Level Badge Theme Styling
  const getLevelStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'bg-blue-500/15 text-blue-600 dark:text-cyan-400 border-blue-500/30';
      case 'ADVANCED':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col h-full border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden shrink-0">
        {!imgError && course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950/60 to-purple-950/50 flex flex-col items-center justify-center p-6 text-center space-y-2 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#00D2FF_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 relative z-10 line-clamp-1">
              {course.category_name || 'Enterprise Simulation'}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border shadow-sm ${getLevelStyle(
              course.level
            )}`}
          >
            {course.level}
          </span>

          {course.is_featured && (
            <span className="backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" /> Featured
            </span>
          )}
        </div>

        {/* Category Pill Bottom Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          <span>{course.category_name || 'Analytics Track'}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Mentor Tag */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
              {course.teacher_name || 'Industry Lead'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Social Proof & Metrics */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-t border-slate-200/80 dark:border-white/10 pt-3">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-slate-900 dark:text-white font-extrabold">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-slate-400 font-normal">
                ({course.review_count || 120})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>{course.total_learners.toLocaleString()} learners</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {discountPercent > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <Link
              href={`/courses/${course.id}`}
              className="gradient-button px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md hover:scale-[1.03] transition-all flex items-center gap-1 shrink-0"
            >
              <span>Explore</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
