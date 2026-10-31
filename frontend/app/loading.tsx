import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Loading REWOIX Workspace...
        </p>
        <p className="text-[11px] text-slate-400">
          Synchronizing analytics partitions and credentials
        </p>
      </div>
    </div>
  );
}
