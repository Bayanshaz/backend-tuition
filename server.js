const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition-center', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
})
.catch((error) => {
  console.log('❌ MongoDB connection error:', error.message);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/lives', require('./routes/lives'));
app.use('/api/materials', require('./routes/materials'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sherin Tuition Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize demo data
const initializeDemoData = async () => {
  const User = require('./models/User');
  
  // Create Sherin teacher if not exists
  const existingTeacher = await User.findOne({ email: 'sherinsaleem@gmail.com' });
  if (!existingTeacher) {
    const teacher = new User({
      name: 'Sherin Saleem',
      email: 'sherinsaleem@gmail.com',
      password: 'Sherin@monu',
      role: 'teacher',
      subjects: [
        '8th-biology',
        '9th-biology', 
        '10th-biology',
        'plusone-zoology',
        'plusone-botany',
        'plustwo-zoology',
        'plustwo-botany'
      ]
    });
    await teacher.save();
    console.log('Sherin teacher account created');
  }

  // Create demo student if not exists
  const existingStudent = await User.findOne({ email: 'student@demo.com' });
  if (!existingStudent) {
    const student = new User({
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'password',
      role: 'student',
      subjects: ['9th-biology', '10th-biology']
    });
    await student.save();
    console.log('Demo student created');
  }
};

mongoose.connection.once('open', () => {
  initializeDemoData();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});