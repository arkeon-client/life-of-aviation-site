import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle, Send, FileText, PlayCircle, Download, XCircle, ExternalLink, RefreshCw, Loader2, List, CreditCard, Home, Globe } from 'lucide-react';
import ActionModal from '../ui/ActionModal';

export default function CourseView({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [activeTab, setActiveTab] = useState('modules');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      setEnrollment(enrollData);

      if (enrollData?.status === 'active') {
        const [modResult, sylResult] = await Promise.all([
            supabase.from('course_materials').select('*').eq('course_id', courseId).order('created_at', { ascending: true }),
            supabase.from('course_syllabus').select('*').eq('course_id', courseId).order('order_index', { ascending: true })
        ]);
        setModules(modResult.data || []);
        setSyllabus(sylResult.data || []);
      }
      setLoading(false);
    }
    init();
  }, [courseId]);

  const handleReapply = async () => {
    setIsModalOpen(false);
    setLoading(true);
    const { error } = await supabase.from('enrollments').update({ status: 'pending' }).eq('id', enrollment.id);
    if (error) { alert("Error: " + error.message); setLoading(false); } 
    else { window.location.reload(); }
  };

  if (loading) return <div className="p-8 text-slate-400 flex items-center gap-3"><Loader2 className="animate-spin text-pelican-coral" /> <span>Accessing secure flight data...</span></div>;

  if (!enrollment) return (
    <div className="p-12 text-center border border-white/10 rounded-3xl bg-white/5 mt-10">
      <h2 className="text-2xl text-white font-bold mb-4">Not Enrolled</h2>
      <a href="/dashboard/courses" className="px-6 py-3 bg-pelican-coral text-white rounded-lg font-bold">Go to Flight Bag</a>
    </div>
  );

  // REJECTED STATE
  if (enrollment.status === 'rejected') return (
    <div className="max-w-2xl mx-auto mt-10 animate-fade-in">
      <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 text-center backdrop-blur-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><XCircle size={40} /></div>
        <h1 className="text-3xl text-white font-heading mb-4">Application Declined</h1>
        <p className="text-red-200 mb-8">Your enrollment was not approved. Please check your payment proof.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl flex items-center justify-center gap-2"><RefreshCw size={18} /> Re-apply Now</button>
           <a href="/contact" className="px-6 py-3 border border-red-500/30 text-red-300 font-bold rounded-xl">Contact Support</a>
        </div>
      </div>
      <ActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleReapply} title="Resubmit Application?" message="Are you sure you want to re-apply?" confirmText="Yes, I am ready" type="danger" />
    </div>
  );

  // PENDING PAYMENT STATE (Updated with Options)
  if (enrollment.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-gradient-to-br from-pelican-coral/10 to-blue-600/5 border border-pelican-coral/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Lock size={120} /></div>
          
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4">Select Your Plan</h1>
          <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
              Please choose your preferred learning method and complete the payment to unlock <span className="text-pelican-coral font-bold capitalize">{courseId}</span>.
          </p>

          {/* PRICING OPTIONS */}
          {courseId === 'aerogenesis' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {/* Option 1: Online */}
                  <div className="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 hover:border-pelican-coral/50 transition-all cursor-default">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 mx-auto"><Globe size={24} /></div>
                      <h3 className="text-xl font-bold text-white mb-2">Online Tutoring</h3>
                      <p className="text-3xl font-heading text-white mb-4">4,000 <span className="text-sm text-slate-400 font-body">Birr</span></p>
                      <p className="text-slate-400 text-xs leading-relaxed">Full access to digital classroom, live sessions, and community.</p>
                  </div>

                  {/* Option 2: Home */}
                  <div className="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 hover:border-pelican-coral/50 transition-all cursor-default">
                      <div className="w-12 h-12 rounded-full bg-pelican-coral/20 text-pelican-coral flex items-center justify-center mb-4 mx-auto"><Home size={24} /></div>
                      <h3 className="text-xl font-bold text-white mb-2">Home-to-Home</h3>
                      <p className="text-3xl font-heading text-white mb-4">10,000 <span className="text-sm text-slate-400 font-body">Birr</span></p>
                      <p className="text-slate-400 text-xs leading-relaxed">In-person private tutoring at your location + full digital access.</p>
                  </div>
              </div>
          ) : (
              // Mentorship Pricing
              <div className="bg-[#020617]/80 border border-white/10 rounded-2xl p-6 mb-12 max-w-sm mx-auto">
                  <h3 className="text-xl font-bold text-white mb-2">Standard Access</h3>
                  <p className="text-3xl font-heading text-white mb-2">2,000 <span className="text-sm text-slate-400 font-body">Birr</span></p>
              </div>
          )}

          <h3 className="text-white font-bold mb-6 text-xl">Payment Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">Telebirr</h4><p className="text-pelican-coral font-mono font-bold">0991 882 942</p></div>
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">CBE</h4><p className="text-pelican-coral font-mono font-bold">1000548442285</p></div>
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">Amhara Bank</h4><p className="text-pelican-coral font-mono font-bold">9900026458653</p></div>
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">Abay Bank</h4><p className="text-pelican-coral font-mono font-bold">1191011165601913</p></div>
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">Bank of Abyssinia</h4><p className="text-pelican-coral font-mono font-bold">18461773</p></div>
            <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/10"><h4 className="text-white font-bold text-sm">Dashen Bank</h4><p className="text-pelican-coral font-mono font-bold">5031530930011</p></div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-2">Verify Payment</h3>
            <p className="text-slate-400 text-sm mb-6">Send your payment receipt and mention which plan (Online/Home) you paid for.</p>
            <a href="https://t.me/lifeofaviation" target="_blank" className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg">
              <Send size={18} className="mr-2" /> Send Proof on Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE STATE (Same as before)
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-400 mb-2 bg-green-500/10 px-3 py-1 rounded-full w-fit border border-green-500/20">
            <CheckCircle size={14} /> <span className="text-xs font-bold uppercase tracking-widest">Enrollment Active</span>
          </div>
          <h1 className="text-4xl font-heading text-white capitalize">{courseId}</h1>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-lg">
            <button onClick={() => setActiveTab('modules')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'modules' ? 'bg-pelican-coral text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <FileText size={16} /> Resources
            </button>
            <button onClick={() => setActiveTab('syllabus')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'syllabus' ? 'bg-pelican-coral text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <List size={16} /> Syllabus
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === 'modules' && (
            <>
                <h3 className="text-xl text-white font-bold mb-4">Course Materials</h3>
                {modules.length === 0 && <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center bg-white/5 text-slate-500">No materials yet.</div>}
                {modules.map((module) => (
                    <a key={module.id} href={module.file_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-pelican-coral/50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-[#020617] border border-white/5 flex items-center justify-center text-pelican-coral">
                        {module.type === 'video' ? <PlayCircle size={24} /> : module.type === 'link' ? <ExternalLink size={24} /> : <FileText size={24} />}
                        </div>
                        <div><h4 className="text-white font-bold text-lg group-hover:text-pelican-coral transition-colors">{module.title}</h4><span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{module.type}</span></div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-pelican-coral transition-all"><Download size={20} /></div>
                    </a>
                ))}
            </>
          )}

          {activeTab === 'syllabus' && (
            <>
                <h3 className="text-xl text-white font-bold mb-4">Curriculum</h3>
                <div className="space-y-4">
                    {syllabus.length > 0 ? (
                        syllabus.map((topic) => (
                            <div key={topic.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                                <span className="text-xs font-bold text-pelican-coral uppercase tracking-widest block mb-1">{topic.week_label}</span>
                                <h4 className="text-white font-bold text-lg mb-2">{topic.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{topic.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-slate-500 border border-dashed border-white/10 rounded-xl">
                            Syllabus details available from instructor.
                        </div>
                    )}
                </div>
            </>
          )}

        </div>

        <div className="space-y-6">
          <div className="bg-[#020617]/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Instructor</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden border-2 border-white/10">
                <img src="/images/abel.jpg" alt="Abel" className="w-full h-full object-cover" />
              </div>
              <div>
                {/* FOUNDER TITLE: YOU CAN CHANGE 'CAPTAIN' HERE IF NEEDED */}
                <p className="text-base text-white font-bold">Founder & Aviation Expert</p>
                <p className="text-xs text-pelican-coral font-bold uppercase tracking-wide">Senior Instructor</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><Lock size={16}/> Student Notice</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Materials are for personal use only. Sharing prohibited.</p>
          </div>
        </div>

      </div>
    </div>
  );
}