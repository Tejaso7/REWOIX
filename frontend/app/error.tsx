'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Exception:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-16">
      <div className="glass-card max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/20 rounded-full blur-2xl -z-10" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
            Runtime Exception
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Unexpected Workspace Error
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {error.message || 'An unexpected runtime error occurred while processing this workspace state.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <button
            onClick={() => reset()}
            className="gradient-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry Workspace Action
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
