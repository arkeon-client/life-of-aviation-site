import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Upload, FileText, Trash2, Loader2, Video, Link as LinkIcon, Plus } from 'lucide-react';
import GlassModal from '../ui/ActionModal'; // Import Modal

const COURSES = [
  { id: 'aerogenesis', label: 'Aerogenesis' },
  { id: 'mentorship', label: 'Mentorship' }
];

export default function AdminCourseManager() {
  const [selectedCourse, setSelectedCourse] = useState('aerogenesis');
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse]);

  async function fetchMaterials() {
    const { data } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', selectedCourse)
      .order('created_at', { ascending: true });
    setMaterials(data || []);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploading(true);

    try {
      let finalUrl = '';

      if (type === 'link') {
        finalUrl = externalLink;
      } else {
        if (!file) throw new Error('Please select a file');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedCourse}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(fileName);
        
        finalUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('course_materials')
        .insert([{
          course_id: selectedCourse,
          title: title,
          type: type,
          file_url: finalUrl
        }]);

      if (dbError) throw dbError;

      setTitle('');
      setFile(null);
      setExternalLink('');
      fetchMaterials();
      
      // Success Modal
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Upload Complete',
        message: 'The new module has been deployed to the classroom successfully.',
        onConfirm: null
      });

    } catch (err) {
      console.error(err);
      // Error Modal
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: err.message,
        onConfirm: null
      });
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete(id) {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Material?',
      message: 'This action cannot be undone. The file will be removed from the classroom.',
      onConfirm: () => performDelete(id)
    });
  }

  async function performDelete(id) {
    await supabase.from('course_materials').delete().eq('id', id);
    fetchMaterials();
  }

  return (
    <div className="mt-8">
      <GlassModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onConfirm={modal.onConfirm} 
      />

      <h2 className="text-2xl font-heading text-white mb-6">Course Content Manager</h2>

      <div className="flex gap-4 mb-8">
        {COURSES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourse(c.id)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedCourse === c.id ? 'bg-pelican-coral text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-pelican-coral" /> Add New Material
          </h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Module Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none"
                placeholder="e.g., Module 1: Aerodynamics"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Material Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white outline-none"
              >
                <option value="pdf">Document (PDF)</option>
                <option value="video">Video File</option>
                <option value="link">External Link (Zoom/Youtube)</option>
              </select>
            </div>

            {type === 'link' ? (
              <div>
                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">URL</label>
                <input 
                  type="url" 
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none"
                  placeholder="https://..."
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Upload File</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-pelican-coral transition-all"
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full py-3 bg-white text-[#020617] font-bold rounded-lg hover:bg-pelican-coral hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
              Upload to Class
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h3 className="text-white font-bold mb-4">Current Modules ({materials.length})</h3>
          {materials.length === 0 && <p className="text-slate-500 text-sm">No materials yet.</p>}
          
          {materials.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#020617] flex items-center justify-center text-pelican-coral">
                  {m.type === 'video' ? <Video size={18} /> : m.type === 'link' ? <LinkIcon size={18} /> : <FileText size={18} />}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{m.title}</h4>
                  <span className="text-xs text-slate-500 uppercase">{m.type}</span>
                </div>
              </div>
              <button 
                onClick={() => confirmDelete(m.id)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}