const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', videoSchema);