'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Play, 
  Check, 
  X as CloseIcon, 
  Sparkles, 
  Database, 
  Layers, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Users, 
  Target, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  BarChart, 
  Flame, 
  Code,
  Terminal,
  Cpu,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import WorkspaceSimulation from '@/components/WorkspaceSimulation';
import WaitlistSection from '@/components/WaitlistSection';
import { SimulationTrack } from '@/types';

const SIMULATION_TRACKS: SimulationTrack[] = [
  {
    id: 'track-fintech-churn',
    title: 'Enterprise Churn Prediction & Revenue Retention',
    domain: 'Fintech',
    brief: 'Investigate a sudden 18.4% drop in European recurring renewal rates across Tier-2 enterprise contracts. Sift through asynchronous payment retry event tables, diagnose webhook timeout latency, and present a cash-flow mitigation model to the CFO.',
    tools: ['SQL', 'Python', 'dbt', 'Snowflake'],
    difficulty: 'Advanced',
    isLocked: false,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    id: 'track-ecommerce-pricing',
    title: 'Dynamic Markdown Elasticity & Inventory Optimization',
    domain: 'E-Commerce',
    brief: 'Analyze 3.2M SKU records to identify dead inventory and margin erosion ahead of Black Friday. Balance clearance velocity against gross profit trade-offs and pitch dynamic discount tiers to the VP of Merchandising.',
    tools: ['Python', 'Tableau', 'PostgreSQL'],
    difficulty: 'Foundational',
    isLocked: false,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    id: 'track-saas-latency',
    title: 'Logistics Supply-Chain SLA Latency Optimization',
    domain: 'SaaS',
    brief: 'Diagnose intermittent 45-minute order fulfillment delays across 12 automated distribution hubs. Join real-time Kafka telematics with driver dispatch relational logs to isolate microservice queue bottlenecks.',
    tools: ['SQL', 'PowerBI', 'Kafka'],
    difficulty: 'Executive',
    isLocked: false,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  },
  {
    id: 'track-healthcare-triage',
    title: 'ICU Patient Readmission Risk & Clinical Triage Analytics',
    domain: 'Healthcare',
    brief: 'Audit 30-day cardiac readmission patterns to identify post-discharge monitoring gaps. Reconcile electronic health records with pharmacy dispensation logs while defending HIPAA privacy constraints to the Medical Ethics Board.',
    tools: ['Python', 'SQL', 'BigQuery'],
    difficulty: 'Advanced',
    isLocked: true,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  },
];

