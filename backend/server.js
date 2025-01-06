// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const fs = require('fs');

// const authRoutes = require('./routes/auth');
// const recipeRoutes = require('./routes/recipes');
// const userRoutes = require('./routes/users');
// const contactRoutes = require('./routes/contact');
// const blogRoutes = require('./routes/blogs'); // Add this line
// const checkTokenExpiration = require('./middleware/checkTokenExpiration');

// dotenv.config();

// const app = express();

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static('uploads'));
// app.use(checkTokenExpiration);

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/blogs', blogRoutes); // Add this line

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blogs');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://reci-food-client.vercel.app/', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method 
  });
});

// Export the Express API
module.exports = app;

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}