import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">REWOIX</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Production-ready dynamic learning marketplace LMS platform engineered for scale with multi-role RBAC and automated revenue splits.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Explore</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><Link href="/courses" className="hover:text-blue-600 dark:hover:text-white transition-colors">All Courses</Link></li>
            <li><Link href="/courses" className="hover:text-blue-600 dark:hover:text-white transition-colors">Web Development</Link></li>
            <li><Link href="/courses" className="hover:text-blue-600 dark:hover:text-white transition-colors">AI & Machine Learning</Link></li>
            <li><Link href="/courses" className="hover:text-blue-600 dark:hover:text-white transition-colors">Cloud & DevOps</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Instructors</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-white transition-colors">Become a Teacher</Link></li>
            <li><Link href="/teacher/dashboard" className="hover:text-blue-600 dark:hover:text-white transition-colors">Teacher Dashboard</Link></li>
            <li><Link href="/teacher/earnings" className="hover:text-blue-600 dark:hover:text-white transition-colors">Earnings & Ledger</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Enterprise Grade</h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li><span>OAuth2 JWT Security</span></li>
            <li><span>HMAC Webhook Verification</span></li>
            <li><span>Verifiable Certificates</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-500 dark:text-slate-500">
        © {new Date().getFullYear()} REWOIX LMS Marketplace. Built for 10,000+ Enterprise Users.
      </div>
    </footer>
  );
}
