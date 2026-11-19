import React, { useState } from 'react';
import { FiHeart, FiUser, FiLock, FiKey, FiMail, FiArrowRight } from 'react-icons/fi';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [mode, setMode] = useState(() => (new URLSearchParams(window.location.search).get('token') ? 'reset' : 'auth')); // 'auth', 'options', 'join', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('token'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering ? { username, password, email } : { username, password })
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not send the reset link');

      setNotice(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (newPassword !== confirmPassword) {
      setError("Those passwords don't match");
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not reset the password');

      setResetToken(null);
      window.history.replaceState({}, '', window.location.pathname);
      setNewPassword('');
      setConfirmPassword('');
      setIsRegistering(false);
      setMode('auth');
      setNotice('Password updated. You can log in now.');
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
        email: tempUserData.email,
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

  const goToLogin = () => {
    if (resetToken) {
      setResetToken(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
    setMode('auth');
    setError('');
    setNotice('');
  };

  let subtitle;
  if (mode === 'options') {
    subtitle = 'Your board is ready! Do you want to join your partner\'s board?';
  } else if (mode === 'forgot') {
    subtitle = 'Pop in your email and we will send you a link to reset your password';
  } else if (mode === 'reset') {
    subtitle = 'Pick a new password for your account';
  } else {
    subtitle = isRegistering ? 'Create an account to get started' : 'Welcome back! Log in to your board';
  }

  return (
    <div className="min-h-screen bg-[#fdc3ee] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-xl flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-xl fill-current" />
        </div>
        <h1 className="text-3xl font-light tracking-tight text-stone-800 mb-2">Sync Board</h1>
        <p className="text-stone-500 text-sm mb-6 text-center">{subtitle}</p>

        {error && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {notice && (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 text-center">
            {notice}
          </div>
        )}

        {mode === 'auth' ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {isRegistering && (
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-stone-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  required/>
              </div>
            )}

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

            {!isRegistering && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}
                  className="text-xs text-stone-400 hover:text-stone-700 transition cursor-pointer">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              {isRegistering ? 'Create Account' : 'Log In'} <FiArrowRight />
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(''); setNotice(''); }}
                className="text-xs text-stone-500 hover:text-stone-800 transition cursor-pointer">
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              Send reset link <FiArrowRight />
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="text-xs text-stone-500 hover:text-stone-800 transition text-center cursor-pointer mt-2">
              Back to log in
            </button>
          </form>
        ) : mode === 'reset' ? (
          <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <div className="relative">
              <FiKey className="absolute left-4 top-3.5 text-stone-400" />
              <input
                type="password"
                placeholder="Repeat the new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required/>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer">
              Set new password <FiArrowRight />
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="text-xs text-stone-500 hover:text-stone-800 transition text-center cursor-pointer mt-2">
              Back to log in
            </button>
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
