import { useState } from 'react';
import { FiHeart, FiGrid, FiKey, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function CreateBoardScreen({ user, onBoardCreated }) {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [boardName, setBoardName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId || user?.id, name: boardName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create board');

      onBoardCreated({ boardId: data.boardId, inviteCode: data.inviteCode, boardName: data.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const code = inviteCode.trim().toUpperCase();
      const res = await fetch('/api/boards/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId || user?.id, inviteCode: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join board');

      onBoardCreated({ boardId: data.boardId, inviteCode: code, boardName: data.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdc3ee] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-xl flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100/60 text-rose-700/80 rounded-full mb-4 shadow-sm">
          <FiHeart className="text-xl fill-current" />
        </div>

        {mode === 'create' ? (
          <>
            <h1 className="text-3xl font-light tracking-tight text-stone-800 mb-2">Create a new board</h1>
            <p className="text-stone-500 text-sm mb-6 text-center">
              You're not part of a board right now. Every account belongs to one board at a time — start a fresh one, or join your partner's with their invite code.
            </p>

            {error && (
              <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="w-full flex flex-col gap-4">
              <div className="relative">
                <FiGrid className="absolute left-4 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={user?.username ? `${user.username}'s Board` : 'Board name'}
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer disabled:opacity-60">
                {loading ? 'Creating...' : <>Create Board <FiArrowRight /></>}
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setMode('join'); setError(''); }}
              className="w-full mt-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2">
              <FiKey /> I have an invite code to join a board
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-light tracking-tight text-stone-800 mb-2">Join a board</h1>
            <p className="text-stone-500 text-sm mb-6 text-center">
              Enter your partner's invite code to join their board instead of starting your own.
            </p>

            {error && (
              <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
              <div className="relative">
                <FiKey className="absolute left-4 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Enter Partner's Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-sm font-mono uppercase tracking-widest text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition cursor-pointer disabled:opacity-60">
                {loading ? 'Joining...' : <>Join Board <FiArrowRight /></>}
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setMode('create'); setError(''); }}
              className="w-full mt-4 py-3 text-stone-500 hover:text-stone-800 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2">
              <FiArrowLeft /> Back to creating a board
            </button>
          </>
        )}
      </div>
    </div>
  );
}
