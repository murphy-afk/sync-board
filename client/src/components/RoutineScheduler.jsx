import React, { useState, useEffect } from 'react';
import { FiX, FiClock, FiCalendar, FiPlus, FiTrash2, FiCheck, FiBriefcase, FiBookOpen, FiMoon } from 'react-icons/fi';
import { MdOutlineFreeBreakfast } from 'react-icons/md';

const statusOptions = [
  { label: 'Free to Call', icon: <MdOutlineFreeBreakfast className="text-emerald-700 text-base" /> },
  { label: 'At Work', icon: <FiBriefcase className="text-amber-700 text-base" /> },
  { label: 'Studying', icon: <FiBookOpen className="text-rose-700 text-base" /> },
  { label: 'Sleeping', icon: <FiMoon className="text-indigo-700 text-base" /> },
];

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export default function RoutineScheduler({ isOpen, userId, onClose }) {
  const [routines, setRoutines] = useState([]);
  const [statusLabel, setStatusLabel] = useState('At Work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetchRoutines();
  }, [isOpen, userId]);

  const fetchRoutines = async () => {
    try {
      const res = await fetch(`/api/routines/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setRoutines(data);
    } catch (err) {
      console.error('Failed to fetch routines:', err);
    }
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Please select at least one day of the week.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, statusLabel, startTime, endTime, daysOfWeek: selectedDays })
      });
      const data = await res.json();
      if (data.success) {
        fetchRoutines();
        // Reset defaults
        setSelectedDays([1, 2, 3, 4, 5]);
      }
    } catch (err) {
      console.error('Failed to create routine:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      const res = await fetch(`/api/routines/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRoutines(routines.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete routine:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200 shadow-2xl flex flex-col max-w-lg w-full relative max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-100/60 text-amber-700">
            <FiClock className="text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-light text-stone-800">Automatic Routines</h3>
            <p className="text-xs text-stone-500">Set timeframes to automatically update your status.</p>
          </div>
        </div>

        {/* Form to add routine */}
        <form onSubmit={handleAddRoutine} className="bg-white/60 p-5 rounded-3xl border border-stone-200/80 mb-6 space-y-4">
          <p className="text-xs font-medium text-stone-700 uppercase tracking-wider">Add New Routine Rule</p>

          <div>
            <label className="text-[11px] font-medium text-stone-500 block mb-1.5">Status to Trigger</label>
            <select
              value={statusLabel}
              onChange={(e) => setStatusLabel(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer">
              {statusOptions.map(opt => (
                <option key={opt.label} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-500 block mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200"/>
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-500 block mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200"/>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-stone-500 block mb-1.5">Repeat Days</label>
            <div className="flex gap-1.5 justify-between">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center transition cursor-pointer border ${isSelected ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}>
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
            <FiPlus className="text-sm" /> Save Routine Rule
          </button>
        </form>

        {/* Existing Routines List */}
        <div>
          <p className="text-xs font-medium text-stone-600 uppercase tracking-wider mb-3">Active Rules ({routines.length})</p>
          {routines.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6 bg-white/40 rounded-3xl border border-stone-200/60">No automated routines configured yet.</p>
          ) : (
            <div className="space-y-2.5">
              {routines.map(routine => (
                <div key={routine.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-stone-800">{routine.status_label}</span>
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/50">
                        {routine.start_time.slice(0, 5)} - {routine.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono">
                      Repeats weekly
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}