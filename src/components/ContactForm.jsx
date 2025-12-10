import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    inquiryType: 'Course Inquiry',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      // Send data to Supabase
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            name: formData.name,
            email: formData.email,
            age: formData.age,
            inquiry_type: formData.inquiryType,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', age: '', inquiryType: 'Course Inquiry', message: '' }); // Reset Form
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);

    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const inputClasses = "w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-pelican-coral focus:ring-1 focus:ring-pelican-coral focus:bg-white/15 outline-none transition-all";
  const labelClasses = "block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider";

  return (
    <div className="relative overflow-hidden bg-white/5 p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
      
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pelican-coral to-transparent opacity-50"></div>

      {/* SUCCESS OVERLAY */}
      {status === 'success' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-md animate-fade-in text-center p-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 border border-green-500/30">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-heading text-white mb-2">Transmission Sent</h3>
          <p className="text-slate-400">
            Copy that. Your message has been logged in the flight deck.
          </p>
          <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-pelican-coral hover:text-white underline">
            Send another message
          </button>
        </div>
      )}

      {/* ERROR OVERLAY */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-md animate-fade-in text-center p-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/30">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-heading text-white mb-2">Transmission Failed</h3>
          <p className="text-slate-400">
            Check your connection and try again.
          </p>
          <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-pelican-coral hover:text-white underline">
            Try Again
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClasses}>Full Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="Capt. Future Pilot"
            required 
            className={inputClasses}
            onChange={handleChange}
            value={formData.name}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>Email Frequency</label>
          <input 
            type="email" 
            name="email" 
            placeholder="hello@example.com"
            required 
            className={inputClasses}
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        {/* Age & Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="age" className={labelClasses}>Age</label>
            <input 
              type="text" 
              name="age" 
              placeholder="18"
              className={inputClasses}
              onChange={handleChange}
              value={formData.age}
            />
          </div>
          <div>
            <label htmlFor="inquiryType" className={labelClasses}>Mission</label>
            <select 
              name="inquiryType"
              className={`${inputClasses} appearance-none cursor-pointer`}
              onChange={handleChange}
              value={formData.inquiryType}
            >
              <optgroup label="Education" className="bg-[#020617] text-gray-400">
                <option className="bg-[#020617] text-white">Course Inquiry</option>
                <option className="bg-[#020617] text-white">Mentorship Program</option>
                <option className="bg-[#020617] text-white">Career Support</option>
              </optgroup>
              <optgroup label="Industry & Business" className="bg-[#020617] text-gray-400">
                <option className="bg-[#020617] text-white">Company Feature / Showcase</option>
                <option className="bg-[#020617] text-white">Content Creation / Video</option>
                <option className="bg-[#020617] text-white">Sponsorship / Partnership</option>
              </optgroup>
              <option className="bg-[#020617] text-white">Other Inquiry</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={labelClasses}>Briefing</label>
          <textarea 
            name="message" 
            rows="4" 
            placeholder="How can we help you reach the skies?"
            className={inputClasses}
            onChange={handleChange}
            value={formData.message}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={status === 'submitting'}
          className="w-full py-4 bg-pelican-coral hover:bg-white hover:text-[#020617] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,111,97,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center group"
        >
          {status === 'submitting' ? (
            <span className="flex items-center">Transmitting <Loader2 className="ml-2 w-5 h-5 animate-spin"/></span>
          ) : (
            <span className="flex items-center">Send Transmission <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
          )}
        </button>
      </form>
    </div>
  );
}