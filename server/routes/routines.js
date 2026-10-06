const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM routines WHERE user_id = ?', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, statusLabel, startTime, endTime, daysOfWeek } = req.body;
    const [result] = await pool.query(
      'INSERT INTO routines (user_id, status_label, start_time, end_time, days_of_week) VALUES (?, ?, ?, ?, ?)',
      [userId, statusLabel, startTime, endTime, JSON.stringify(daysOfWeek)]
    );
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create routine' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routines WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

module.exports = router;