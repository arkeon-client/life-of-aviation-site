import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ADMIN_EMAILS } from '../../lib/constants'; // Updated import
import { Inbox, User, Calendar, Mail, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AdminMessages() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Check Auth & Admin Status
        const { data: { user } } = await supabase.auth.getUser();
        
        // If not logged in, go to Sign In
        if (!user) {
          window.location.href = '/signin';
          return;
        }

        // UPDATED LOGIC: If logged in but email is NOT in list
        if (!ADMIN_EMAILS.includes(user.email)) {
          console.warn("Unauthorized Access: User is not Admin");
          window.location.href = '/dashboard';
          return;
        }

        // 2. Fetch Messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data);

      } catch (err) {
        console.error('Admin Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-pelican-coral" />
        <span className="text-sm tracking-widest uppercase">Verifying Security Clearance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center shadow-lg">
        <AlertTriangle className="mr-4 w-6 h-6" />
        <div>
          <h3 className="font-bold">System Error</h3>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-2">
               <ShieldAlert className="text-red-400 w-4 h-4" />
               <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Admin Access Granted</span>
            </div>
          </div>
          <h1 className="text-4xl font-heading text-white">Command Center</h1>
          <p className="text-slate-400 mt-2">Monitoring incoming transmissions and inquiries.</p>
        </div>
        
        <div className="px-6 py-3 bg-[#020617] border border-white/10 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-slate-300 text-sm font-medium">{messages.length} Messages</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
               <Inbox size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl text-white font-bold mb-2">No Transmissions</h3>
            <p className="text-slate-400">Your inbox is currently empty, Captain.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="bg-[#020617]/40 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-pelican-coral/50 hover:bg-white/5 transition-all duration-300 group shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* User Info */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-white font-heading text-xl mb-2">{msg.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                     <span className="flex items-center bg-white/5 px-2 py-1 rounded border border-white/5">
                        <Mail size={12} className="mr-2 text-pelican-coral"/> {msg.email}
                     </span>
                     <span className="flex items-center bg-white/5 px-2 py-1 rounded border border-white/5">
                        <Calendar size={12} className="mr-2 text-pelican-coral"/> {new Date(msg.created_at).toLocaleDateString()}
                     </span>
                     <span className="bg-pelican-coral/10 text-pelican-coral px-2 py-1 rounded border border-pelican-coral/20 font-bold uppercase tracking-wider">
                        {msg.inquiry_type}
                     </span>
                     {msg.age && (
                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">
                            Age: {msg.age}
                        </span>
                     )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <a 
                href={`mailto:${msg.email}?subject=Re: Your Inquiry to Life of Aviation`} 
                className="px-6 py-3 bg-white/5 hover:bg-pelican-coral hover:text-white border border-white/10 text-white text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 group/btn"
              >
                <Mail size={16} />
                Reply
              </a>
            </div>

            {/* Message Body */}
            <div className="mt-8 pl-8 md:pl-20 relative">
              <div className="absolute left-8 md:left-20 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/20 to-transparent"></div>
              <p className="text-slate-300 leading-loose font-light text-base bg-black/20 p-4 rounded-lg border border-white/5">
                "{msg.message}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}