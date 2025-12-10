import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SpotlightCard from '../ui/SpotlightCard';
import { BookOpen, Lock, ArrowRight, CheckCircle, Clock, Home, Globe } from 'lucide-react';

const COURSES = [
  {
    id: 'aerogenesis',
    title: 'Aerogenesis',
    description: 'The foundational course for aspiring aviators. Comprehensive training covering history, physics, systems, and operations.',
    // We use a custom 'pricing' object instead of a string for flexibility
    pricing: [
      { type: 'Online', price: '4,000 Birr', icon: Globe },
      { type: 'Home-to-Home', price: '10,000 Birr', icon: Home }
    ],
    image: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mentorship',
    title: 'Career Mentorship',
    description: 'One-on-one guidance with Captain Abel to navigate your aviation career path.',
    pricing: [
      { type: 'Standard', price: '2,000 Birr', icon: BookOpen }
    ],
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function CourseCatalog() {
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('enrollments')
          .select('course_id, status')
          .eq('user_id', user.id);
        
        const statusMap = {};
        if (data) {
          data.forEach(item => {
            statusMap[item.course_id] = item.status;
          });
        }
        setEnrollments(statusMap);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400">Loading catalog...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {COURSES.map((course) => {
        const status = enrollments[course.id] || 'not_enrolled'; 
        
        return (
          <div key={course.id} className="h-full">
            <SpotlightCard className="bg-white/5 border border-white/10 p-0 overflow-hidden flex flex-col h-full group transition-all duration-300 hover:border-pelican-coral/30">
              
              <div className="h-48 relative overflow-hidden bg-[#020617]">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                
                <div className="absolute top-4 right-4">
                  {status === 'active' && (
                     <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full border border-green-500/30 backdrop-blur-md flex items-center gap-2">
                       <CheckCircle size={12} /> Active
                     </span>
                  )}
                  {status === 'pending' && (
                     <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-full border border-yellow-500/30 backdrop-blur-md flex items-center gap-2">
                       <Clock size={12} /> Pending
                     </span>
                  )}
                  {status === 'not_enrolled' && (
                     <span className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                       <Lock size={12} /> Locked
                     </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-2xl font-heading text-white">{course.title}</h3>
                </div>
                
                <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">{course.description}</p>
                
                {/* DYNAMIC PRICING DISPLAY */}
                {status === 'not_enrolled' && (
                    <div className="mb-6 space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                        {course.pricing.map((option, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-slate-400">
                                    <option.icon size={14} className="text-pelican-coral"/> {option.type}
                                </span>
                                <span className="font-bold text-white">{option.price}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                {status === 'active' ? (
                  <a href={`/dashboard/course/${course.id}`} className="w-full py-3 bg-white text-[#020617] font-bold rounded-lg hover:bg-pelican-coral hover:text-white transition-colors text-center">
                    Enter Classroom
                  </a>
                ) : status === 'pending' ? (
                  <a href={`/dashboard/course/${course.id}`} className="w-full py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500 hover:text-[#020617] transition-all text-center">
                    Complete Payment
                  </a>
                ) : (
                  <a href={`/dashboard/enroll/${course.id}`} className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white hover:text-[#020617] transition-all text-center flex items-center justify-center gap-2 group/btn">
                    Enroll Now <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                  </a>
                )}
              </div>

            </SpotlightCard>
          </div>
        );
      })}
    </div>
  );
}