export default function HomePage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [activeModalTrack, setActiveModalTrack] = useState<SimulationTrack | null>(null);

  const filteredTracks = selectedDomain === 'All' 
    ? SIMULATION_TRACKS 
    : SIMULATION_TRACKS.filter((t) => t.domain === selectedDomain);

  return (
    <div className="space-y-24 md:space-y-32 pb-20">
      {/* =========================================================================
          1. HERO SECTION & WORKSPACE SIMULATOR CENTERPIECE
         ========================================================================= */}
      <section className="relative pt-12 md:pt-20 px-6 overflow-hidden">
        {/* Ambient Glow Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-blue-600/10 to-transparent -z-10 blur-2xl" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Pre-title Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>The Corporate Experience Simulator</span>
          </div>

          {/* High-Impact H1 */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Stop learning projects. <br />
            <span className="gradient-text">Start experiencing work.</span>
          </h1>

          {/* Supporting Value Proposition */}
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Real-world projects. Real business problems. Real industry thinking. Step into messy enterprise databases, handle executive pushback, and defend data-driven strategy where millions are on the line.
          </p>

          {/* Dual CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href="#waitlist"
              className="w-full sm:w-auto gradient-button px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25"
            >
              <span>Request Early Access</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#simulation"
              className="w-full sm:w-auto secondary-button px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-500" />
              <span>Explore Simulations</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> Staff Engineer Designed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> 14+ Enterprise Scenarios
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> Zero Toy Datasets
            </span>
          </div>
        </div>

        {/* Centerpiece: Interactive Hero Workspace Simulation Mockup */}
        <div id="simulation" className="max-w-5xl mx-auto mt-12 md:mt-16 scroll-mt-24">
          <WorkspaceSimulation />
        </div>
      </section>

      {/* =========================================================================
          2. THE REALITY CHECK (PROBLEM GRID)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            The Industry Reality Check
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why tutorial projects get ignored by hiring managers
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Every recruiter has seen the Titanic survival CSV and Boston housing linear regression. Real companies don't operate on cleaned datasets with obvious answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clean CSVs vs. 14 Fragmented Schemas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tutorials hand you a single, pre-joined 1,000-row spreadsheet with zero nulls. Reality forces you to join fragmented Snowflake tables, reconcile dirty event logs, and handle timezone mismatches.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
              <span className="text-red-500 font-bold">Tutorial:</span> df.dropna()<br />
              <span className="text-cyan-500 font-bold">Reality:</span> 4.2M NULL foreign keys
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step-by-Step Prompts vs. Ambiguous Executive Questions
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Courses give you explicit directions: "Group by category and calculate sum". Real executives walk into your room and ask: <em>"Why did customer retention drop 22% in DACH after our v4.2 update?"</em>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
              <span className="text-red-500 font-bold">Tutorial:</span> Pre-baked instructions<br />
              <span className="text-cyan-500 font-bold">Reality:</span> Ambiguity & Tradeoffs
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Academic Accuracies vs. Multi-Million Dollar ROI
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Celebrating 96% model accuracy means nothing if the VP rejects your recommendations because operational margins can't support the engineering turnaround.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
              <span className="text-red-500 font-bold">Tutorial:</span> R-squared = 0.94<br />
              <span className="text-cyan-500 font-bold">Reality:</span> +$1.28M Net Protected ARR
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (6-STAGE SIMULATION LOOP)
         ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            The Workplace Methodology
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The 6-Stage Simulation Loop
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Every REWOIX simulation forces you through the exact cognitive workflow of high-earning Lead Analysts and Staff BI Engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stage 1 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">01</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Business Briefing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive a crisis memo from your simulated CFO or VP of Product detailing revenue leakage, budget constraints, and board deadlines.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">02</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Messy Raw Data</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect to asynchronous cloud warehouses with uncleaned event tables, null values, and discrepancies that require custom SQL cleaning.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">03</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Root Cause Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Slice cohorts, test correlations, and separate coincidence from true root causes to diagnose whether product or payment friction is responsible.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">04</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strategic Recommendation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Model trade-offs between manual interventions and automated code patches. Draft a concrete, numbers-backed ROI memo.
            </p>
          </div>

          {/* Stage 5 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">05</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Stakeholder Pushback</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Face simulated skeptical questions from executives. Defend your assumptions against cash-flow, timeline, and customer impact concerns.
            </p>
          </div>

          {/* Stage 6 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden">
            <span className="text-4xl font-extrabold text-slate-200 dark:text-white/5 absolute top-4 right-4">06</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Measurable Business Impact</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track your deployed fix in live simulated cohorts. Receive a verified executive case memo for your senior portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TRADITIONAL COURSES VS. REWOIX (COMPARISON MATRIX)
         ========================================================================= */}
      <section id="comparison" className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Divergent Paradigms
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Traditional Courses vs. REWOIX
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            See the difference between passive video streaming and active workplace decision-making.
          </p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4">Evaluation Dimension</th>
                  <th className="px-6 py-4 text-slate-400 font-semibold">Generic Video Courses & Bootcamps</th>
                  <th className="px-6 py-4 text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/5">
                    REWOIX Corporate Simulator
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Learning Modality</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <CloseIcon className="w-4 h-4 text-red-500 flex-shrink-0" /> Passive video watching and quiz guessing
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Active executive problem solving & simulation
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Data Fidelity</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <CloseIcon className="w-4 h-4 text-red-500 flex-shrink-0" /> Cleaned 1-table CSVs with zero nulls
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Fragmented multi-table schemas with real-world mess
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Problem Scoping</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <CloseIcon className="w-4 h-4 text-red-500 flex-shrink-0" /> Predetermined syntax prompts with one exact answer
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Open-ended business ambiguity with trade-off analysis
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Stakeholder Dynamic</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <CloseIcon className="w-4 h-4 text-red-500 flex-shrink-0" /> Zero business pushback or feedback loop
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Defend strategy against skeptical CFO & VP questions
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Interview Outcome</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <CloseIcon className="w-4 h-4 text-red-500 flex-shrink-0" /> Cloned GitHub repo with no business context
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Documented boardroom case study proving ROI delivery
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SIMULATION TRACKS / CATALOG (DYNAMIC CARDS)
         ========================================================================= */}
      <section id="tracks" className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Interactive Corporate Scenarios
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simulation Tracks & Domains
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Each scenario is reverse-engineered from real multi-million dollar corporate dilemmas encountered by Staff BI & Data Architects.
            </p>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
            {['All', 'Fintech', 'E-Commerce', 'SaaS', 'Healthcare'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedDomain === d
                    ? 'gradient-button text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Track Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="glass-card glass-card-hover rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              {/* Card Thumbnail Header */}
              {track.thumbnail && (
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-black/60 backdrop-blur text-cyan-400 border border-white/15">
                        {track.domain}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur ${
                          track.difficulty === 'Executive'
                            ? 'bg-purple-900/70 text-purple-300 border border-purple-500/30'
                            : track.difficulty === 'Advanced'
                            ? 'bg-amber-900/70 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {track.difficulty}
                      </span>
                    </div>

                    {track.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full font-bold border border-white/10">
                        <Lock className="w-3 h-3 text-slate-400" /> Phase 2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 backdrop-blur px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors leading-snug">
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {track.brief}
                  </p>
                </div>

              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
                {/* Tools Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Tools:</span>
                  {track.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setActiveModalTrack(track)}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Inspect Scenario Brief <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="#waitlist"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Reserve Track
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Modal Drawer for Track Brief */}
        {activeModalTrack && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-xl w-full p-6 md:p-8 rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-500 text-xs font-bold uppercase">
                  {activeModalTrack.domain} Track • {activeModalTrack.difficulty}
                </span>
                <button
                  onClick={() => setActiveModalTrack(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeModalTrack.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModalTrack.brief}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 space-y-2 border border-slate-200 dark:border-white/10 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Simulation Deliverables:</div>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>Snowflake SQL Query isolating root cause error rates</li>
                  <li>Cohort retention waterfall model</li>
                  <li>1-Page Executive Tradeoff Memo defending ROI to CFO</li>
                  <li>Simulated deployment validation</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#waitlist"
                  onClick={() => setActiveModalTrack(null)}
                  className="flex-1 gradient-button py-3 rounded-xl font-bold text-xs text-center shadow-lg"
                >
                  Request Early Access to this Track
                </a>
                <button
                  onClick={() => setActiveModalTrack(null)}
                  className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          6. TECH STACK & ENTERPRISE TOOLS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Enterprise Tooling You Will Use
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Standard Modern Data & Analytics Stack
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {[
            'PostgreSQL',
            'Snowflake',
            'dbt Core',
            'Python 3.12',
            'PowerBI',
            'Tableau',
            'Git & GitHub',
            'Jira Cloud',
            'Apache Kafka',
            'Google BigQuery',
            'AWS S3',
          ].map((tool) => (
            <div
              key={tool}
              className="glass-card px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-colors"
            >
              {tool}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. TARGET PERSONAS
         ========================================================================= */}
      <section id="personas" className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Designed for Career Acceleration
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Who REWOIX is engineered for
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Whether breaking into tech or advancing from execution to strategy, REWOIX bridges the corporate experience gap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persona 1 */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Entry Level</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Final Year Students & Fresh Grads
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bypass the frustrating <em>"2 years of prior experience required"</em> paradox. In interviews, stop talking about homework assignments and walk through how you solved a real $1.8M churn incident.
            </p>
            <div className="pt-2 text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
              Key Outcome: Stand out in Top 2% of hiring pipelines
            </div>
          </div>

          {/* Persona 2 */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Pivoting</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Career Switchers (Non-Tech to Data)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Transitioning from sales, operations, or finance? Prove you don't just know Python syntax—demonstrate that you grasp unit economics, stakeholder politics, and real corporate decision loops.
            </p>
            <div className="pt-2 text-[11px] text-purple-600 dark:text-purple-400 font-bold">
              Key Outcome: Fast-track transition into high-paying BI roles
            </div>
          </div>

          {/* Persona 3 */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Leveling Up</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Junior Analysts Seeking Senior Roles
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tired of being treated as an ad-hoc SQL ticket monkey? Master executive storytelling, trade-off defense, and proactive business scoping to unlock promotion to Senior and Lead Analyst bands.
            </p>
            <div className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              Key Outcome: Break the ceiling into strategic leadership
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. WHAT REWOIX IS NOT (ANTI-PATTERNS CHECKLIST)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-red-500">
            Absolute Clarity
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What REWOIX Is NOT
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-left">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <CloseIcon className="w-4 h-4" /> NOT a 50-Hour Video Dump
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We do not believe in passive video watching where instructors code while you tab out. You learn by doing, failing, and defending choices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-left">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <CloseIcon className="w-4 h-4" /> NOT Certificate Farming
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              A badge on LinkedIn doesn't impress hiring managers. A documented 1-page executive memo detailing how you saved $1.28M ARR does.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-left">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <CloseIcon className="w-4 h-4" /> NOT Step-by-Step Hand-Holding
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We do not tell you which column to group by. You must navigate real corporate ambiguity, inspect dirty schemas, and justify your hypotheses.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. INTERACTIVE WAITLIST & LEAD CAPTURE SECTION
         ========================================================================= */}
      <WaitlistSection />
    </div>
  );
}
