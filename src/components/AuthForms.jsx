import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, Loader2, ArrowRight, AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';

export default function AuthForm({ type = 'login' }) {
  // view state: 'login', 'signup', 'forgot'
  const [view, setView] = useState(type === 'signup' ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // AUTOFILL FIX: Grab values directly from the form event
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');

    try {
      // 1. FORGOT PASSWORD LOGIC
      if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        setSuccess('Recovery link sent! Check your email to reset your password.');
      } 
      
      // 2. SIGN UP LOGIC
      else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + '/signin',
          },
        });
        if (error) throw error;
        setSuccess('Registration successful! Please check your email to confirm.');
      } 
      
      // 3. LOGIN LOGIC
      else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/dashboard'; 
      }

    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-pelican-coral focus:ring-1 focus:ring-pelican-coral outline-none transition-all";

  // SUCCESS VIEW
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="bg-[#020617]/90 border border-pelican-coral/50 rounded-3xl p-10 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="font-heading text-3xl text-white mb-4">Transmission Sent</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">{success}</p>
          <button onClick={() => { setSuccess(null); setView('login'); }} className="block w-full py-4 bg-pelican-coral text-white font-bold rounded-xl hover:bg-white hover:text-[#020617] transition-all">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-[#020617]/80 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pelican-coral to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl text-white mb-2">
            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Join the Corps' : 'Account Recovery'}
          </h2>
          <p className="text-slate-400 text-sm">
            {view === 'login' ? 'Enter your credentials to access the flight deck.' : 
             view === 'signup' ? 'Start your journey to aviation excellence.' :
             'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3 animate-pulse">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* Full Name (Sign Up Only) */}
          {view === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pelican-coral transition-colors w-5 h-5" />
              <input type="text" name="fullName" placeholder="Full Name" required className={inputClasses} />
            </div>
          )}

          {/* Email (All Views) */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pelican-coral transition-colors w-5 h-5" />
            <input type="email" name="email" placeholder="Email Address" required className={inputClasses} />
          </div>

          {/* Password (Login & Signup Only) */}
          {view !== 'forgot' && (
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pelican-coral transition-colors w-5 h-5" />
              <input type="password" name="password" placeholder="Password" required className={inputClasses} />
            </div>
          )}

          {/* Forgot Password Link */}
          {view === 'login' && (
            <div className="text-right">
              <button type="button" onClick={() => setView('forgot')} className="text-xs text-slate-400 hover:text-pelican-coral transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-xl transition-all shadow-lg shadow-pelican-coral/20 flex items-center justify-center group mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Recovery Link'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          {view === 'login' ? (
            <p className="text-slate-400 text-sm">
              Don't have an account? <button onClick={() => setView('signup')} className="text-pelican-coral hover:text-white font-bold transition-colors">Apply Now</button>
            </p>
          ) : (
            <p className="text-slate-400 text-sm">
              Remember your credentials? <button onClick={() => setView('login')} className="text-pelican-coral hover:text-white font-bold transition-colors">Sign In</button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}