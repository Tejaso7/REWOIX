'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Award, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  Terminal, 
  Database, 
  Download, 
  Sparkles, 
  Check, 
  Code2, 
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function InteractivePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [playerData, setPlayerData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'simulation' | 'notes'>('video');

  // Simulation execution state
  const [sqlQuery, setSqlQuery] = useState<string>(
    `-- Executive Diagnostic Query\nSELECT \n  date_trunc('month', payment_attempt_at) AS cohort,\n  gateway_provider,\n  COUNT(*) AS total_failed_dunnings,\n  ROUND(SUM(amount_due_usd), 2) AS arr_churned\nFROM dwh_prod.finance.failed_billing_partitions\nWHERE failure_code = 'RETRY_TIMEOUT_SEPA'\nGROUP BY 1, 2\nORDER BY cohort DESC;`
  );
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [simCompleted, setSimCompleted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadPlayerData() {
      try {
        const data = await fetchApi<any>(`/learning/courses/${courseId}/player`);
        setPlayerData(data);
        if (data.sections && data.sections[0]?.lessons[0]) {
          setActiveLesson(data.sections[0].lessons[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course player');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadPlayerData();
  }, [courseId]);

  const handleTimeUpdate = async () => {
    if (!videoRef.current || !activeLesson) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration) || 1;

    if (currentTime % 15 === 0 || currentTime >= duration - 2) {
      const isCompleted = currentTime >= duration * 0.9;
      try {
        await fetchApi(`/learning/lessons/${activeLesson.id}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            progress_seconds: currentTime,
            completed: isCompleted,
          }),
        });
      } catch (_) {}
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      await fetchApi(`/learning/lessons/${activeLesson.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          progress_seconds: activeLesson.video_duration_seconds || 100,
          completed: true,
        }),
      });
      const updated = await fetchApi<any>(`/learning/courses/${courseId}/player`);
      setPlayerData(updated);
    } catch (err: any) {
      alert('Failed updating lesson progress');
    }
  };

  const handleRunSimulation = () => {
    setQueryRunning(true);
    setQueryOutput(null);
    setTimeout(() => {
      setQueryOutput([
        { cohort: '2026-10-01', gateway_provider: 'Adyen_EU', total_failed_dunnings: 1420, arr_churned: '$1,840,250' },
        { cohort: '2026-09-01', gateway_provider: 'Adyen_EU', total_failed_dunnings: 210, arr_churned: '$180,400' },
        { cohort: '2026-08-01', gateway_provider: 'Stripe_US', total_failed_dunnings: 45, arr_churned: '$52,100' },
      ]);
      setQueryRunning(false);
      setSimCompleted(true);
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4 text-white">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading interactive workplace player & production schemas...</p>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="glass-card max-w-md p-8 rounded-3xl border border-red-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto font-bold text-xl">!</div>
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-xs text-slate-400">{error || 'You need an active enrollment to access this simulation workspace.'}</p>
          <Link href={`/courses/${courseId}`} className="inline-block gradient-button px-6 py-2.5 rounded-xl text-xs font-bold shadow-md">
            Go to Course Enrollment
          </Link>
        </div>
      </div>
    );
  }

  const certificateId = `RWX-CERT-${courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080B11] text-slate-100">
      {/* Main Simulation / Media Panel */}
      <div className="flex-1 flex flex-col min-h-0 md:h-screen overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="px-6 py-3.5 border-b border-white/10 bg-[#0B0F17]/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/learn/my-courses" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Back to Portal">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Simulation Workplace
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">REWOIX Corporate Lab</span>
              </div>
              <h1 className="text-base font-extrabold text-white line-clamp-1">{playerData.course_title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress Badge */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-white">{playerData.progress_percentage.toFixed(0)}% Completed</span>
              <div className="w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${playerData.progress_percentage}%` }} />
              </div>
            </div>

            {/* Certificate Button */}
            <Link
              href={`/certificates/verify/${certificateId}`}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all ${
                playerData.is_completed || playerData.progress_percentage >= 80
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{playerData.is_completed ? 'View Certificate' : 'Certificate'}</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Workspace Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlayCircle className="w-4 h-4" /> Video Masterclass
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === 'simulation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="w-4 h-4 text-cyan-400" /> Interactive SQL Sandbox
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" /> Schemas & Briefs
            </button>
          </div>

          {/* TAB 1: VIDEO MASTERCLASS */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-black aspect-video relative shadow-2xl">
                {activeLesson?.video_url ? (
                  <video
                    ref={videoRef}
                    src={activeLesson.video_url}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-br from-slate-900 to-[#0B0F17]">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Terminal className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white">{activeLesson?.title || 'Interactive Workplace Exercise'}</h3>
                      <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                        {activeLesson?.content_text || activeLesson?.description || 'Review the briefing specifications below, switch to the SQL Sandbox tab, and execute the analytical query.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('simulation')}
                      className="gradient-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg"
                    >
                      Open Live SQL Sandbox <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Lesson Control Footer */}
              <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">{activeLesson?.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeLesson?.description || 'Corporate scenario step'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMarkComplete}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Lesson as Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SQL SANDBOX */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4 bg-[#0D121F]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Database className="w-4 h-4" />
                    <span>Target: snowflake://revops_analytics_prod/public</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded">Read-Only Replica</span>
                </div>

                {/* SQL Editor Area */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Production Analytical Query</label>
                  <textarea
                    rows={8}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full font-mono text-xs bg-slate-950 border border-white/10 rounded-xl p-4 text-cyan-300 focus:outline-none focus:border-cyan-400 selection:bg-cyan-500/30 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={queryRunning}
                    className="gradient-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {queryRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Executing against partition...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5" /> Run Query (Ctrl+Enter)
                      </>
                    )}
                  </button>

                  {simCompleted && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <Check className="w-4 h-4" /> Diagnostic Root Cause Isolated!
                    </span>
                  )}
                </div>
              </div>

              {/* Query Output Table */}
              {queryOutput && (
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden space-y-3 p-5 bg-[#0D121F]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Execution Result (3 rows returned in 240ms)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">STATUS: 200 OK</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="p-3">COHORT</th>
                          <th className="p-3">GATEWAY_PROVIDER</th>
                          <th className="p-3">FAILED_DUNNINGS</th>
                          <th className="p-3">ARR_CHURNED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {queryOutput.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-3 text-cyan-400">{row.cohort}</td>
                            <td className="p-3">{row.gateway_provider}</td>
                            <td className="p-3 text-red-400 font-bold">{row.total_failed_dunnings}</td>
                            <td className="p-3 text-amber-400 font-bold">{row.arr_churned}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES & SCHEMAS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" /> Production Schema Specification
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The dataset contains real transaction attempts collected from multi-tenant European payment rails. Pay close attention to the <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">failure_code</code> and <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">settlement_latency_ms</code> columns.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-white/5 space-y-1">
                  <p className="text-slate-500">-- Table Schema: dwh_prod.finance.failed_billing_partitions</p>
                  <p>id: UUID (Primary Key)</p>
                  <p>customer_id: VARCHAR(64)</p>
                  <p>amount_due_usd: DECIMAL(10, 2)</p>
                  <p>failure_code: VARCHAR(32) [RETRY_TIMEOUT_SEPA, INSUFFICIENT_FUNDS]</p>
                  <p>payment_attempt_at: TIMESTAMP WITH TIME ZONE</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full md:w-96 glass-card border-t md:border-t-0 md:border-l border-white/10 p-6 space-y-6 flex flex-col h-auto md:h-screen overflow-y-auto bg-[#0B0F17]">
        <div className="space-y-1">
          <h2 className="text-base font-black text-white">Workplace Curriculum</h2>
          <p className="text-xs text-slate-400">{playerData.sections?.length || 0} stages • Interactive milestones</p>
        </div>

        <div className="space-y-4 flex-1">
          {playerData.sections && playerData.sections.map((section: any, idx: number) => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Stage {idx + 1}: {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.lessons && section.lessons.map((lesson: any) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
