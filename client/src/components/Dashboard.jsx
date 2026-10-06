import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FiHeart, FiGrid, FiCompass, FiMessageSquare, FiBriefcase, FiBookOpen, FiMoon } from 'react-icons/fi';
import { MdOutlineFreeBreakfast } from "react-icons/md";
import PixelCanvas from './PixelCanvas';
import MessageBoard from './MessageBoard';
import SettingsDropdown from './SettingsDropdown';
import TimeCard from './TimeCard';
import ProfileModal from './ProfileModal';
import RoutineScheduler from './RoutineScheduler';

dayjs.extend(utc);
dayjs.extend(timezone);

const statusOptions = [
  { label: 'Free to Call', icon: <MdOutlineFreeBreakfast className="text-emerald-700/70 text-lg" /> },
  { label: 'At Work', icon: <FiBriefcase className="text-amber-700/70 text-lg" /> },
  { label: 'Studying', icon: <FiBookOpen className="text-rose-700/70 text-lg" /> },
  { label: 'Sleeping', icon: <FiMoon className="text-indigo-700/70 text-lg" /> },
];

export default function Dashboard({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [partner, setPartner] = useState(null);
  
  const [myStatus, setMyStatus] = useState('Free to Call');
  const [partnerStatus] = useState('Sleeping');
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [currentTheme, setCurrentTheme] = useState('bg-[#fdc3ee]');
  const [activeTab, setActiveTab] = useState('board');
  const [memberCount, setMemberCount] = useState(1);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoutinesOpen, setIsRoutinesOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch board members / partner info
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.boardId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/boards/${user.boardId}/members`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMemberCount(data.length);
          const foundPartner = data.find(m => m.id !== user.userId);
          setPartner(foundPartner || null);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();
    const interval = setInterval(fetchMembers, 5000);
    return () => clearInterval(interval);
  }, [user?.boardId, user?.userId]);

  // Fetch latest user info on mount to persist nickname/timezone across reloads
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUserId = user?.userId || user?.id;
      if (!currentUserId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${currentUserId}`);
        const data = await res.json();
        if (data && !data.error) {
          setUser(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to fetch latest user profile:', err);
      }
    };
    fetchUserData();
  }, []);

  const myTimezone = user?.timezone || dayjs.tz.guess();
  const partnerTimezone = partner?.timezone || 'Europe/London';

  // Routine Status Checker
  useEffect(() => {
    if (!user?.userId) return;

    const checkRoutines = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/routines/${user.userId}`);
        const routines = await res.json();
        
        if (!Array.isArray(routines) || routines.length === 0) return;

        const userTime = currentTime.tz(myTimezone);
        const currentDay = userTime.day(); // 0 = Sun, 1 = Mon...
        const currentTimeStr = userTime.format('HH:mm'); // e.g. "14:30"

        const matchingRoutine = routines.find(routine => {
          let days = routine.days_of_week;
          if (typeof days === 'string') {
            try { days = JSON.parse(days); } catch (e) { days = days.split(',').map(Number); }
          }

          if (!Array.isArray(days) || !days.includes(currentDay)) return false;

          const start = routine.start_time ? routine.start_time.slice(0, 5) : '';
          const end = routine.end_time ? routine.end_time.slice(0, 5) : '';

          return currentTimeStr >= start && currentTimeStr <= end;
        });

        if (matchingRoutine && matchingRoutine.status_label !== myStatus) {
          setMyStatus(matchingRoutine.status_label);
        }
      } catch (err) {
        console.error('Failed to check routines:', err);
      }
    };

    checkRoutines();
    const routineInterval = setInterval(checkRoutines, 10000);
    return () => clearInterval(routineInterval);
  }, [user?.userId, currentTime, myStatus, myTimezone]);

  const handleUnsyncBoard = async () => {
    if (!window.confirm('Are you sure you want to unsync from this board?')) return;
    alert('Unsync functionality ready to connect to backend!');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: This will permanently delete your account. Are you sure?')) return;
    alert('Delete account functionality ready to connect to backend!');
  };

  const currentStatusObj = statusOptions.find(s => s.label === myStatus) || statusOptions[0];
  const partnerStatusObj = statusOptions.find(s => s.label === partnerStatus) || statusOptions[3];

  return (
    <div className={`min-h-screen ${currentTheme} text-stone-700 p-8 md:p-16 font-sans transition-colors duration-500 relative`}>
      
      <SettingsDropdown
        user={user}
        memberCount={memberCount}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        onLogout={onLogout}
        onUnsync={handleUnsyncBoard}
        onDeleteAccount={handleDeleteAccount}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRoutines={() => setIsRoutinesOpen(true)}/>

      <header className="mb-12 text-center max-w-xl mx-auto pt-4">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-lg fill-current" />
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-800">Sync Board</h1>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${activeTab === 'board' ? 'bg-stone-800 text-white shadow-sm' : 'bg-[#FAF7F2]/60 text-stone-600 hover:bg-[#FAF7F2]'}`}>
            <FiCompass /> Time Board
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${activeTab === 'canvas' ? 'bg-stone-800 text-white shadow-sm' : 'bg-[#FAF7F2]/60 text-stone-600 hover:bg-[#FAF7F2]'}`}>
            <FiGrid /> Pixel Canvas
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${activeTab === 'notes' ? 'bg-stone-800 text-white shadow-sm' : 'bg-[#FAF7F2]/60 text-stone-600 hover:bg-[#FAF7F2]'}`}>
            <FiMessageSquare /> Daily Notes
          </button>
        </div>
      </header>

      {activeTab === 'board' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
          <TimeCard
            label={user?.nickname || user?.username || 'You'}
            timezone={myTimezone}
            time={currentTime}
            currentStatus={currentStatusObj}
            isUser={true}
            onSelectStatus={setMyStatus}/>
          <TimeCard
            label={partner?.nickname || partner?.username || 'Your Partner'}
            timezone={partnerTimezone}
            time={currentTime}
            currentStatus={partnerStatusObj}
            isUser={false}/>
        </div>
      )}

      {activeTab === 'canvas' && <PixelCanvas boardId={user?.boardId} />}

      {activeTab === 'notes' && <MessageBoard boardId={user?.boardId} username={user?.nickname || user?.username} />}

      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onSave={(updated) => setUser({ ...user, ...updated })}
        onClose={() => setIsProfileOpen(false)}/>

      <RoutineScheduler
        isOpen={isRoutinesOpen}
        userId={user?.userId}
        onClose={() => setIsRoutinesOpen(false)}/>

      <footer className="mt-24 text-center text-stone-400 text-xs tracking-wide">
        Built with love :3
      </footer>
    </div>
  );
}