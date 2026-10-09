import React, { useState } from 'react';
import { FiX, FiUser, FiGlobe, FiClock } from 'react-icons/fi';


const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export default function ProfileModal({ isOpen, user, onSave, onClose }) {
  const [nickname, setNickname] = useState(user?.nickname || user?.username || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await window.fetch(`/api/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, timezone })
      });
      const data = await res.json();
      if (data.success) {
        onSave({ nickname, timezone });
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200 shadow-2xl flex flex-col max-w-md w-full relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-100/60 text-emerald-700">
            <FiUser className="text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-light text-stone-800">Edit Profile</h3>
            <p className="text-xs text-stone-500">Customize how your name appears and set your timezone.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-stone-600 uppercase tracking-wider block mb-2">Your Nickname</label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-4 text-stone-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname..."
                className="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1 ml-1">This will automatically display on your daily notes.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-600 uppercase tracking-wider block mb-2">Your Timezone / Location</label>
            <div className="relative flex items-center">
              <FiGlobe className="absolute left-4 text-stone-400" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none cursor-pointer">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <FiClock className="absolute right-4 text-stone-400 pointer-events-none text-xs" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-stone-200/70 hover:bg-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium transition cursor-pointer shadow-sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}