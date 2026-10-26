const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// Create a brand new board for a user (a user can only be in one board at a time)
router.post('/', async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [userRows] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const boardName = (name && name.trim()) || `${userRows[0].username}'s Board`;

    const [boardResult] = await pool.query(
      'INSERT INTO boards (invite_code, board_name, name) VALUES (?, ?, ?)',
      [inviteCode, boardName, boardName]
    );

    await pool.query('UPDATE users SET board_id = ? WHERE id = ?', [boardResult.insertId, userId]);

    res.status(201).json({
      success: true,
      boardId: boardResult.insertId,
      inviteCode,
      name: boardName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Leave the current board: the member is removed, the board and its content are kept
router.post('/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await pool.query('UPDATE users SET board_id = NULL WHERE id = ?', [userId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to leave board' });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;

    const [boardRows] = await pool.query('SELECT * FROM boards WHERE invite_code = ?', [inviteCode]);
    if (boardRows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    const board = boardRows[0];

    const [memberRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE board_id = ?', [board.id]);
    if (memberRows[0].count >= 2) {
      return res.status(400).json({ error: 'This board is already full (max 2 people)' });
    }

    await pool.query('UPDATE users SET board_id = ? WHERE id = ?', [board.id, userId]);

    res.json({ success: true, boardId: board.id, name: board.name || board.board_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join board' });
  }
});

router.get('/:boardId/members', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, nickname, COALESCE(timezone, 'UTC') AS timezone FROM users WHERE board_id = ?",
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

router.get('/:boardId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [req.params.boardId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Board not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
});

router.put('/:boardId', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE boards SET name = ? WHERE id = ?', [name, req.params.boardId]);
    res.json({ success: true, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update board name' });
  }
});

module.exports = router;