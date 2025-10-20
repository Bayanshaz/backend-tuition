const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  youtubeLink: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: [
      '8th-biology',
      '9th-biology', 
      '10th-biology',
      'plusone-zoology',
      'plusone-botany',
      'plustwo-zoology',
      'plustwo-botany'
    ]
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  recordedVideo: {
    filename: String,
    originalName: String,
    path: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);