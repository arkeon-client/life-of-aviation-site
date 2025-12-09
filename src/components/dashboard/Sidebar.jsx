import React, { useState } from 'react';
import { Home, BookOpen, Settings, LogOut, Menu, X, User } from 'lucide-react';
import PelicanIcon from '../PelicanIcon';
import { supabase } from '../../lib/supabaseClient';

const menuItems = [
  { name: 'Overview', icon: Home, href: '/dashboard' },
  { name: 'My Courses', icon: BookOpen, href: '/dashboard/courses' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-lg text-white"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#020617] border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          
          {/* Logo Area */}
          <div className="flex items-center space-x-3 mb-12 pl-2">
            <PelicanIcon className="w-8 h-8 text-pelican-coral" />
            <span className="font-heading text-xl text-white tracking-wide">
              Flight Deck
            </span>
            <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-pelican-coral text-white shadow-[0_0_20px_rgba(255,111,97,0.3)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-pelican-coral'} />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="pt-6 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}