import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Megaphone, Trash2, Plus, Bell, X, Users, Filter } from 'lucide-react';

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info', target_group: 'all' });

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    await supabase.from('announcements').insert([formData]);
    setFormData({ title: '', message: '', type: 'info', target_group: 'all' });
    setIsEditing(false);
    fetchItems();
  }

  async function handleDelete(id) {
    if(!confirm("Delete this announcement?")) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchItems();
  }

  async function toggleStatus(id, currentStatus) {
    await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id);
    fetchItems();
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-heading text-white">Broadcast System</h2>
          <p className="text-slate-400 mt-1">Manage targeted notifications.</p>
        </div>
        <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-[#020617] font-bold rounded-xl hover:bg-pelican-coral hover:text-white transition-colors flex items-center gap-2">
          <Plus size={18} /> New Broadcast
        </button>
      </div>

      {isEditing && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex justify-between mb-4">
            <h3 className="text-white font-bold">Compose Message</h3>
            <button onClick={() => setIsEditing(false)}><X className="text-slate-400 hover:text-white" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <select className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="info">Info (Blue)</option>
                    <option value="alert">Alert (Yellow)</option>
                    <option value="success">Success (Green)</option>
                </select>
            </div>
            
            {/* TARGET SELECTION */}
            <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Target Audience</label>
                <select className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white outline-none" value={formData.target_group} onChange={e => setFormData({...formData, target_group: e.target.value})}>
                    <option value="all">All Users (Public)</option>
                    <option value="not_registered">Non-Registered Users (Sales)</option>
                    <option value="registered">All Registered Students</option>
                    <option value="course:aerogenesis">Aerogenesis Students Only</option>
                    <option value="course:mentorship">Mentorship Students Only</option>
                </select>
            </div>

            <textarea rows="3" placeholder="Message content..." className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required />
            <button type="submit" className="px-6 py-2 bg-pelican-coral text-white font-bold rounded-lg hover:bg-white hover:text-[#020617] transition-colors flex items-center gap-2">
                <Bell size={16} /> Broadcast Now
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {list.map(item => (
          <div key={item.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.is_active ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-1 ${item.type === 'alert' ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                    <Megaphone size={20} />
                </div>
                <div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-500 font-normal border border-white/10 px-2 rounded-full">{new Date(item.created_at).toLocaleDateString()}</span>
                        <span className="text-[10px] bg-white/10 text-white px-2 rounded flex items-center gap-1"><Filter size={8} /> Target: {item.target_group}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => toggleStatus(item.id, item.is_active)} className="text-xs font-bold px-3 py-1 rounded border border-white/10 text-slate-400 hover:text-white">{item.is_active ? 'Active' : 'Archived'}</button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}