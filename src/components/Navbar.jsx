import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Linkedin, Send } from 'lucide-react';
import PelicanIcon from './PelicanIcon';
import ChristmasLights from './ui/ChristmasLights'; // Ensure imported

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Login', href: '/signin' },
  { name: 'Apply', href: '/contact', isPrimary: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  return (
    <>
      <nav className={`fixed top-6 left-0 right-0 z-50 transition-all duration-700 animate-slide-down ${scrolled ? 'px-4' : 'px-4 md:px-0'}`}>
        
        {/* WRAPPER */}
        <div className="relative mx-auto max-w-5xl group">
          
          {/* 1. CHRISTMAS LIGHTS (Z-Index 30: On top of the border) */}
          <div className="absolute top-0 left-0 w-full z-30">
             <ChristmasLights />
          </div>

          {/* 2. THE NAVBAR PILL (Z-Index 20) */}
          <div className={`relative z-20 rounded-full p-[1.5px] animate-border-flow bg-gradient-to-r from-transparent via-pelican-coral via-white/50 to-transparent bg-[length:200%_auto] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,111,97,0.3)]`}>
            <div className={`rounded-full bg-[#020617]/90 backdrop-blur-xl h-full w-full ${scrolled ? 'py-2' : 'py-3'}`}>
              <div className="px-6 flex items-center justify-between">
                
                {/* Logo */}
                <a href="/" className="flex items-center space-x-2 group">
                  <div className="text-pelican-coral transition-transform transform group-hover:rotate-12 group-hover:scale-110 duration-300">
                    <PelicanIcon className="w-6 h-6" />
                  </div>
                  <span className="font-heading text-lg text-white tracking-wide group-hover:text-pelican-coral transition-colors">
                    Life of Aviation
                  </span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className={`${
                        link.isPrimary 
                        ? 'px-6 py-2 bg-white text-[#020617] rounded-full hover:bg-pelican-coral hover:text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,111,97,0.4)]' 
                        : 'text-sm text-slate-300 hover:text-white font-medium uppercase tracking-wider hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                      } transition-all duration-300`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                  <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="text-white p-2 hover:text-pelican-coral transition-colors"
                  >
                    {isOpen ? <X /> : <Menu />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Full Screen Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#020617] flex animate-fade-in overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative">
            {navLinks.map((link) => (
                <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={
                    link.isPrimary
                    ? "px-10 py-4 bg-white text-[#020617] rounded-full font-bold text-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform mt-4"
                    : "font-heading text-4xl text-white hover:text-pelican-coral transition-all duration-300 hover:scale-110"
                }
                >
                {link.name}
                </a>
            ))}
          </div>

          <div className="w-24 h-full border-l border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center justify-between py-12">
             <button 
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-pelican-coral hover:text-white transition-all"
             >
                <X size={24} />
             </button>

             <div className="flex flex-col space-y-8">
                <a href="#" className="text-slate-400 hover:text-pelican-coral hover:scale-125 transition-all"><Instagram size={24} /></a>
                <a href="#" className="text-slate-400 hover:text-pelican-coral hover:scale-125 transition-all"><Linkedin size={24} /></a>
                <a href="#" className="text-slate-400 hover:text-pelican-coral hover:scale-125 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
                <a href="https://t.me/" className="text-slate-400 hover:text-pelican-coral hover:scale-125 transition-all"><Send size={24} /></a>
             </div>

             <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-pelican-coral/50"></div>
          </div>
        </div>
      )}
    </>
  );
}