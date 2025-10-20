const express = require('express');
const auth = require('../middleware/auth');
const LiveSession = require('../models/LiveSession');

const router = express.Router();

// Create live session (Teacher only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create live sessions' });
    }

    const { title, youtubeLink, subject, scheduledAt } = req.body;

    const liveSession = new LiveSession({
      title,
      youtubeLink,
      subject,
      scheduledAt,
      conductedBy: req.user.id
    });

    await liveSession.save();
    await liveSession.populate('conductedBy', 'name');

    res.status(201).json(liveSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live sessions for student based on their subjects
router.get('/my-lives', auth, async (req, res) => {
  try {
    const userSubjects = req.user.subjects;
    
    const liveSessions = await LiveSession.find({
      subject: { $in: userSubjects }
    }).populate('conductedBy', 'name').sort({ scheduledAt: -1 });

    res.json(liveSessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's live sessions
router.get('/teacher-lives', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const liveSessions = await LiveSession.find({
      conductedBy: req.user.id
    }).sort({ scheduledAt: -1 });

    res.json(liveSessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark live as completed and add recorded video
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can complete live sessions' });
    }

    const { recordedVideo } = req.body;

    const liveSession = await LiveSession.findOneAndUpdate(
      { _id: req.params.id, conductedBy: req.user.id },
      { 
        isCompleted: true,
        recordedVideo 
      },
      { new: true }
    );

    if (!liveSession) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    res.json(liveSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;