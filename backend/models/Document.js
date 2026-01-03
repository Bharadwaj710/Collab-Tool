const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: Object,
    default: { ops: [{ insert: '\n' }] }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['creator', 'interviewer', 'candidate', 'participant'], 
      default: 'participant' 
    },
    candidate: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['connected', 'disconnected'], 
      default: 'connected' 
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  problemStatement: {
    type: String,
    default: ""
  },
  timer: {
    duration: { type: Number, default: 0 }, // in seconds
    remaining: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
    lastUpdatedAt: { type: Date, default: Date.now }
  },
  notes: [{
    authorId: { type: String },
    text: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  chat: [{
    senderName: { type: String },
    senderId: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);