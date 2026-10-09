import React, { useState } from 'react';
import { FiHeart, FiUser, FiLock, FiKey, FiArrowRight } from 'react-icons/fi';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [mode, setMode] = useState('auth'); // 'auth' or 'join'
  const [error, setError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (isRegistering) {
        // After registering, prompt them if they want to join an existing partner's board or use their own
        setTempUserData(data);
        setMode('options');
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinBoard = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/boards/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserData.userId, inviteCode: inviteCode.trim().toUpperCase() })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to join board');

      onLoginSuccess({
        userId: tempUserData.userId,
        username: tempUserData.username,
        boardId: data.boardId,
        inviteCode: inviteCode.trim().toUpperCase()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSkipJoin = () => {
    onLoginSuccess(tempUserData);
  };

  return (
    <div className="min-h-screen bg-[#fdc3ee] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-xl flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-xl fill-current" />
        </div>
        <h1 className="text-3xl font-light tracking-tight text-stone-800 mb-2">Sync Board</h1>
        <p className="text-stone-500 text-sm mb-6 text-center">
          {mode === 'options'
            ? 'Your board is ready! Do you want to join your partner\'s board?'
            : isRegistering ? 'Create an account to get started' : 'Welcome back! Log in to your board'}
        </p>

        {error && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {mode === 'auth' ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="relative">
              <FiUser className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              {isRegistering ? 'Create Account' : 'Log In'} <FiArrowRight />
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-stone-500 hover:text-stone-800 transition cursor-pointer">
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        ) : mode === 'options' ? (
          <div className="w-full flex flex-col gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center mb-2">
              <p className="text-xs text-stone-400 font-mono mb-1">YOUR INVITE CODE</p>
              <p className="text-2xl font-bold font-mono tracking-widest text-stone-800">{tempUserData.inviteCode}</p>
              <p className="text-xs text-stone-500 mt-2">Share this code with your partner so they can join your board.</p>
            </div>

            <button
              onClick={() => setMode('join')}
              className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium transition cursor-pointer">
              I have a partner's invite code to enter
            </button>

            <button
              onClick={handleSkipJoin}
              className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              Start with my own board
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoinBoard} className="w-full flex flex-col gap-4">
            <div className="relative">
              <FiKey className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Enter Partner's Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm font-mono uppercase tracking-widest text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              Join Board
            </button>

            <button
              type="button"
              onClick={() => setMode('options')}
              className="text-xs text-stone-500 hover:text-stone-800 transition text-center cursor-pointer mt-2">
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}