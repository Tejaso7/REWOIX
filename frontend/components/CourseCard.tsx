import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const displayPrice = course.discount_price && course.discount_price > 0
    ? course.discount_price
    : course.price;

  const originalPrice = course.discount_price && course.discount_price > 0
    ? course.price
    : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-6 text-center">
            <span className="text-sm font-bold text-blue-600 dark:text-slate-300">{course.category_name || 'Course'}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm">
          {course.level}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>By {course.teacher_name || 'Instructor'}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {course.subtitle || course.description}
          </p>
        </div>

        <div>
          {/* Rating and Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{course.average_rating.toFixed(1)}</span>
              <span className="text-slate-400 dark:text-slate-500">({course.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.total_learners} students</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                ₹{displayPrice.toLocaleString()}
              </div>
              {originalPrice && (
                <div className="text-xs text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </div>
              )}
            </div>
            <Link
              href={`/courses/${course.id}`}
              className="gradient-button px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md"
            >
              View Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
