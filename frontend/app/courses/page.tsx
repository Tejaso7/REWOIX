'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, BookOpen, Loader2, Filter, Layers, Sparkles, RefreshCw } from 'lucide-react';
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

  const handleResetFilters = () => {
    setQ('');
    setSelectedCategory('');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
            Workplace Simulations & Tracks
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Enterprise Experience Catalog
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Real business challenges, messy production schemas, and stakeholder pushback scenarios designed by verified industry leads.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 shrink-0 self-start md:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{loading ? 'Scanning tracks...' : `${courses.length} Active Tracks Ready`}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search scenarios, SQL, tools (e.g. Fintech, dbt)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Category & Sorting Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 pr-8 transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 pr-8 transition-colors cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Scenarios</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Category Badges */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'gradient-button text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
            }`}
          >
            All Tracks
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'gradient-button text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 animate-pulse h-96 flex flex-col justify-between p-4"
            >
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="space-y-2 py-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-3xl text-center space-y-4 border border-slate-200/80 dark:border-white/10">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No simulation tracks match your filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different category from the filter bar above.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 gradient-button px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3 text-cyan-400" />
          <span>Loading simulation courses...</span>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
