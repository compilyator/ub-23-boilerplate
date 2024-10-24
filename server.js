require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// File Schema
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).redirect('/login');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true }).json({ success: true });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// Helper function to get the username
const getUsername = (req) => req.user ? req.user.username : null;

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// File Upload Setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload Route (authorized users only)
app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const newFile = new File({
    filename: req.file.filename,
    originalname: req.file.originalname,
      userId: req.user._id,
    });
    await newFile.save();
    res.redirect('/files');
  } catch (err) {
    res.status(500).send('Error uploading file');
  }
});

// Browse Uploaded Files (authorized users only)
app.get('/files', authenticate, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id });
    res.render('layout', { page: 'files', username: getUsername(req), files });
  } catch (err) {
    res.status(500).send('Unable to retrieve files');
  }
});

// Download File Route (authorized users only)
app.get('/download/:filename', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({ filename: req.params.filename, userId: req.user._id });
    if (!file) {
      return res.status(404).send('File not found or you do not have permission to access this file');
    }
    const filePath = path.join(__dirname, 'uploads', file.filename);
    res.download(filePath, file.originalname);
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

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