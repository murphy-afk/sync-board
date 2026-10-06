const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:boardId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, board_id, author, content, theme, created_at FROM notes WHERE board_id = ? ORDER BY created_at DESC', 
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { boardId, username, message, theme } = req.body;
    await pool.query(
      'INSERT INTO notes (board_id, author, content, theme) VALUES (?, ?, ?, ?)',
      [boardId, username, message, theme || 'default']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to post note:', err);
    res.status(500).json({ error: 'Failed to post note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;