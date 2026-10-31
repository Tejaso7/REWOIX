'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Briefcase, ExternalLink, Edit3, DollarSign, CheckCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Custom commission state
  const [newCommission, setNewCommission] = useState<number>(70);
  const [savingComm, setSavingComm] = useState(false);
  const [commMsg, setCommMsg] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchApi<any[]>('/admin/users/detailed');
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed loading platform users');
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleOpenModal = (user: any) => {
    setSelectedUser(user);
    setCommMsg('');
    if (user.teacher_profile && user.teacher_profile.custom_commission_percent) {
      setNewCommission(user.teacher_profile.custom_commission_percent);
    } else {
      setNewCommission(70.0);
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedUser) return;
    setSavingComm(true);
    setCommMsg('');

    try {
      await fetchApi(`/admin/teachers/${selectedUser.id}/commission`, {
        method: 'PUT',
        body: JSON.stringify({ custom_commission_percent: parseFloat(newCommission.toString()) }),
      });
      setCommMsg(`Updated ${selectedUser.full_name}'s teacher share split to ${newCommission}%!`);
      // Update local state
      setUsers(users.map((u) => {
        if (u.id === selectedUser.id && u.teacher_profile) {
          return {
            ...u,
            teacher_profile: {
              ...u.teacher_profile,
              custom_commission_percent: parseFloat(newCommission.toString()),
            }
          };
        }
        return u;
      }));
    } catch (err: any) {
      setCommMsg(err.message || 'Failed updating commission');
    } finally {
      setSavingComm(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading user database & onboarding profiles...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Platform User Directory & Custom Commission Manager</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Inspect full working professional details, bank records, learner archetypes, and assign custom revenue percentage cuts.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">User / Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Working Professional / College</th>
                <th className="px-6 py-4">Current Cut Split</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => {
                const roles = Array.isArray(u.roles) ? u.roles : [];
                const isTeacher = roles.includes('TEACHER');
                const isAdmin = roles.includes('ADMIN');
                const isLearner = roles.includes('LEARNER');

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.full_name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{u.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isAdmin ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        isTeacher ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {roles[0] || 'USER'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {isTeacher && u.teacher_profile ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.teacher_profile.company_name || 'Working Instructor'}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">{u.teacher_profile.headline || 'Professional'} • {u.teacher_profile.experience_years || '5+ Yrs'}</div>
                        </div>
                      ) : u.learner_profile ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.learner_profile.institution_or_company || 'Learner'}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">{u.learner_profile.user_type} • {u.learner_profile.field_of_study_or_role || 'General'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Standard User</span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold">
                      {isTeacher ? (
                        <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                          {u.teacher_profile?.custom_commission_percent || 70}% Teacher / {100 - (u.teacher_profile?.custom_commission_percent || 70)}% Admin
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors border border-blue-500/20"
                      >
                        Inspect & Edit Cut
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email} • Role: {Array.isArray(selectedUser.roles) ? selectedUser.roles.join(', ') : 'USER'}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Teacher Details */}
            {selectedUser.teacher_profile && (
              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-purple-600 dark:text-purple-400">Working Professional Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Company:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.company_name || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Domain:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.domain_expertise || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">CTC Bracket:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.ctc_bracket || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Experience:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.experience_years || 'N/A'}</strong></div>
                  <div className="sm:col-span-2 break-all"><span className="text-slate-400">LinkedIn:</span> <a href={selectedUser.teacher_profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{selectedUser.teacher_profile.linkedin_url || 'N/A'}</a></div>
                  <div className="sm:col-span-2 break-all"><span className="text-slate-400">GitHub:</span> <a href={selectedUser.teacher_profile.github_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{selectedUser.teacher_profile.github_url || 'N/A'}</a></div>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">Verified Bank & Payout Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Account Holder:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.account_holder_name || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Bank Name:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.bank_name || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Account Number:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.account_number || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">IFSC Code:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.ifsc_code || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">UPI ID:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.teacher_profile.upi_id || 'N/A'}</strong></div>
                </div>
              </div>
            )}

            {/* Learner Details */}
            {selectedUser.learner_profile && (
              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">Student & Learner Background</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Archetype:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.learner_profile.user_type || 'STUDENT'}</strong></div>
                  <div><span className="text-slate-400">Institution/Company:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.learner_profile.institution_or_company || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Field/Role:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.learner_profile.field_of_study_or_role || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Primary Goal:</span> <strong className="text-slate-900 dark:text-white">{selectedUser.learner_profile.primary_learning_goal || 'N/A'}</strong></div>
                </div>
              </div>
            )}

            {/* Custom Commission Adjuster Form */}
            {selectedUser.roles?.includes('TEACHER') && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Admin Custom Teacher Commission Cut (%)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Set custom revenue share split for {selectedUser.full_name}. Default is 70%. (e.g. 80.0% means instructor gets 80% per course sale).
                </p>

                {commMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {commMsg}
                  </div>
                )}

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newCommission}
                    onChange={(e) => setNewCommission(parseFloat(e.target.value))}
                    className="w-28 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">% Teacher Share</span>
                  <button
                    onClick={handleUpdateCommission}
                    disabled={savingComm}
                    className="gradient-button px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md whitespace-nowrap"
                  >
                    {savingComm ? 'Updating...' : 'Save Commission Split'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
