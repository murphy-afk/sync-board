const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const [boardResult] = await pool.query(
      'INSERT INTO boards (invite_code, board_name) VALUES (?, ?)',
      [inviteCode, `${username}'s Board`]
    );
    const boardId = boardResult.insertId;

    const [userResult] = await pool.query(
      'INSERT INTO users (username, password_hash, board_id) VALUES (?, ?, ?)',
      [username, hashedPassword, boardId]
    );

    res.status(201).json({
      success: true,
      userId: userResult.insertId,
      username,
      boardId,
      inviteCode
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Username may already be taken' });
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
      boardId: user.board_id,
      inviteCode: board ? board.invite_code : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;