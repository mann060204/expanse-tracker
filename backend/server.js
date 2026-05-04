const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Database Connection Middleware
// In a serverless environment like Vercel, this ensures the DB connects before handling the route
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in environment variables.");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast if not connected
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    };
    // Trim to remove any accidental invisible spaces pasted from the dashboard
    const uri = process.env.MONGO_URI.trim();
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('Connected to MongoDB Atlas');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    throw e;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    // If DB fails, return 500 instantly so the frontend doesn't hang forever
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Basic route
app.get('/api', (req, res) => {
  res.send('SPEIT API is running correctly on Vercel!');
});

// Local Development Server (Ignored by Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Local dev server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
