const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Create the database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sync_board',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DOODLES

// Get doodles for a specific board
app.get('/api/doodles/:boardId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM doodles WHERE board_id = ? ORDER BY created_at DESC',
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doodles' });
  }
});

// Save a new doodle
app.post('/api/doodles', async (req, res) => {
  const { boardId, grid_data } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO doodles (board_id, grid_data) VALUES (?, ?)',
      [boardId, JSON.stringify(grid_data)]
    );
    res.status(201).json({ id: result.insertId, board_id: boardId, grid_data });
  } catch (err) {
    console.error('Error saving doodle:', err);
    res.status(500).json({ error: 'Failed to save doodle' });
  }
});

// Delete a doodle
app.delete('/api/doodles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM doodles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete doodle' });
  }
});

// NOTES

// Get notes for a specific board
app.get('/api/notes/:boardId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE board_id = ? ORDER BY created_at DESC',
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Post a new daily note
app.post('/api/notes', async (req, res) => {
  try {
    const { boardId, author, content } = req.body;
    if (!boardId || !author || !content) {
      return res.status(400).json({ error: 'Board ID, author, and content are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO notes (board_id, author, content) VALUES (?, ?, ?)',
      [boardId, author, content]
    );

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Delete a daily note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});


// Register a new user and create a new board automatically
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique 6-character invite code for the board
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // 1. Create a new board
    const [boardResult] = await pool.query(
      'INSERT INTO boards (invite_code, board_name) VALUES (?, ?)',
      [inviteCode, `${username}'s Board`]
    );
    const boardId = boardResult.insertId;

    // 2. Create user and link to the board
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

// Login user
app.post('/api/auth/login', async (req, res) => {
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

    // Fetch board info
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

// Join an existing board via invite code (Max 2 users check)
app.post('/api/boards/join', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;

    // Find the board by invite code
    const [boardRows] = await pool.query('SELECT * FROM boards WHERE invite_code = ?', [inviteCode]);
    if (boardRows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    const board = boardRows[0];

    // Check how many users are currently on this board
    const [memberRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE board_id = ?', [board.id]);
    if (memberRows[0].count >= 2) {
      return res.status(400).json({ error: 'This board is already full (max 2 people)' });
    }

    // Assign user to this board
    await pool.query('UPDATE users SET board_id = ? WHERE id = ?', [board.id, userId]);

    res.json({ success: true, boardId: board.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join board' });
  }
});

// Get members of a board
app.get('/api/boards/:boardId/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM users WHERE board_id = ?', [req.params.boardId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

// Get user profile info
app.get('/api/users/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nickname, timezone, board_id FROM users WHERE id = ?', [req.params.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (nickname, timezone)
app.put('/api/users/:userId', async (req, res) => {
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

// Update user profile (nickname, timezone)
app.put('/api/users/:userId', async (req, res) => {
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

// Get routines for user
app.get('/api/routines/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM routines WHERE user_id = ?', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

// Save a new routine rule
app.post('/api/routines', async (req, res) => {
  try {
    const { userId, statusLabel, startTime, endTime, daysOfWeek } = req.body;
    const [result] = await pool.query(
      'INSERT INTO routines (user_id, status_label, start_time, end_time, days_of_week) VALUES (?, ?, ?, ?, ?)',
      [userId, statusLabel, startTime, endTime, JSON.stringify(daysOfWeek)]
    );
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create routine' });
  }
});

// Toggle or delete a routine
app.delete('/api/routines/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routines WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});