const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { authenticate, getUsername } = require('../middlewares/authMiddleware');

const router = express.Router();

// File Upload Setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload Route (authorized users only)
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
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
router.get('/files', authenticate, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id });
    res.render('layout', { page: 'files', username: getUsername(req), files });
  } catch (err) {
    res.status(500).send('Unable to retrieve files');
  }
});

// Download File Route (authorized users only)
router.get('/download/:filename', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({ filename: req.params.filename, userId: req.user._id });
    if (!file) {
      return res.status(404).send('File not found or you do not have permission to access this file');
    }
    const filePath = path.join(__dirname, '../uploads', file.filename);
    res.download(filePath, file.originalname);
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

module.exports = router;