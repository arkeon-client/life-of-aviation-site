import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Bell, User, CheckCircle, Info, AlertTriangle, Megaphone, Sparkles } from 'lucide-react';

export default function DashboardHeader() {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function init() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // 1. Fetch Necessary Data
        const [enrollResult, announceResult, profileResult] = await Promise.all([
            supabase.from('enrollments').select('course_id, status').eq('user_id', user.id).eq('status', 'active'),
            supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }),
            supabase.from('profiles').select('created_at').eq('id', user.id).single()
        ]);

        const activeEnrollments = enrollResult.data || [];
        const allAnnouncements = announceResult.data || [];
        const joinedAt = profileResult.data?.created_at;

        // 2. Logic: Filter Announcements
        const relevantNotifications = allAnnouncements.filter(item => {
            if (item.target_group === 'all') return true;
            
            // Check Registered Status
            if (item.target_group === 'registered') return activeEnrollments.length > 0;
            if (item.target_group === 'not_registered') return activeEnrollments.length === 0;

            // Check Specific Course
            if (item.target_group.startsWith('course:')) {
                const requiredCourse = item.target_group.split(':')[1];
                return activeEnrollments.some(e => e.course_id === requiredCourse);
            }
            return false;
        });

        // 3. Logic: Add "Welcome" Message for New Users (< 24 hrs)
        if (joinedAt) {
            const diff = new Date() - new Date(joinedAt);
            if (diff < 1000 * 60 * 60 * 24) { // 24 Hours
                relevantNotifications.unshift({
                    id: 'welcome-msg',
                    title: 'Welcome, Captain!',
                    message: 'Welcome to Life of Aviation. Complete your profile and check out the Programs tab to start your journey.',
                    type: 'welcome',
                    created_at: new Date().toISOString()
                });
            }
        }

        setNotifications(relevantNotifications);
        if (relevantNotifications.length > 0) setHasUnread(true);
    }
    init();

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasUnread(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pilot';

  return (
    <header className="flex items-center justify-end md:justify-between px-8 py-5 border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm sticky top-0 z-30">
      
      <div className="hidden md:block">
        <h2 className="text-white font-heading text-xl">
          Welcome back, <span className="text-pelican-coral">{displayName}</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Ready for your next mission?</p>
      </div>

      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        
        <button 
          onClick={toggleNotifications}
          className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-pelican-coral rounded-full animate-pulse"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              <span className="text-[10px] bg-pelican-coral/20 text-pelican-coral px-2 rounded-full">{notifications.length}</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">No active notifications.</div>
              ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${n.type === 'welcome' ? 'bg-pelican-coral/5' : ''}`}>
                      <div className="mt-1">
                        {n.type === 'success' ? <CheckCircle size={16} className="text-green-400" /> : 
                         n.type === 'alert' ? <AlertTriangle size={16} className="text-yellow-400" /> : 
                         n.type === 'welcome' ? <Sparkles size={16} className="text-pelican-coral" /> :
                         <Megaphone size={16} className="text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-bold">{n.title}</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pelican-coral to-blue-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
             <span className="font-bold text-white text-sm">
                {displayName.charAt(0).toUpperCase()}
             </span>
          </div>
        </div>

      </div>
    </header>
  );
}