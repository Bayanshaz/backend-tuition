const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|wmv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: { fileSize: 100000000 } // 100MB limit
});

// Upload video (Teacher only)
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can upload videos' });
    }

    const { title, description, subject } = req.body;

    const video = new Video({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      subject,
      uploadedBy: req.user.id
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos for student based on their subjects
router.get('/my-videos', auth, async (req, res) => {
  try {
    const userSubjects = req.user.subjects;
    
    const videos = await Video.find({
      subject: { $in: userSubjects }
    }).populate('uploadedBy', 'name').sort({ uploadedAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's uploaded videos
router.get('/teacher-videos', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const videos = await Video.find({
      uploadedBy: req.user.id
    }).sort({ uploadedAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;