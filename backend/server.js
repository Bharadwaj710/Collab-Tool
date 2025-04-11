const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const setupSocketHandlers = require('./SocketHandler');

// Routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with proper CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, change to specific domains
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  pingTimeout: 60000, // Increase timeout
  transports: ['websocket', 'polling'] // Enable both transports
});

// Middleware
app.use(cors({
  origin: '*', // In production, change to specific domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabtool';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Prevent long connection attempts
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/users', authRoutes);
app.use('/api/documents', documentRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.send('CollabTool API is running');
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Socket.io setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down');
  mongoose.connection.close();
  server.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep server running despite errors
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep server running despite rejections
});