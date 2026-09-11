import React, { useState, useEffect } from 'react';
import { FiSend, FiTrash2, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';

const COUPLE_ID = 1;

export default function MessageBoard() {
  const [notes, setNotes] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${COUPLE_ID}`);
      const data = await res.json();
      const formatted = data.map(item => ({
        id: item.id,
        author: item.author,
        content: item.content,
        timestamp: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setNotes(formatted);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleId: COUPLE_ID, author, content })
      });

      if (response.ok) {
        setContent('');
        fetchNotes();
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotes(notes.filter(item => item.id !== id));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-md flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-stone-800 flex items-center justify-center gap-2">
          <FiMessageSquare /> Daily Notes
        </h2>
        <p className="text-stone-500 text-sm mt-1">Leave a quick message or daily note for your partner.</p>
      </div>

      <form onSubmit={handlePostNote} className="w-full bg-white p-5 rounded-2xl border border-stone-200/60 shadow-xs mb-8 flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-1/3 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-200/80 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
            required
          />
        </div>
        <textarea
          placeholder="Write a sweet note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200/80 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          required
        />
        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
            <FiSend /> Post Note
          </button>
        </div>
      </form>

      <div className="w-full">
        <h3 className="text-lg font-light text-stone-800 mb-4">Message Feed</h3>
        {notes.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">No notes left for today. Be the first to write one!</div>
        ) : (
          <div className="flex flex-col gap-4 max-h-100 overflow-y-auto pr-2">
            {notes.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col justify-between relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setConfirmDeleteId(item.id)} className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer" title="Delete note">
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>

                {confirmDeleteId === item.id && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center p-4 z-10">
                    <FiAlertTriangle className="text-amber-300 text-xl mb-1" />
                    <p className="text-xs text-white text-center font-medium mb-3">Delete this note?</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => deleteNote(item.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white text-xs font-medium transition cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}

                <p className="text-stone-800 text-sm whitespace-pre-wrap mb-4 pr-8">{item.content}</p>
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono border-t border-stone-100 pt-3">
                  <span className="font-semibold text-stone-600">{item.author}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}