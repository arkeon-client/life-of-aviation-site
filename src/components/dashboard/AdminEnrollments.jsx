import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Check, X, User, BookOpen, Clock, RefreshCw, Sparkles } from 'lucide-react';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    // Sort by updated_at so re-applications pop to the top
    const { data } = await supabase
      .from('enrollments')
      .select('*')
      .order('updated_at', { ascending: false }); 
    setEnrollments(data || []);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    // Optimistic UI update
    setEnrollments(enrollments.map(e => e.id === id ? { ...e, status: newStatus } : e));
    await supabase.from('enrollments').update({ status: newStatus }).eq('id', id);
  }

  // LOGIC: Is it a new application? (Created < 24 hours ago)
  const isNew = (created_at) => {
    const diff = new Date() - new Date(created_at);
    return diff < 1000 * 60 * 60 * 24; // 24 Hours
  };

  // LOGIC: Is it a re-application? (Pending, but Updated significantly later than Created)
  const isReapplied = (status, created_at, updated_at) => {
    if (status !== 'pending') return false;
    const created = new Date(created_at).getTime();
    const updated = new Date(updated_at).getTime();
    // If updated at least 1 minute after creation, assume it's a re-touch
    return (updated - created) > 60000; 
  };

  if (loading) return <div className="flex items-center text-slate-400 gap-2"><Loader2 className="animate-spin text-pelican-coral" /> Loading Flight Roster...</div>;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-heading text-white">Enrollment Requests</h2>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
          {enrollments.filter(e => e.status === 'pending').length} Pending
        </span>
      </div>
      
      <div className="space-y-4">
        {enrollments.length === 0 && (
            <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
                No active enrollments found.
            </div>
        )}

        {enrollments.map((enrollment) => {
          const showNewBadge = isNew(enrollment.created_at);
          const showReappliedBadge = isReapplied(enrollment.status, enrollment.created_at, enrollment.updated_at);

          return (
            <div key={enrollment.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-pelican-coral/30 transition-all">
              
              <div className="flex items-center gap-5 w-full">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/5
                    ${enrollment.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                      enrollment.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                      'bg-yellow-500/10 text-yellow-500'}
                `}>
                  {enrollment.status === 'active' ? <Check size={20} /> : 
                   enrollment.status === 'rejected' ? <X size={20} /> : 
                   <Clock size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-lg">{enrollment.user_name || 'Unknown Pilot'}</h3>
                    
                    {/* BADGES */}
                    {showNewBadge && (
                        <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-wider animate-pulse">
                            <Sparkles size={10} /> New
                        </span>
                    )}
                    {showReappliedBadge && (
                        <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-wider">
                            <RefreshCw size={10} /> Re-applied
                        </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs mt-1">{enrollment.user_email}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                     <span className="text-xs bg-white/10 px-2 py-1 rounded text-white border border-white/5 capitalize flex items-center gap-2">
                        <BookOpen size={10} className="text-pelican-coral"/> {enrollment.course_id}
                     </span>
                     <span className={`text-[10px] uppercase font-bold tracking-widest ${
                         enrollment.status === 'active' ? 'text-green-500' : 
                         enrollment.status === 'rejected' ? 'text-red-500' : 
                         'text-yellow-500'
                     }`}>
                       • {enrollment.status}
                     </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {enrollment.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(enrollment.id, 'active')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 text-[#020617] font-bold rounded-lg flex items-center gap-2 text-sm transition-colors shadow-lg shadow-green-500/20"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(enrollment.id, 'rejected')}
                      className="px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 font-bold rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
                {enrollment.status === 'active' && (
                  <button 
                    onClick={() => updateStatus(enrollment.id, 'pending')}
                    className="px-4 py-2 border border-white/10 text-slate-500 hover:text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Revoke Access
                  </button>
                )}
                {enrollment.status === 'rejected' && (
                  <button 
                    onClick={() => updateStatus(enrollment.id, 'pending')}
                    className="px-4 py-2 border border-white/10 text-slate-500 hover:text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Re-open
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}