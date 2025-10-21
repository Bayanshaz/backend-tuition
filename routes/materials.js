const express = require('express');
const auth = require('../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');

const router = express.Router();

// Create study material (Teacher only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create study materials' });
    }

    const { title, description, youtubeLink, subject } = req.body;

    const material = new StudyMaterial({
      title,
      description,
      youtubeLink,
      subject,
      uploadedBy: req.user.id
    });

    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study materials for student based on their subjects
router.get('/my-materials', auth, async (req, res) => {
  try {
    const userSubjects = req.user.subjects;
    
    const materials = await StudyMaterial.find({
      subject: { $in: userSubjects }
    }).populate('uploadedBy', 'name').sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's study materials
router.get('/teacher-materials', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const materials = await StudyMaterial.find({
      uploadedBy: req.user.id
    }).sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete study material
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete materials' });
    }

    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      uploadedBy: req.user.id
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;