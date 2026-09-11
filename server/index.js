const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// Get all saved doodles 
app.get('/api/doodles/:coupleId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM doodles WHERE couple_id = ? ORDER BY created_at DESC',
            [req.params.coupleId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch doodles' });
    }
});

// Save a new doodle
app.post('/api/doodles', async (req, res) => {
    try {
        const { coupleId = 1, gridData } = req.body;
        const [result] = await pool.query(
            'INSERT INTO doodles (couple_id, grid_data) VALUES (?, ?)',
            [coupleId, JSON.stringify(gridData)]
        );
        res.status(201).json({ id: result.insertId, success: true });
    } catch (err) {
        console.error(err);
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

// Get all daily notes
app.get('/api/notes/:coupleId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM notes WHERE couple_id = ? ORDER BY created_at DESC',
            [req.params.coupleId]
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
        const { coupleId = 1, author, content } = req.body;
        if (!author || !content) {
            return res.status(400).json({ error: 'Author and content are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO notes (couple_id, author, content) VALUES (?, ?, ?)',
            [coupleId, author, content]
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