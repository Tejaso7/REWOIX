'use client';

import { useState, useEffect } from 'react';
import { BookOpen, DollarSign, Edit2, CheckCircle, Tag } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Course } from '@/types';

export default function AdminCoursePricingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await fetchApi<Course[]>('/courses?limit=100');
        setCourses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed loading courses');
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleEditClick = (c: Course) => {
    setEditingCourse(c);
    setPriceInput(c.price.toString());
    setDiscountInput(c.discount_price ? c.discount_price.toString() : '');
    setMsg('');
  };

  const handleSavePrice = async () => {
    if (!editingCourse) return;
    setSaving(true);
    setMsg('');

    try {
      const updated = await fetchApi<Course>(`/admin/courses/${editingCourse.id}/price`, {
        method: 'PUT',
        body: JSON.stringify({
          price: parseFloat(priceInput),
          discount_price: discountInput ? parseFloat(discountInput) : null,
        }),
      });

      setMsg(`Price updated for "${editingCourse.title}"!`);
      setCourses(courses.map((item) => (item.id === editingCourse.id ? { ...item, price: updated.price, discount_price: updated.discount_price } : item)));
      setTimeout(() => {
        setEditingCourse(null);
      }, 1200);
    } catch (err: any) {
      setMsg(err.message || 'Price update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading course pricing catalog...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Dynamic Course Price Controller</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View and override base prices and discount prices for any course on the marketplace.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Courses List Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Course Title & Category</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Level & Status</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Discount Price</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">{c.category_name || 'General'}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {c.teacher_name || 'Instructor'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/20 mr-2">
                      {c.level}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    ₹{c.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {c.discount_price ? `₹${c.discount_price.toLocaleString()}` : <span className="text-slate-400 font-normal">None</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-colors border border-purple-500/20 flex items-center gap-1 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Adjust Price
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Adjust Course Pricing</h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{editingCourse.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instructor: {editingCourse.teacher_name}</p>
            </div>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {msg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="e.g. 2999"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Discounted Offer Price (₹)</label>
                <input
                  type="number"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="e.g. 1999 (Leave blank for no discount)"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSavePrice}
              disabled={saving}
              className="w-full gradient-button py-3 rounded-xl font-bold text-white text-xs shadow-lg"
            >
              {saving ? 'Updating Price...' : 'Save & Publish Price Change'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
