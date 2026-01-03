const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Get all documents for a user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new document
router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const newDocument = new Document({
      title: title || `Untitled Document - ${new Date().toLocaleDateString()}`,
      owner: req.user.id,
      createdBy: req.user.id,
      content: { ops: [{ insert: '\n' }] },
      participants: [{
        userId: req.user.id,
        name: 'Creator', // Default name
        role: 'creator',
        joinedAt: new Date()
      }]
    });

    // Fetch user for name consistency if needed
    const user = await mongoose.model('User').findById(req.user.id);
    if (user && user.username) {
      newDocument.participants[0].name = user.username;
    }
    
    const document = await newDocument.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a specific document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if user has access to document
    if (document.owner.toString() !== req.user.id && 
        !document.collaborators.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    
    // Check if ID is valid
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update document content
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, title } = req.body;
    
    // Find document
    let document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if user has access
    if (document.owner.toString() !== req.user.id && 
        !document.collaborators.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Update fields
    if (content) document.content = content;
    if (title) document.title = title;
    document.updatedAt = new Date();
    
    await document.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add collaborator to document
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { collaboratorId } = req.body;
    
    // Find document
    const document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if user is the owner
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the owner can add collaborators' });
    }
    
    // Check if collaborator is already added
    if (document.collaborators.includes(collaboratorId)) {
      return res.status(400).json({ msg: 'User is already a collaborator' });
    }
    
    // Add collaborator
    document.collaborators.push(collaboratorId);
    await document.save();
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if user is the owner
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the owner can delete this document' });
    }
    
    await Document.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;