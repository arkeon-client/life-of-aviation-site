import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Plus, Trash2, Edit2, Image as ImageIcon, Save, X, Eye } from 'lucide-react';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList } from 'react-simple-wysiwyg';

export default function AdminBlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    author: 'Abel'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const slugToUse = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = {
        title: formData.title,
        slug: slugToUse,
        description: formData.description,
        content: formData.content,
        image_url: formData.image_url,
        author: formData.author
      };

      if (formData.id) {
        await supabase.from('blog_posts').update(payload).eq('id', formData.id);
      } else {
        await supabase.from('blog_posts').insert([payload]);
      }
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      alert('Error saving post: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  }

  function openEditor(post = null) {
    if (post) {
        // Ensure content is never null to prevent editor crash
        setFormData({ ...post, content: post.content || '' });
    } else {
        setFormData({ id: null, title: '', slug: '', description: '', content: '', image_url: '', author: 'Abel' });
    }
    setIsEditing(true);
  }

  if (loading) return <div className="text-slate-400 p-8 flex items-center gap-2"><Loader2 className="animate-spin text-pelican-coral"/> Loading Archives...</div>;

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading text-white">{formData.id ? 'Edit Post' : 'New Transmission'}</h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
              <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Slug</label>
              <input type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-slate-300 focus:border-pelican-coral outline-none" placeholder="Auto-generated" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
            <textarea rows="2" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white focus:border-pelican-coral outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              {formData.image_url && <img src={formData.image_url} alt="Cover" className="w-20 h-20 object-cover rounded-lg border border-white/10" />}
              <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2"><ImageIcon size={16} /> {uploading ? 'Uploading...' : 'Upload Image'} <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" /></label>
            </div>
          </div>

          {/* LIGHTWEIGHT WYSIWYG EDITOR */}
          <div className="text-black">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Content</label>
            <div className="bg-white rounded-lg overflow-hidden border border-white/10">
                <EditorProvider>
                  <Editor 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    style={{ minHeight: '300px', backgroundColor: 'white', color: 'black' }}
                  >
                    <Toolbar>
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <BtnBulletList />
                      <BtnNumberedList />
                      <BtnLink />
                    </Toolbar>
                  </Editor>
                </EditorProvider>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={uploading} className="px-8 py-3 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-xl transition-colors flex items-center gap-2"><Save size={18} /> {uploading ? 'Saving...' : 'Publish Post'}</button>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div><h2 className="text-3xl font-heading text-white">Blog Manager</h2><p className="text-slate-400 mt-1">Total Posts: {posts.length}</p></div>
        <button onClick={() => openEditor()} className="px-6 py-3 bg-white text-[#020617] font-bold rounded-xl hover:bg-pelican-coral hover:text-white transition-colors flex items-center gap-2"><Plus size={18} /> New Post</button>
      </div>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-pelican-coral/30 transition-colors">
            <div className="flex items-center gap-6 w-full">
              <div className="w-24 h-16 bg-[#020617] rounded-lg overflow-hidden shrink-0 border border-white/5">
                {post.image_url ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={20} /></div>}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">{post.title}</h3>
                <div className="flex gap-4 mt-2 text-xs text-slate-400"><span>{new Date(post.created_at).toLocaleDateString()}</span><span>By {post.author}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`/blog/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-400"><Eye size={18} /></a>
              <button onClick={() => openEditor(post)} className="p-2 text-slate-400 hover:text-white"><Edit2 size={18} /></button>
              <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}