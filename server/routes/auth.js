const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { normalizeEmail, isValidEmail } = require('../validate');

// Reset links are built from this origin. No mailer is wired up yet, so the
// link is printed to the server console instead of being emailed.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const RESET_TTL_MS = 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    const [dupe] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dupe.length > 0) {
      return res.status(409).json({ error: 'That email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const [boardResult] = await pool.query(
      'INSERT INTO boards (invite_code, board_name) VALUES (?, ?)',
      [inviteCode, `${username}'s Board`]
    );
    const boardId = boardResult.insertId;

    const [userResult] = await pool.query(
      'INSERT INTO users (username, email, password_hash, board_id) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, boardId]
    );

    res.status(201).json({
      success: true,
      userId: userResult.insertId,
      username,
      email,
      boardId,
      inviteCode
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Username or email may already be taken' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const [boardRows] = await pool.query('SELECT * FROM boards WHERE id = ?', [user.board_id]);
    const board = boardRows[0];

    res.json({
      success: true,
      userId: user.id,
      username: user.username,
      email: user.email,
      boardId: user.board_id,
      inviteCode: board ? board.invite_code : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Always answers the same way, so nobody can use this to find out which
// addresses have an account.
router.post('/forgot-password', async (req, res) => {
  const generic = { success: true, message: 'If that address has an account, a reset link is on its way.' };

  try {
    const email = normalizeEmail(req.body.email);
    if (!isValidEmail(email)) return res.json(generic);

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.json(generic);

    const userId = rows[0].id;
    const token = crypto.randomBytes(32).toString('hex');

    await pool.query('DELETE FROM password_resets WHERE user_id = ? OR expires_at < NOW()', [userId]);
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, hashToken(token), new Date(Date.now() + RESET_TTL_MS)]
    );

    console.log(`\nPassword reset link for ${email}:\n${CLIENT_URL}/?token=${token}\n`);

    res.json(generic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start the password reset' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'A reset link and a new password are required' });
    }

    const [rows] = await pool.query(
      'SELECT id, user_id, expires_at FROM password_resets WHERE token_hash = ?',
      [hashToken(token)]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'This reset link is invalid or has already been used' });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      await pool.query('DELETE FROM password_resets WHERE id = ?', [rows[0].id]);
      return res.status(400).json({ error: 'This reset link has expired. Ask for a new one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, rows[0].user_id]);
    // Burn every link for this account, not just the one that was used
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [rows[0].user_id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reset the password' });
  }
});

module.exports = router;
