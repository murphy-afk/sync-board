import React, { useState, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';

const THEMES = [
  { 
    id: 'default', 
    label: 'Plain', 
    bg: 'bg-white text-stone-700 border-stone-200',
    previewBg: 'bg-white border-stone-300'
  },
  { 
    id: 'pink-hearts', 
    label: 'Pink Hearts', 
    bg: 'bg-rose-50 text-rose-900 border-rose-200 relative overflow-hidden',
    previewBg: 'bg-rose-50 border-rose-300'
  },
  { 
    id: 'blue-clouds', 
    label: 'Blue Clouds', 
    bg: 'bg-sky-50 text-sky-900 border-sky-200 relative overflow-hidden',
    previewBg: 'bg-sky-50 border-sky-300'
  },
  { 
    id: 'dark-stars', 
    label: 'Night Sky', 
    bg: 'bg-slate-900 text-white border-slate-800 relative overflow-hidden',
    previewBg: 'bg-slate-900 border-slate-700 text-white'
  }
];

export default function MessageBoard({ boardId, author }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');

  useEffect(() => {
    if (boardId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [boardId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${boardId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !boardId) return;

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          boardId, 
          username: author || 'Anonymous', 
          message: newMessage,
          theme: selectedTheme 
        })
      });

      if (res.ok) {
        setNewMessage('');
        setSelectedTheme('default');
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const renderThemeDecorations = (themeId) => {
    if (themeId === 'pink-hearts') {
      return (
        <>
          <span className="absolute top-1.5 left-2.5 text-rose-300 text-xs select-none">♥</span>
          <span className="absolute top-3 right-3 text-rose-200 text-[10px] select-none">♥</span>
          <span className="absolute bottom-1.5 right-2.5 text-rose-300 text-xs select-none">♥</span>
          <span className="absolute bottom-2 left-4 text-rose-200 text-[10px] select-none">♥</span>
        </>
      );
    }
    if (themeId === 'blue-clouds') {
      return (
        <>
          <span className="absolute top-1.5 left-2.5 text-sky-300 text-xs select-none">☁</span>
          <span className="absolute top-3 right-3 text-sky-200 text-[10px] select-none">☁</span>
          <span className="absolute bottom-1.5 right-2.5 text-sky-300 text-xs select-none">☁</span>
          <span className="absolute bottom-2 left-4 text-sky-200 text-[10px] select-none">☁</span>
        </>
      );
    }
    if (themeId === 'dark-stars') {
      return (
        <>
          <span className="absolute top-2 left-3 text-amber-200 text-xs select-none">★</span>
          <span className="absolute top-1.5 right-4 text-indigo-300 text-[10px] select-none">✦</span>
          <span className="absolute bottom-2 right-3 text-amber-300 text-xs select-none">★</span>
          <span className="absolute bottom-1.5 left-5 text-indigo-200 text-[10px] select-none">✦</span>
        </>
      );
    }
    return null;
  };

  const activeThemeObj = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="max-w-2xl mx-auto bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-md flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-stone-800">Daily Notes</h2>
        <p className="text-stone-500 text-sm mt-1">Leave sweet notes or updates for each other.</p>
      </div>

      {/* Message Input Box with Live Preview Theme */}
      <form onSubmit={handleSend} className="w-full mb-8">
        <div className={`p-4 rounded-3xl border shadow-inner transition-colors duration-300 ${activeThemeObj.previewBg} relative`}>
          {renderThemeDecorations(selectedTheme)}
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a daily note..."
            rows="3"
            className="w-full bg-transparent focus:outline-none text-sm resize-none placeholder:text-stone-400 relative z-10"/>

          {/* Theme Selector Bubbles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-stone-200/40 mt-3 gap-3 relative z-10">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-medium opacity-70 mr-1 w-full sm:w-auto">Theme:</span>
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                    selectedTheme === theme.id 
                      ? 'bg-stone-800 text-white border-stone-800 shadow-xs scale-105' 
                      : 'bg-white/80 text-stone-600 border-stone-300 hover:bg-white'
                  }`}>
                  {theme.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition cursor-pointer shadow-sm w-full sm:w-auto mt-1 sm:mt-0">
              <FiSend /> Send Note
            </button>
          </div>
        </div>
      </form>

      {/* Message List */}
      <div className="w-full space-y-4 max-h-96 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">No notes left for today yet! Say hello above.</div>
        ) : (
          messages.map((msg) => {
            const themeConfig = THEMES.find(t => t.id === msg.theme) || THEMES[0];
            return (
              <div 
                key={msg.id} 
                className={`p-4 rounded-2xl border shadow-sm relative transition-all ${themeConfig.bg}`}>
                {renderThemeDecorations(msg.theme)}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="font-medium text-xs tracking-wide opacity-80">{msg.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button 
                      onClick={() => handleDelete(msg.id)} 
                      className="opacity-40 hover:opacity-100 transition cursor-pointer p-1"
                      title="Delete note">
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed relative z-10">{msg.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}