import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Bell } from 'lucide-react';

export default function DashboardHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  // Get name from metadata or fallback to email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pilot';

  return (
    <header className="flex items-center justify-end md:justify-between px-8 py-5 border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm sticky top-0 z-20">
      
      {/* Welcome Text (Desktop) */}
      <div className="hidden md:block">
        <h2 className="text-white font-heading text-xl">
          Welcome back, <span className="text-pelican-coral">{displayName}</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Ready for your next mission?</p>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-6">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pelican-coral rounded-full"></span>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pelican-coral to-blue-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
             {/* Initials */}
             <span className="font-bold text-white text-sm">
                {displayName.charAt(0).toUpperCase()}
             </span>
          </div>
        </div>
      </div>
    </header>
  );
}