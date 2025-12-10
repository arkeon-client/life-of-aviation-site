import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, Save, Loader2, List, GripVertical } from 'lucide-react';

const COURSES = [
  { id: 'aerogenesis', label: 'Aerogenesis' },
  { id: 'mentorship', label: 'Mentorship' }
];

export default function AdminSyllabusManager() {
  const [selectedCourse, setSelectedCourse] = useState('aerogenesis');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({ week_label: '', title: '', description: '', order_index: 0 });

  useEffect(() => {
    fetchSyllabus();
  }, [selectedCourse]);

  async function fetchSyllabus() {
    setLoading(true);
    const { data } = await supabase
      .from('course_syllabus')
      .select('*')
      .eq('course_id', selectedCourse)
      .order('order_index', { ascending: true });
    setItems(data || []);
    setLoading(false);
    // Auto-set next order index
    setFormData(prev => ({ ...prev, order_index: (data?.length || 0) + 1 }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const { error } = await supabase.from('course_syllabus').insert([{ ...formData, course_id: selectedCourse }]);
    if (error) alert(error.message);
    else {
      setFormData({ week_label: '', title: '', description: '', order_index: items.length + 2 });
      fetchSyllabus();
    }
  }

  async function handleDelete(id) {
    if(!confirm("Delete this topic?")) return;
    await supabase.from('course_syllabus').delete().eq('id', id);
    fetchSyllabus();
  }

  return (
    <div className="mt-12 pt-12 border-t border-white/5">
      <h2 className="text-2xl font-heading text-white mb-6 flex items-center gap-2">
        <List className="text-pelican-coral" /> Syllabus Curriculum
      </h2>

      {/* Course Selector */}
      <div className="flex gap-4 mb-8">
        {COURSES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourse(c.id)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedCourse === c.id ? 'bg-white text-[#020617]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD FORM */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
          <h3 className="text-white font-bold mb-4">Add Topic</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input 
                    type="text" 
                    placeholder="Label (e.g. Week 1)" 
                    className="bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-pelican-coral"
                    value={formData.week_label}
                    onChange={e => setFormData({...formData, week_label: e.target.value})}
                    required
                />
                <input 
                    type="number" 
                    placeholder="Order" 
                    className="bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-pelican-coral"
                    value={formData.order_index}
                    onChange={e => setFormData({...formData, order_index: e.target.value})}
                    required
                />
            </div>
            <input 
                type="text" 
                placeholder="Topic Title" 
                className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-pelican-coral"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
            />
            <textarea 
                rows="3" 
                placeholder="Description..." 
                className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-pelican-coral"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <button type="submit" className="w-full py-3 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Add to Syllabus
            </button>
          </form>
        </div>

        {/* LIST VIEW */}
        <div className="lg:col-span-2 space-y-3">
            {loading ? <div className="text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin"/> Loading...</div> : 
             items.length === 0 ? <div className="text-slate-500 border border-dashed border-white/10 p-8 text-center rounded-xl">No syllabus topics yet.</div> :
             items.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 group hover:border-pelican-coral/30 transition-colors">
                    <div className="text-slate-600"><GripVertical size={16} /></div>
                    <div className="bg-[#020617] px-3 py-1 rounded text-xs font-bold text-pelican-coral border border-white/5 w-20 text-center shrink-0">
                        {item.week_label}
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-white font-bold text-sm">{item.title}</h4>
                        <p className="text-slate-400 text-xs line-clamp-1">{item.description}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
             ))
            }
        </div>

      </div>
    </div>
  );
}