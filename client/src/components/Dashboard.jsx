import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FiClock, FiCalendar, FiBriefcase, FiBookOpen, FiMoon, FiSun, FiHeart } from 'react-icons/fi';
import { MdOutlineFreeBreakfast } from "react-icons/md";

dayjs.extend(utc);
dayjs.extend(timezone);

const statusIcons = {
  'Free to Call': <MdOutlineFreeBreakfast className="text-emerald-700/70" />,
  'At Work': <FiBriefcase className="text-amber-700/70" />,
  'Studying': <FiBookOpen className="text-rose-700/70" />,
  'Sleeping': <FiMoon className="text-indigo-700/70" />,
};

export default function Dashboard() {
  const [myTimezone] = useState(dayjs.tz.guess());
  const [partnerTimezone] = useState('Europe/London');
  const [myStatus, setMyStatus] = useState('Free to Call');
  const [partnerStatus] = useState('Sleeping');
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeCard = ({ label, timezone, time, status, isUser, onStatusChange }) => (
    <div className={`bg-[#FAF7F2] p-8 rounded-4xl border ${isUser ? 'border-emerald-200/50 shadow-emerald-900/5' : 'border-orange-200/50 shadow-orange-900/5'} shadow-md flex flex-col justify-between transition-all duration-300`}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs font-medium uppercase tracking-widest px-3.5 py-1.5 rounded-full ${isUser ? 'bg-emerald-100/60 text-emerald-800' : 'bg-orange-100/60 text-orange-800'}`}>
            {label}
          </span>
          <div className={`p-2.5 rounded-full ${isUser ? 'bg-emerald-100/50 text-emerald-800' : 'bg-orange-100/50 text-orange-800'}`}>
            {isUser ? <FiSun className="text-base" /> : <FiMoon className="text-base" />}
          </div>
        </div>

        <div className="flex items-baseline gap-3 text-stone-700 my-2">
          <FiClock className="text-stone-400 text-lg" />
          <h2 className="text-4xl md:text-5xl font-light tracking-tight font-mono">{time.tz(timezone).format('h:mm:ss A')}</h2>
        </div>

        <div className="flex items-center gap-2 text-stone-500 mt-3 ml-1">
          <FiCalendar className="text-stone-400 text-sm" />
          <p className="text-sm font-normal">{time.tz(timezone).format('dddd, MMMM D, YYYY')}</p>
        </div>

        <div className="mt-4 ml-1">
          <span className="text-[11px] text-stone-500 font-mono bg-[#F3EDE2] px-2.5 py-1 rounded-md border border-stone-200/60 inline-block">
            {timezone}
          </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200/60">
        <label className="text-xs font-medium text-stone-600 uppercase tracking-wider block mb-3">Current Routine</label>
        {isUser ? (
          <div className="relative">
            <select
              value={myStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none bg-[#F3EDE2]/60 border border-stone-200 rounded-2xl pl-12 pr-10 py-3.5 w-full text-base font-normal text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-200/50 focus:border-emerald-300 transition cursor-pointer">
              <option value="Free to Call">Free to Call</option>
              <option value="At Work">At Work</option>
              <option value="Studying">Studying</option>
              <option value="Sleeping">Sleeping</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              {statusIcons[myStatus]}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs">▼</div>
          </div>
        ) : (
          <div className="bg-[#F3EDE2]/60 border border-stone-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-base font-normal text-stone-700">
            <div className="text-lg">
              {statusIcons[partnerStatus]}
            </div>
            {partnerStatus}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdc3ee] text-stone-700 p-8 md:p-16 font-sans">
      <header className="mb-16 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-lg fill-current" />
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-800">Sync Board</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
        <TimeCard
          label="You"
          timezone={myTimezone}
          time={currentTime}
          status={myStatus}
          isUser={true}
          onStatusChange={setMyStatus}/>
        <TimeCard
          label="Your Partner"
          timezone={partnerTimezone}
          time={currentTime}
          status={partnerStatus}
          isUser={false}/>
      </div>

      <footer className="mt-24 text-center text-stone-400 text-xs tracking-wide">
        Built with love :3
      </footer>
    </div>
  );
}