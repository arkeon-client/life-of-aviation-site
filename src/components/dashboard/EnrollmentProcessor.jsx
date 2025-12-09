import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function EnrollmentProcessor({ courseId }) {
  const [status, setStatus] = useState('loading'); // loading, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function process() {
      try {
        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = '/signin';
          return;
        }

        // 2. Check existing enrollment
        const { data: existing, error: fetchError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle(); // Use maybeSingle to avoid 406 error if none found

        if (fetchError) throw fetchError;

        if (existing) {
          // Already enrolled? Go to course page
          window.location.href = `/dashboard/course/${courseId}`;
          return;
        }

        // 3. Create new enrollment
        const { error: insertError } = await supabase
          .from('enrollments')
          .insert([
            {
              user_id: user.id,
              user_email: user.email,
              user_name: user.user_metadata?.full_name || 'Cadet',
              course_id: courseId,
              status: 'pending'
            }
          ]);

        if (insertError) throw insertError;

        // Success -> Redirect
        window.location.href = `/dashboard/course/${courseId}`;

      } catch (err) {
        console.error('Enrollment Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to connect to Flight Operations.');
      }
    }

    process();
  }, [courseId]);

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Enrollment Failed</h3>
        <p className="text-red-200 text-sm mb-6">{errorMessage}</p>
        <a href="/dashboard/courses" className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
          Return to Catalog
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
        <Loader2 size={48} className="text-pelican-coral animate-spin" />
        <h2 className="text-2xl text-white font-heading">Initializing Enrollment...</h2>
        <p className="text-slate-400">Contacting Flight Operations...</p>
      </div>
    </div>
  );
}