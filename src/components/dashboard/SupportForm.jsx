import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send, Loader2, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SupportForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form State
  const [subject, setSubject] = useState('Course Access Issue');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            name: user.user_metadata?.full_name || 'Registered Student',
            email: user.email,
            age: 'N/A', // Not needed for support
            inquiry_type: `Support: ${subject}`,
            message: message
          }
        ]);

      if (error) throw error;
      setSuccess(true);
      setMessage('');
    } catch (err) {
      alert('Error sending message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#020617] border border-green-500/30 rounded-2xl p-10 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ticket Received</h3>
        <p className="text-slate-400 mb-6">Our support team has received your message. We will contact you via email shortly.</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            Send New Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
      <h3 className="text-xl font-heading text-white mb-6 flex items-center gap-2">
        <MessageCircle className="text-pelican-coral" /> Create Support Ticket
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Issue Type</label>
            <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-pelican-coral cursor-pointer"
            >
                <option>Course Access Issue</option>
                <option>Payment Verification</option>
                <option>Technical Bug</option>
                <option>Account Settings</option>
                <option>Other Inquiry</option>
            </select>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message</label>
            <textarea 
                rows="5" 
                placeholder="Describe your issue in detail..." 
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-pelican-coral"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
            />
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-pelican-coral/20"
        >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            Submit Ticket
        </button>
      </form>
    </div>
  );
}