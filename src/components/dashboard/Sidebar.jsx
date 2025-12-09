import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Settings, LogOut, Menu, X, ShieldAlert, Users, FileText, Inbox } from 'lucide-react';
import PelicanIcon from '../PelicanIcon';
import { supabase } from '../../lib/supabaseClient';
import { ADMIN_EMAILS } from '../../lib/constants'; // Updated import

const menuItems = [
  { name: 'Overview', icon: Home, href: '/dashboard' },
  { name: 'My Courses', icon: BookOpen, href: '/dashboard/courses' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const adminItems = [
  { name: 'Command Center', icon: Inbox, href: '/admin/dashboard' },
  { name: 'Enrollments', icon: FileText, href: '/admin/enrollments' },
  { name: 'Course Manager', icon: BookOpen, href: '/admin/courses' },
  { name: 'User Manager', icon: Users, href: '/admin/users' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentPath(window.location.pathname);
    
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      // UPDATED LOGIC: Check if email is in the array
      if (user && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-lg text-white">
        <Menu size={24} />
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#020617] border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center space-x-3 mb-8 pl-2">
            <PelicanIcon className="w-8 h-8 text-pelican-coral" />
            <span className="font-heading text-xl text-white tracking-wide">Flight Deck</span>
            <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-slate-400"><X size={24} /></button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            {/* Student Menu */}
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">Student</p>
            {menuItems.map((item) => (
              <a key={item.name} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentPath === item.href ? 'bg-pelican-coral text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}

            {/* Admin Menu */}
            {isAdmin && (
              <>
                <p className="px-4 text-xs font-bold text-red-400 uppercase tracking-widest mt-8 mb-2 flex items-center gap-2">
                  <ShieldAlert size={12} /> Admin Control
                </p>
                {adminItems.map((item) => (
                  <a key={item.name} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentPath === item.href ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:bg-red-500/5 hover:text-red-400'}`}>
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </a>
                ))}
              </>
            )}
          </nav>

          <div className="pt-6 border-t border-white/5">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}