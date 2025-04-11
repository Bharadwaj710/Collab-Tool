const Document = require('./models/Document');

// In-memory document state for active documents
const documents = {};
const documentParticipants = {};

const setupSocketHandlers = (io) => {
  console.log('Setting up socket handlers');

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Handle joining a document
    socket.on('join-document', async ({ documentId, userId, username }) => {
      console.log(`User ${username} (${userId}) joining document: ${documentId}`);
      
      // Join the room for this document
      socket.join(documentId);
      
      // Add user to participants list
      if (!documentParticipants[documentId]) {
        documentParticipants[documentId] = [];
      }
      
      // Remove any existing entries for this user (in case of reconnect)
      documentParticipants[documentId] = documentParticipants[documentId].filter(
        p => p.userId !== userId
      );
      
      // Add the new participant
      documentParticipants[documentId].push({
        socketId: socket.id,
        userId,
        username
      });
      
      // Notify all clients about updated participants
      io.to(documentId).emit('participants-updated', documentParticipants[documentId]);
      
      try {
        // Load document from database or in-memory cache
        let documentData;
        
        if (documents[documentId]) {
          documentData = documents[documentId];
          console.log(`Using cached document: ${documentId}`);
        } else {
          // Try to load from database
          try {
            const doc = await Document.findById(documentId);
            if (doc) {
              documentData = {
                _id: doc._id,
                title: doc.title,
                content: doc.content
              };
              // Cache document
              documents[documentId] = documentData;
              console.log(`Loaded document from DB: ${documentId}`);
            } else {
              console.log(`Document not found in DB: ${documentId}`);
              documentData = { _id: documentId, title: 'Untitled Document', content: null };
            }
          } catch (err) {
            console.error(`Error loading document ${documentId} from DB:`, err);
            documentData = { _id: documentId, title: 'Untitled Document', content: null };
          }
        }
        
        // Send document data to the client that just joined
        socket.emit('load-document', documentData);
        
      } catch (err) {
        console.error('Error handling join-document:', err);
        socket.emit('error', { message: 'Error loading document' });
      }
    });
    
    // Handle document changes
    socket.on('send-changes', ({ documentId, delta }) => {
      // Broadcast changes to all other clients in the room
      socket.to(documentId).emit('receive-changes', delta);
    });
    
    // Handle document save
    socket.on('save-document', async ({ documentId, contents }) => {
      try {
        // Update in-memory cache
        if (documents[documentId]) {
          documents[documentId].content = contents;
        } else {
          documents[documentId] = { _id: documentId, content: contents };
        }
        
        // Save to database
        await Document.findByIdAndUpdate(documentId, { content: contents }, { new: true });
        console.log(`Document ${documentId} saved successfully`);
      } catch (err) {
        console.error(`Error saving document ${documentId}:`, err);
      }
    });
    
    // Handle title update
    socket.on('update-title', async ({ documentId, title }) => {
      try {
        // Update in-memory cache
        if (documents[documentId]) {
          documents[documentId].title = title;
        }
        
        // Broadcast title update to all clients in the room
        socket.to(documentId).emit('title-updated', { title });
        
        // Save to database
        await Document.findByIdAndUpdate(documentId, { title }, { new: true });
        console.log(`Document ${documentId} title updated to: ${title}`);
      } catch (err) {
        console.error(`Error updating document title ${documentId}:`, err);
      }
    });
    
    // Handle leaving a document
    socket.on('leave-document', ({ documentId, userId }) => {
      console.log(`User ${userId} leaving document: ${documentId}`);
      
      if (documentParticipants[documentId]) {
        // Remove user from participants list
        documentParticipants[documentId] = documentParticipants[documentId].filter(
          p => p.socketId !== socket.id
        );
        
        // Notify remaining clients about updated participants
        io.to(documentId).emit('participants-updated', documentParticipants[documentId]);
        
        // Clean up if no participants left
        if (documentParticipants[documentId].length === 0) {
          console.log(`No participants left in document ${documentId}, cleaning up`);
          delete documentParticipants[documentId];
          // Keep document in cache for a while in case someone rejoins
        }
      }
      
      // Leave the socket room
      socket.leave(documentId);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Find all documents this socket was participating in
      Object.keys(documentParticipants).forEach(docId => {
        const participant = documentParticipants[docId].find(p => p.socketId === socket.id);
        
        if (participant) {
          console.log(`User ${participant.userId} disconnected from document: ${docId}`);
          
          // Remove from participants list
          documentParticipants[docId] = documentParticipants[docId].filter(
            p => p.socketId !== socket.id
          );
          
          // Notify remaining clients
          io.to(docId).emit('participants-updated', documentParticipants[docId]);
          
          // Clean up if no participants left
          if (documentParticipants[docId].length === 0) {
            console.log(`No participants left in document ${docId}, cleaning up`);
            delete documentParticipants[docId];
          }
        }
      });
    });
  });
};

module.exports = setupSocketHandlers;