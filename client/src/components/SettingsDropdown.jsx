import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiLogOut, FiUserX, FiLink, FiLayout } from 'react-icons/fi';

const THEMES = [
  { name: 'Soft Rose', bg: 'bg-[#fdc3ee]' },
  { name: 'Sage Green', bg: 'bg-[#d8e2dc]' },
  { name: 'Warm Cream', bg: 'bg-[#f4ebd0]' },
  { name: 'Sky Blue', bg: 'bg-[#d7e3fc]' },
];

export default function SettingsDropdown({ 
  user, 
  memberCount, 
  currentTheme, 
  setCurrentTheme, 
  onLogout, 
  onUnsync, 
  onDeleteAccount 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-6 right-6 md:top-8 md:right-12 z-30" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 hover:bg-white px-4 py-2.5 rounded-full border border-stone-200/60 shadow-sm transition cursor-pointer text-stone-700 text-sm font-medium">
        <FiSettings className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        <span>{user?.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-[#FAF7F2] border border-stone-200 rounded-3xl shadow-2xl overflow-hidden py-3 z-40 animate-fade-in">
          <div className="px-5 py-3 border-b border-stone-200/60">
            <p className="text-xs text-stone-400 font-mono">Logged in as</p>
            <p className="text-sm font-semibold text-stone-800">{user?.username}</p>
            {memberCount < 2 && (
              <p className="text-xs text-rose-600 font-mono mt-1">Code: {user?.inviteCode}</p>
            )}
          </div>

          <div className="px-3 py-2 border-b border-stone-200/60">
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
              <FiLayout className="text-xs" /> Board Theme
            </p>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setCurrentTheme(theme.bg)}
                  className={`text-xs px-3 py-1.5 rounded-xl border text-left transition cursor-pointer ${currentTheme === theme.bg ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200/80 hover:border-stone-400'}`}>
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); onUnsync(); }}
              className="w-full px-5 py-2.5 flex items-center gap-2.5 text-stone-600 hover:bg-[#F3EDE2] transition text-xs font-medium cursor-pointer">
              <FiLink className="text-sm" /> Unsync Board
            </button>
            <button
              onClick={() => { setIsOpen(false); onDeleteAccount(); }}
              className="w-full px-5 py-2.5 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition text-xs font-medium cursor-pointer">
              <FiUserX className="text-sm" /> Delete Account
            </button>
            <button
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full px-5 py-2.5 flex items-center gap-2.5 text-stone-600 hover:bg-[#F3EDE2] transition text-xs font-medium cursor-pointer border-t border-stone-200/60 mt-1 pt-2">
              <FiLogOut className="text-sm" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}