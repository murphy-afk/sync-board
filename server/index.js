const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const doodleRoutes = require('./routes/doodles');
const noteRoutes = require('./routes/notes');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const userRoutes = require('./routes/users');
const routineRoutes = require('./routes/routines');
const galleryRoutes = require('./routes/gallery');

app.use('/api/doodles', doodleRoutes);
app.use('/api/messages', noteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/gallery', galleryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});