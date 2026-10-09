const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for secure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);
    if (isValidExt && isValidMime) return cb(null, true);
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'));
  }
});

// Serve uploaded files statically so the frontend can display them securely
// app.use('/uploads', express.static(uploadDir));

// Get all photos for a board
router.get('/:boardId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM gallery_photos WHERE board_id = ? ORDER BY created_at DESC',
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Upload a new photo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { boardId, author } = req.body;
    if (!req.file || !boardId) {
      return res.status(400).json({ error: 'Missing image or board ID' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const [result] = await pool.query(
      'INSERT INTO gallery_photos (board_id, author, image_url, stickers) VALUES (?, ?, ?, ?)',
      [boardId, author || 'Anonymous', imageUrl, JSON.stringify([])]
    );

    res.status(201).json({ id: result.insertId, imageUrl, author: author || 'Anonymous' });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Update stickers on a photo
router.put('/:id/stickers', async (req, res) => {
  try {
    const { stickers } = req.body;
    await pool.query(
      'UPDATE gallery_photos SET stickers = ? WHERE id = ?',
      [JSON.stringify(stickers), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving stickers:', err);
    res.status(500).json({ error: 'Failed to save stickers' });
  }
});

// Delete a photo
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT image_url FROM gallery_photos WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      const filename = path.basename(rows[0].image_url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Remove file from server
    }
    await pool.query('DELETE FROM gallery_photos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;