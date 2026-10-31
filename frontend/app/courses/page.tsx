'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { Course, Category } from '@/types';
import { fetchApi } from '@/lib/api';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category_id') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<Category[]>('/courses/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (selectedCategory) params.set('category_id', selectedCategory);
        if (sortBy) params.set('sort_by', sortBy);

        const data = await fetchApi<Course[]>(`/courses?${params.toString()}`);
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [q, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 text-cyan-400 uppercase tracking-wider mb-2">
            Workplace Simulations & Tracks
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Enterprise Experience Catalog
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Real business challenges, messy production schemas, and stakeholder pushback scenarios designed by verified industry leads.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shrink-0">
          {loading ? 'Scanning tracks...' : `${courses.length} Tracks Ready`}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, keywords..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Category & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-2xl text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No courses match your query</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search terms or category filters.</p>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3 text-cyan-400" />
          <span>Loading simulation courses...</span>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
