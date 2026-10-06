const express = require('express');
const router = express.Router();
const pool = require('../db');

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

    res.json({ success: true, boardId: board.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join board' });
  }
});

router.get('/:boardId/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM users WHERE board_id = ?', [req.params.boardId]);
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