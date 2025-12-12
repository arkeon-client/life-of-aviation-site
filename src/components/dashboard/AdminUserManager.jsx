import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ADMIN_EMAILS } from '../../lib/constants';
import { User, Trash2, Mail, Loader2, Search, Sparkles, Calendar, BookOpen, Edit2, Check, X, Award } from 'lucide-react';

const RANKS = [
  'Cadet',
  'Flight Officer', 
  'Senior Officer', 
  'Commander', 
  'Captain'
];

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Rank Editing State
  const [editingId, setEditingId] = useState(null);
  const [newRank, setNewRank] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    // 1. Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      window.location.href = '/dashboard';
      return;
    }

    // 2. Fetch Profiles AND Enrollments
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);

    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('*');

    // 3. Merge Data
    const merged = profiles?.map(p => {
        const userEnrolls = enrolls?.filter(e => e.user_id === p.id) || [];
        return { ...p, enrollments: userEnrolls };
    });

    setUsers(merged || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure? This deletes the user record from the database.")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchUsers();
  }

  // Save Rank Change
  async function saveRank(id) {
    // Update Database
    const { error } = await supabase
        .from('profiles')
        .update({ rank: newRank })
        .eq('id', id);
    
    if (error) {
        alert("Update failed: " + error.message);
    } else {
        setEditingId(null);
        fetchUsers(); // Refresh to see change
    }
  }

  // Helper to check if user joined in last 48 hours
  const isNewUser = (dateString) => {
    const joinedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - joinedDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours < 48; 
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center text-slate-400 p-8"><Loader2 className="animate-spin mr-2 text-pelican-coral" /> Loading Personnel Database...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-heading text-white">User Management</h2>
          <p className="text-slate-400 mt-1">Total Pilots: <span className="text-white font-bold">{users.length}</span></p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search email or name..." 
            className="w-full pl-10 pr-4 py-2 bg-[#020617] border border-white/10 rounded-lg text-white text-sm focus:border-pelican-coral outline-none transition-colors"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 group hover:bg-white/10 transition-colors relative overflow-hidden">
            
            {/* Highlight Bar for New Users */}
            {isNewUser(user.created_at) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
            )}

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg border border-white/5">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={20} />}
              </div>
              
              <div>
                <div className="flex items-center gap-3">
                    <h4 className="text-white font-bold text-lg">{user.full_name || 'Unknown Pilot'}</h4>
                    
                    {/* Rank Display / Editor */}
                    {editingId === user.id ? (
                        <div className="flex items-center gap-2 bg-[#020617] border border-pelican-coral/50 rounded-lg p-1 animate-fade-in">
                            <select 
                                className="bg-transparent text-xs text-white outline-none w-32 cursor-pointer"
                                value={newRank}
                                onChange={e => setNewRank(e.target.value)}
                                autoFocus
                            >
                                {RANKS.map(r => <option key={r} value={r} className="bg-[#0f172a]">{r}</option>)}
                            </select>
                            <button onClick={() => saveRank(user.id)} className="text-green-400 hover:bg-green-400/20 p-1 rounded"><Check size={14}/></button>
                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:bg-red-400/20 p-1 rounded"><X size={14}/></button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { setEditingId(user.id); setNewRank(user.rank || 'Cadet'); }} 
                            className="text-[10px] uppercase font-bold text-pelican-coral bg-pelican-coral/10 px-2 py-0.5 rounded border border-pelican-coral/20 hover:bg-pelican-coral/20 transition-colors flex items-center gap-1 group/rank"
                            title="Edit Rank"
                        >
                            <Award size={10} />
                            {user.rank || 'Cadet'} 
                            <Edit2 size={8} className="opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                        </button>
                    )}

                    {isNewUser(user.created_at) && (
                        <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-wider animate-pulse">
                            <Sparkles size={10} /> New
                        </span>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                    </p>
                    <p className="text-slate-600 text-xs flex items-center gap-1">
                        <Calendar size={12} /> Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Enrollment Badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {user.enrollments.length === 0 && <span className="text-[10px] text-slate-600 bg-white/5 px-2 rounded border border-white/5">No Enrollments</span>}
                    {user.enrollments.map(e => (
                        <span key={e.id} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 capitalize ${
                            e.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            e.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                            <BookOpen size={8} /> {e.course_id}: {e.status}
                        </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
              <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer"className="p-2 bg-white/5 hover:bg-white hover:text-[#020617] rounded-lg text-slate-400 transition-colors" title="Send Email">
                <Mail size={18} />
              </a>
              <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-colors" title="Delete User">
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
            <p className="text-slate-500">No pilots found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}