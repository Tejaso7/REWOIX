import Link from 'next/link';
import { Zap, Github, Linkedin, Twitter, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F17] py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              REWO<span className="gradient-text">IX</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            <strong className="text-slate-900 dark:text-slate-200">Real-World Industry Experience</strong> — The Corporate Experience Simulator for Data Analytics, Business Intelligence, and AI/ML. Stop learning projects. Start experiencing work.
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-400">
            <a 
              href="https://github.com/Tejaso7/REWOIX" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><Link href="/#simulation" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Workspace Simulator</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">6-Stage Loop</Link></li>
            <li><Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Industry Tracks</Link></li>
            <li><Link href="/#comparison" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Tutorials vs. REWOIX</Link></li>
            <li><Link href="/courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Course Catalog</Link></li>
          </ul>
        </div>

        {/* Column 3: Tracks & Domains */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Simulations</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Fintech Churn Modeling</Link></li>
            <li><Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">E-Commerce Markdown</Link></li>
            <li><Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">SaaS SLA Optimization</Link></li>
            <li><Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Healthcare Readmissions</Link></li>
          </ul>
        </div>

        {/* Column 4: Enterprise & Portals */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Portals</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Sign In / Dashboard</Link></li>
            <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Create Account</Link></li>
            <li><Link href="/#waitlist" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors font-semibold text-blue-600 dark:text-cyan-400">Join Beta Waitlist</Link></li>
            <li><Link href="/certificates/verify/EDU-DEMO-CERT" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Verify Certificate</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} REWOIX Inc. All rights reserved. Real-World Industry Experience.</p>
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Enterprise Data & Security Architecture Compliant
        </p>
      </div>
    </footer>
  );
}
