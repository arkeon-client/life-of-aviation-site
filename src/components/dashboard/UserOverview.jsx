import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SpotlightCard from '../ui/SpotlightCard';
import { Clock, CheckCircle, Book, Award, Megaphone, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function UserOverview() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel Fetching for speed
      const [profResult, enrollResult, announceResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('enrollments').select('*').eq('user_id', user.id),
        supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      setProfile(profResult.data);
      const userEnrolls = enrollResult.data || [];
      setEnrollments(userEnrolls);

      // --- NEW FILTERING LOGIC START ---
      // This ensures users only see announcements meant for them
      
      const activeIds = userEnrolls.filter(e => e.status === 'active').map(e => e.course_id);
      const isRegistered = activeIds.length > 0;

      const filteredAnnouncements = (announceResult.data || []).filter(item => {
        // 1. Public (All)
        if (item.target_group === 'all') return true;
        
        // 2. Registered Users Only
        if (item.target_group === 'registered' && isRegistered) return true;
        
        // 3. Non-Registered Only (Sales/Promos)
        if (item.target_group === 'not_registered' && !isRegistered) return true;
        
        // 4. Specific Course (e.g., 'course:aerogenesis')
        if (item.target_group.startsWith('course:')) {
            const requiredCourse = item.target_group.split(':')[1];
            return activeIds.includes(requiredCourse);
        }
        return false;
      });

      setAnnouncements(filteredAnnouncements);
      // --- NEW FILTERING LOGIC END ---

      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <div className="p-8 text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin text-pelican-coral"/> Loading mission data...</div>;

  // Calculate Logic
  const activeCourses = enrollments.filter(e => e.status === 'active');
  const pendingCourses = enrollments.filter(e => e.status === 'pending');
  
  // Determine overall status string
  let mainStatus = 'No Enrollments';
  if (activeCourses.length > 0) mainStatus = 'Active Pilot';
  else if (pendingCourses.length > 0) mainStatus = 'In Review';

  return (
    <div className="animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Status Card */}
        <SpotlightCard className="bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${mainStatus === 'Active Pilot' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {mainStatus === 'Active Pilot' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</span>
          </div>
          <h3 className="text-2xl text-white font-heading mb-1">{mainStatus}</h3>
          <p className="text-slate-400 text-sm">
            {mainStatus === 'Active Pilot' ? 'Cleared for flight operations.' : 
             mainStatus === 'In Review' ? 'Application under review.' : 
             'Browse courses to begin.'}
          </p>
        </SpotlightCard>

        {/* Active Courses Card */}
        <SpotlightCard className="bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-pelican-coral/10 rounded-lg text-pelican-coral">
              <Book size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Courses</span>
          </div>
          <h3 className="text-2xl text-white font-heading mb-1">{activeCourses.length} Active</h3>
          <p className="text-slate-400 text-sm">
            {activeCourses.length > 0 ? 'Good luck with your studies.' : 'Enroll to start learning.'}
          </p>
        </SpotlightCard>

        {/* Rank Card */}
        <SpotlightCard className="bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Award size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Rank</span>
          </div>
          <h3 className="text-2xl text-white font-heading mb-1">{profile?.rank || 'Cadet'}</h3>
          <p className="text-slate-400 text-sm">Complete courses to promote.</p>
        </SpotlightCard>
      </div>

      {/* Live Feed / Announcements */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[300px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pelican-coral/50 to-transparent"></div>
        
        <h3 className="text-xl text-white font-heading mb-6 flex items-center gap-3">
            <div className="p-2 bg-pelican-coral/10 rounded-lg text-pelican-coral"><Megaphone size={20} /></div>
            Flight Deck Comms
        </h3>

        <div className="space-y-4">
            {announcements.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center">
                    <CheckCircle className="text-slate-600 mb-4" size={40} />
                    <p className="text-slate-500">All systems nominal. No new broadcasts.</p>
                    <a href="/dashboard/courses" className="text-pelican-coral text-sm hover:underline mt-4 inline-flex items-center gap-1 group">
                        Browse Course Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            ) : (
                announcements.map(item => (
                    <div key={item.id} className="p-5 bg-[#020617]/50 rounded-xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 shadow-[0_0_10px_currentColor] ${
                            item.type === 'alert' ? 'bg-yellow-500 text-yellow-500' : 
                            item.type === 'success' ? 'bg-green-500 text-green-500' : 
                            'bg-blue-500 text-blue-500'
                        }`}></div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.message}</p>
                            <span className="text-[10px] text-slate-600 mt-2 block font-mono">
                                {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}