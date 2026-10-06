const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:boardId', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM doodles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete doodle' });
  }
});

module.exports = router;