import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle, Send, FileText, PlayCircle, Download, XCircle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import ActionModal from '../ui/ActionModal'; // Ensure you created this file in the previous step

export default function CourseView({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  
  // State for the Confirmation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Enrollment Status AND Course Modules
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Check Enrollment Status
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      setEnrollment(enrollData);

      // 2. If Active, Fetch Modules
      if (enrollData?.status === 'active') {
        const { data: modData } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: true });
        setModules(modData || []);
      }

      setLoading(false);
    }
    init();
  }, [courseId]);

  // Handle Re-application Logic
  const handleReapply = async () => {
    setIsModalOpen(false); // Close the modal
    setLoading(true); // Show loading spinner
    
    // Update status back to pending
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'pending' })
      .eq('id', enrollment.id);

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      // Reload page to show Pending Payment screen
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <Loader2 className="animate-spin text-pelican-coral" /> 
        <span>Accessing secure flight data...</span>
      </div>
    );
  }

  // SCENARIO 1: NOT FOUND (User somehow got here without enrolling)
  if (!enrollment) {
    return (
      <div className="p-12 text-center border border-white/10 rounded-3xl bg-white/5 mt-10">
        <h2 className="text-2xl text-white font-bold mb-4">Not Enrolled</h2>
        <p className="text-slate-400 mb-6">You do not have access to this flight path yet.</p>
        <a href="/dashboard/courses" className="px-6 py-3 bg-pelican-coral text-white rounded-lg font-bold hover:bg-white hover:text-[#020617] transition-colors">
          Go to Flight Bag
        </a>
      </div>
    );
  }

  // SCENARIO 2: REJECTED (With Modal Trigger)
  if (enrollment.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-10 animate-fade-in">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 text-center backdrop-blur-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
             <XCircle size={40} />
          </div>
          <h1 className="text-3xl text-white font-heading mb-4">Application Declined</h1>
          <p className="text-red-200 mb-8 leading-relaxed">
            Your enrollment for this course was not approved. This usually happens if the payment proof was invalid, unclear, or if the course cohort is full.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             {/* Open Modal on Click */}
             <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
             >
                <RefreshCw size={18} /> Re-apply Now
             </button>
             <a 
                href="/contact" 
                className="px-6 py-3 border border-red-500/30 text-red-300 font-bold rounded-xl hover:text-white hover:border-white transition-colors"
             >
                Contact Support
             </a>
          </div>
        </div>

        {/* The Branded Modal Component */}
        <ActionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleReapply}
          title="Resubmit Application?"
          message="Are you sure you want to re-apply? Please ensure you have valid payment proof ready to send to the Admin via Telegram."
          confirmText="Yes, I am ready"
          type="danger" 
        />
      </div>
    );
  }

  // SCENARIO 3: PENDING PAYMENT
  if (enrollment.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="bg-gradient-to-br from-pelican-coral/10 to-blue-600/5 border border-pelican-coral/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden backdrop-blur-md">
          
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Lock size={120} />
          </div>

          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4">Payment Required</h1>
          <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
            To unlock the classroom for <span className="text-pelican-coral font-bold capitalize">{courseId}</span>, please complete the enrollment fee.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            {/* Bank Info */}
            <div className="bg-[#020617]/50 p-6 rounded-xl border border-white/10 hover:border-pelican-coral/50 transition-colors">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs mr-3 font-bold">1</span> 
                Bank Transfer
              </h3>
              <p className="text-slate-400 text-sm mb-1">Commercial Bank of Ethiopia (CBE)</p>
              <p className="text-white font-mono text-xl tracking-wider font-bold">1000123456789</p>
              <p className="text-slate-500 text-xs mt-2">Acct Name: Life of Aviation</p>
            </div>
            
            {/* Telebirr Info */}
            <div className="bg-[#020617]/50 p-6 rounded-xl border border-white/10 hover:border-pelican-coral/50 transition-colors">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs mr-3 font-bold">2</span> 
                Telebirr
              </h3>
              <p className="text-slate-400 text-sm mb-1">Merchant ID / Mobile</p>
              <p className="text-white font-mono text-xl tracking-wider font-bold">+251 911 234 567</p>
              <p className="text-slate-500 text-xs mt-2">Abel - Pilot</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-2">Step 3: Verify Payment</h3>
            <p className="text-slate-400 text-sm mb-6">
              Send a screenshot of your transaction to our Admin via Telegram. Your course will be unlocked immediately after verification.
            </p>
            <a 
              href="https://t.me/" 
              target="_blank" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <Send size={18} className="mr-2" /> Send Proof on Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  // SCENARIO 4: ACTIVE (CLASSROOM)
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Classroom Header */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-400 mb-2 bg-green-500/10 px-3 py-1 rounded-full w-fit border border-green-500/20">
            <CheckCircle size={14} /> <span className="text-xs font-bold uppercase tracking-widest">Enrollment Active</span>
          </div>
          <h1 className="text-4xl font-heading text-white capitalize">{courseId}</h1>
        </div>
        <div className="hidden md:block text-slate-500 text-sm font-mono bg-white/5 px-3 py-1 rounded">
          ID: {courseId.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content List (Modules) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl text-white font-bold mb-4">Course Modules</h3>
          
          {modules.length === 0 && (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center flex flex-col items-center justify-center bg-white/5">
              <FileText className="text-slate-600 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No materials uploaded yet.</p>
              <p className="text-slate-600 text-sm mt-1">Your instructor is preparing the flight plan.</p>
            </div>
          )}

          {modules.map((module) => (
            <a 
              key={module.id} 
              href={module.file_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-pelican-coral/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#020617] border border-white/5 flex items-center justify-center text-pelican-coral group-hover:scale-110 transition-transform">
                  {module.type === 'video' ? <PlayCircle size={24} /> : module.type === 'link' ? <ExternalLink size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg group-hover:text-pelican-coral transition-colors">{module.title}</h4>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{module.type}</span>
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-pelican-coral transition-all">
                {module.type === 'link' ? <ExternalLink size={20} /> : <Download size={20} />}
              </div>
            </a>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#020617]/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Instructor</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden border-2 border-white/10">
                <img src="/images/abel.jpg" alt="Abel" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-base text-white font-bold">Captain Abel</p>
                <p className="text-xs text-pelican-coral font-bold uppercase tracking-wide">Senior Instructor</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-slate-400 text-sm italic">"Precision is not an act, it is a habit."</p>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><Lock size={16}/> Student Notice</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              These materials are for your personal use only. Sharing them with unauthorized personnel is strictly prohibited.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}