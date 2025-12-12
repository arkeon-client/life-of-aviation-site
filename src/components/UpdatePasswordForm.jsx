import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Ensure we are in a valid session (The email link does this automatically)
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is here to reset password
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const password = formData.get('password');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-8 bg-[#020617]/80 border border-green-500/30 rounded-3xl animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Updated</h2>
        <p className="text-slate-400">Redirecting to flight deck...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-[#020617]/80 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl text-white mb-2">Set New Password</h2>
          <p className="text-slate-400 text-sm">Secure your account with a new access code.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pelican-coral transition-colors w-5 h-5" />
            <input 
                type="password" 
                name="password" 
                placeholder="New Password" 
                required 
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-pelican-coral focus:ring-1 focus:ring-pelican-coral outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}