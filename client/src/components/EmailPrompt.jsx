import React, { useState } from 'react';
import { FiHeart, FiMail } from 'react-icons/fi';

// Shown to accounts created before emails existed. There is deliberately no
// close button and clicking the backdrop does nothing — they add one or leave.
export default function EmailPrompt({ user, onSave, onLogout }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${user.userId || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not save your email');

      onSave({ email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200 shadow-2xl flex flex-col items-center max-w-sm w-full animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-xl fill-current" />
        </div>

        <h3 className="text-xl font-light text-stone-800 mb-2 text-center">Add your email</h3>
        <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
          Your account doesn't have one yet. We need it so you can recover your
          password if you ever forget it.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative">
            <FiMail className="absolute left-4 top-3.5 text-stone-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
              autoFocus
              required/>
          </div>

          {error && (
            <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer disabled:opacity-60">
            {loading ? 'Saving...' : 'Save and continue'}
          </button>
        </form>

        <button
          type="button"
          onClick={onLogout}
          className="text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer mt-5">
          Use a different account
        </button>
      </div>
    </div>
  );
}
