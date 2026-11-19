const express = require('express');
const router = express.Router();
const pool = require('../db');
const { normalizeEmail, isValidEmail } = require('../validate');

router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, nickname, timezone, board_id FROM users WHERE id = ?',
      [req.params.userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    res.json({
      userId: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname || '',
      timezone: user.timezone || 'UTC',
      boardId: user.board_id,
    });
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fields that aren't sent keep their current value, so partial updates
// (just an email, say) don't wipe the nickname or timezone.
router.put('/:userId', async (req, res) => {
  try {
    const { nickname, timezone } = req.body;

    const [rows] = await pool.query(
      'SELECT nickname, timezone, email FROM users WHERE id = ?',
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const nextNickname = nickname !== undefined ? (nickname || null) : rows[0].nickname;
    const nextTimezone = timezone !== undefined ? (timezone || 'UTC') : rows[0].timezone;
    let nextEmail = rows[0].email;

    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);

      // Empty string clears it, which puts the account back into the
      // "add your email" state on next login.
      if (email && !isValidEmail(email)) {
        return res.status(400).json({ error: "That doesn't look like a valid email address" });
      }

      if (email) {
        const [dupe] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, req.params.userId]
        );
        if (dupe.length > 0) {
          return res.status(409).json({ error: 'That email is already in use' });
        }
      }

      nextEmail = email || null;
    }

    await pool.query(
      'UPDATE users SET nickname = ?, timezone = ?, email = ? WHERE id = ?',
      [nextNickname, nextTimezone, nextEmail, req.params.userId]
    );

    res.json({ success: true, email: nextEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
