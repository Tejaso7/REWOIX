'use client';

import { useState } from 'react';
import { 
  Terminal, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Database, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Clock, 
  Building2, 
  ChevronRight,
  Code2
} from 'lucide-react';

export default function WorkspaceSimulation() {
  const [activeTab, setActiveTab] = useState<'brief' | 'sql' | 'kpis' | 'memo'>('brief');
  const [isRunningQuery, setIsRunningQuery] = useState(false);
  const [queryExecuted, setQueryExecuted] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'eu' | 'us'>('eu');

  const handleRunQuery = () => {
    setIsRunningQuery(true);
    setTimeout(() => {
      setIsRunningQuery(false);
      setQueryExecuted(true);
      setActiveTab('kpis');
    }, 900);
  };

  return (
    <div className="w-full glass-card rounded-2xl md:rounded-3xl border border-slate-300 dark:border-white/10 shadow-2xl overflow-hidden text-left bg-white/90 dark:bg-[#111827]/90 transition-all">
      {/* Simulation Top Bar */}
      <div className="bg-slate-100 dark:bg-[#0B0F17] px-4 md:px-6 py-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window Controls & Company */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-white">NexusPay Global Inc.</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">• Enterprise FinTech Simulator</span>
          </div>
        </div>

        {/* Center / Right: Live Status Badge & Role */}
        <div className="flex items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>INCIDENT #4091: LIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5" /> 12ms query latency
          </div>
          <div className="bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-500/20">
            Role: Lead BI Architect
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#1E293B]/40 px-3 md:px-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex items-center gap-2 py-3 px-3 md:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'brief'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Executive Brief</span>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 py-3 px-3 md:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sql'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>2. Messy SQL Query</span>
          {queryExecuted && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 py-3 px-3 md:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'kpis'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>3. Root Cause & KPIs</span>
          <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.2 rounded font-bold">18.4% Churn</span>
        </button>

        <button
          onClick={() => setActiveTab('memo')}
          className={`flex items-center gap-2 py-3 px-3 md:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'memo'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>4. Recommendation & Pushback</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="p-4 md:p-6 min-h-[420px] text-xs">
        {/* TAB 1: EXECUTIVE BRIEF */}
        {activeTab === 'brief' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <div className="font-bold text-xs uppercase tracking-wider">High-Priority Business Alert</div>
                <p className="text-xs leading-relaxed">
                  Incoming stakeholder emergency: Renewal retention in Tier-2 Enterprise accounts has fallen from <strong>94.2%</strong> to <strong>75.8%</strong> over 30 days. No product changes were deployed.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    ER
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Elena Rostova</div>
                    <div className="text-[10px] text-slate-500">VP of Revenue Operations • Sent to: BI & Data Team</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Today, 08:42 AM</span>
              </div>

              <div className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                <p>
                  "We have an emergency. Our Q3 renewal cohort in DACH and Western Europe dropped off a cliff. The CRO suspects customer dissatisfaction with the v4.0 UI redesign, but NPS scores are steady."
                </p>
                <p>
                  "The Board convenes this Thursday. I need your team to dig into our billing schemas, stripe webhook logs, and subscription databases. Is this product failure, or silent operational friction? <strong>Give me a root-cause diagnosis and an ROI mitigation model by 5 PM.</strong>"
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Constraint: Max 2 Eng Days
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Exposure: $1.84M ARR
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  SLA: Thursday Board Review
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 text-[11px]">Next: Query partitioned billing tables to isolate the failure code</span>
              <button
                onClick={() => setActiveTab('sql')}
                className="gradient-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                Inspect SQL Workbench <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MESSY SQL QUERY */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Code2 className="w-4 h-4 text-cyan-500" />
                <span className="font-mono text-[11px]">snowflake_prod.billing.dunning_events_v2</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">Uncleaned Schema</span>
              </div>
              <button
                onClick={handleRunQuery}
                disabled={isRunningQuery}
                className="gradient-button px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {isRunningQuery ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running Query...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Execute Query (Ctrl+Enter)
                  </>
                )}
              </button>
            </div>

            {/* Code Editor Box */}
            <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner overflow-x-auto">
              <div className="text-slate-500 mb-1">-- Real-world problem: Isolating silent recurring payment failures</div>
              <div><span className="text-purple-400">WITH</span> failed_retries <span className="text-purple-400">AS</span> (</div>
              <div className="pl-4">
                <span className="text-purple-400">SELECT</span> account_id, event_timestamp, gateway_error_code,
              </div>
              <div className="pl-4">
                <span className="text-blue-400">COUNT</span>(*) <span className="text-purple-400">OVER</span>(<span className="text-purple-400">PARTITION BY</span> account_id) <span className="text-purple-400">AS</span> retry_frequency
              </div>
              <div className="pl-4">
                <span className="text-purple-400">FROM</span> snowflake_prod.billing.dunning_events_v2
              </div>
              <div className="pl-4">
                <span className="text-purple-400">WHERE</span> event_timestamp &gt;= <span className="text-emerald-400">'2026-08-01'</span>
              </div>
              <div className="pl-4">
                <span className="text-purple-400">AND</span> region = <span className="text-emerald-400">'EU-WEST'</span>
              </div>
              <div>)</div>
              <div><span className="text-purple-400">SELECT</span></div>
              <div className="pl-4">
                <span className="text-blue-400">COALESCE</span>(gateway_error_code, <span className="text-emerald-400">'RETRY_TIMEOUT_SEPA'</span>) <span className="text-purple-400">AS</span> failure_root_cause,
              </div>
              <div className="pl-4">
                <span className="text-blue-400">COUNT</span>(<span className="text-purple-400">DISTINCT</span> account_id) <span className="text-purple-400">AS</span> impacted_accounts,
              </div>
              <div className="pl-4">
                <span className="text-blue-400">SUM</span>(c.contract_mrr * 12) <span className="text-purple-400">AS</span> arr_at_risk
              </div>
              <div><span className="text-purple-400">FROM</span> failed_retries f</div>
              <div><span className="text-purple-400">JOIN</span> snowflake_prod.crm.contracts c <span className="text-purple-400">ON</span> f.account_id = c.id</div>
              <div><span className="text-purple-400">GROUP BY</span> 1 <span className="text-purple-400">ORDER BY</span> 3 <span className="text-purple-400">DESC</span>;</div>
            </div>

            {/* Query Output Result Table */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Query Result • 3 rows returned in 12ms</span>
                <span className="text-emerald-500 font-mono text-[10px]">Status: 200 OK</span>
              </div>
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-semibold">failure_root_cause</th>
                    <th className="px-4 py-2 font-semibold">impacted_accounts</th>
                    <th className="px-4 py-2 font-semibold">arr_at_risk</th>
                    <th className="px-4 py-2 font-semibold text-right">diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  <tr className="bg-red-500/5">
                    <td className="px-4 py-2 font-bold text-red-500">RETRY_TIMEOUT_SEPA</td>
                    <td className="px-4 py-2 text-slate-900 dark:text-white">412</td>
                    <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">$1,842,500</td>
                    <td className="px-4 py-2 text-right text-red-400 font-sans font-semibold">Root Cause (81% of churn)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">INSUFFICIENT_FUNDS</td>
                    <td className="px-4 py-2 text-slate-900 dark:text-white">89</td>
                    <td className="px-4 py-2 text-slate-900 dark:text-white">$310,000</td>
                    <td className="px-4 py-2 text-right text-slate-400 font-sans">Normal Baseline (13%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">EXPIRED_TOKEN</td>
                    <td className="px-4 py-2 text-slate-900 dark:text-white">45</td>
                    <td className="px-4 py-2 text-slate-900 dark:text-white">$142,000</td>
                    <td className="px-4 py-2 text-right text-slate-400 font-sans">Normal Baseline (6%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE KPI DASHBOARD & COHORT VISUALIZATION */}
        {activeTab === 'kpis' && (
          <div className="space-y-5">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>ARR At Risk</span>
                  <DollarSign className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-xl font-extrabold text-red-500">$1,842,500</div>
                <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +18.4% churn spike
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Affected Cohort</span>
                  <Users className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">412 Accounts</div>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold mt-1">
                  EU Tier-2 Enterprise SEPA
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Anomaly Source</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-300">SEPA Webhook Latency</div>
                <div className="text-[10px] text-slate-500 mt-1">10s timeout on v3.8 gateway</div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Projected Recovery</span>
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">+$1,280,000</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  92% Retention Turnaround
                </div>
              </div>
            </div>

            {/* Interactive Visual Bar Chart */}
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Monthly Enterprise Retention Trend & Recovery Projection
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Visualizing historical baseline, silent failure drop-off, and projected fix impact
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[10px]">
                  <button
                    onClick={() => setSelectedCohort('eu')}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      selectedCohort === 'eu' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    EU Tier-2 (Incident)
                  </button>
                  <button
                    onClick={() => setSelectedCohort('all')}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      selectedCohort === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Global Aggregate
                  </button>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="pt-4 grid grid-cols-6 gap-2 md:gap-4 items-end h-40 border-b border-slate-200 dark:border-white/10 pb-2">
                {/* May */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 font-mono">94.8%</div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t-md transition-all h-[95%]" />
                  <span className="text-[10px] text-slate-500">May</span>
                </div>

                {/* Jun */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 font-mono">94.2%</div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t-md transition-all h-[94%]" />
                  <span className="text-[10px] text-slate-500">Jun</span>
                </div>

                {/* Jul */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 font-mono">93.9%</div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t-md transition-all h-[93%]" />
                  <span className="text-[10px] text-slate-500">Jul</span>
                </div>

                {/* Aug (Drop) */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-red-500 font-bold font-mono">
                    {selectedCohort === 'eu' ? '75.8%' : '88.1%'}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-md transition-all shadow-lg shadow-red-500/20"
                    style={{ height: selectedCohort === 'eu' ? '75%' : '88%' }}
                  />
                  <span className="text-[10px] font-bold text-red-500">Aug (Drop)</span>
                </div>

                {/* Sep (Diagnosis) */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-amber-500 font-bold font-mono">
                    {selectedCohort === 'eu' ? '76.4%' : '88.4%'}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all"
                    style={{ height: selectedCohort === 'eu' ? '76%' : '88%' }}
                  />
                  <span className="text-[10px] font-bold text-amber-500">Sep (Active)</span>
                </div>

                {/* Oct (Fix Projected) */}
                <div className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] text-emerald-500 font-bold font-mono">
                    {selectedCohort === 'eu' ? '93.2%' : '94.6%'}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t-md transition-all shadow-lg shadow-emerald-500/20 border-t-2 border-dashed border-white"
                    style={{ height: selectedCohort === 'eu' ? '93%' : '94%' }}
                  />
                  <span className="text-[10px] font-bold text-emerald-500">Oct (Fix)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECOMMENDATION & STAKEHOLDER PUSHBACK */}
        {activeTab === 'memo' && (
          <div className="space-y-4">
            {/* Strategic Options Tradeoff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 opacity-70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Option A: Manual Support Outreach</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Rejected</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Have CS reps individually email 412 enterprise accounts to update payment info.
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Cost: $45,000 in support hours • Recovery Time: 6 weeks • Est. Success: 48%
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Option B: Automated Retry Latency Patch</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded font-bold">Recommended</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  Increase SEPA webhook timeout from 10s to 45s + grant auto 7-day grace period with multi-gateway failover.
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                  Cost: 4 Eng Hours • Recovery: $1,280,000 ARR Saved • Est. Success: 92%
                </div>
              </div>
            </div>

            {/* Stakeholder Pushback Box */}
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Simulated Stakeholder Pushback
                </span>
                <span className="text-[10px] text-slate-400">Marcus Vance • Chief Financial Officer</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                "If we grant an automatic 7-day grace period on 412 enterprise subscriptions, won't that distort our Q3 recognized revenue timing and create uncollectable bad debt exposure?"
              </div>

              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-slate-800 dark:text-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Your Data-Backed Defense
                </div>
                <p className="leading-relaxed">
                  "Historical ledger data reveals that 94% of SEPA retries settle within 5 business days. The timing shift represents only 3.2% of cash flow into Q4, but protects <strong>$1.28M in recurring ARR</strong> without damaging customer retention."
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-500 text-xs">CFO APPROVED RECOMMENDATION</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-500 font-bold">Simulation Score: 98/100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Footer Banner */}
      <div className="bg-slate-100 dark:bg-[#0B0F17] px-4 md:px-6 py-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
          <span>Interactive Workplace Simulator: You solve actual corporate dilemmas, not static test prompts.</span>
        </div>
        <a
          href="#waitlist"
          className="text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
        >
          Try 14+ Enterprise Simulations in Early Access <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
