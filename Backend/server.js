const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const Contact = require('./models/Contact');
require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.post('/contact', upload.single('file'), async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const file = req.file;

    const newContact = new Contact({
      name,
      email,
      phone,
      service,
      message,
      filePath: file ? file.path : null
    });

    await newContact.save();

    res.status(200).json({ success: true, message: "Message submitted successfully." });
  } catch (error) {
    console.error("Error in /contact:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("🚀 Server started on http://localhost:3000"));