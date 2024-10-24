require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const { authenticate, getUsername } = require('./middlewares/authMiddleware');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Routes
app.use('/', authRoutes);
app.use('/', fileRoutes);

// Pages
app.get('/', (req, res) => {
  res.render('layout', { page: 'welcome', username: getUsername(req) });
});

app.get('/register', (req, res) => {
  res.render('layout', { page: 'register', username: null });
});

app.get('/login', (req, res) => {
  res.render('layout', { page: 'login', username: null });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});