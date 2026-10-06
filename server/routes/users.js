const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, timezone, board_id FROM users WHERE id = ?', 
      [req.params.userId]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    res.json({
      userId: user.id,
      username: user.username,
      nickname: user.nickname || '',
      timezone: user.timezone || 'UTC',
      boardId: user.board_id,
    });
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const { nickname, timezone } = req.body;
    await pool.query(
      'UPDATE users SET nickname = ?, timezone = ? WHERE id = ?',
      [nickname || null, timezone || 'UTC', req.params.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;