import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useAuth } from '../components/AuthContext.js';
import { getDocument } from '../services/documentService.js';

// Quill editor options
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
];

const SAVE_INTERVAL_MS = 2000;

const DocumentEditor = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [document, setDocument] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  // Refs
  const containerRef = useRef();
  const wrapperRef = useRef();

  // Load document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const docData = await getDocument(documentId);
        setDocument(docData);
        document.title = `${docData.title} | Collaboration Tool`;
      } catch (error) {
        console.error('Error loading document:', error);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  // Initialize Quill editor
  useEffect(() => {
    if (containerRef.current && !quill) {
      const editor = document.createElement('div');
      containerRef.current.append(editor);
      
      const q = new Quill(editor, { 
        theme: 'snow',
        modules: { 
          toolbar: TOOLBAR_OPTIONS 
        },
        placeholder: 'Start typing...'
      });
      
      // Set initial read-only until connected
      q.disable();
      q.setText('Loading...');
      
      setQuill(q);
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!quill || !documentId || !user) return;
    
    const s = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      query: {
        documentId,
        userId: user.id
      }
    });
    
    setSocket(s);
    
    return () => {
      s.disconnect();
    };
  }, [quill, documentId, user]);

  // Handle document join and listen for changes
  useEffect(() => {
    if (!socket || !quill || !documentId || !user || !document) return;
    
    // Join document room
    socket.emit('join-document', { 
      documentId, 
      userId: user.id,
      sessionCode: document.sessionCode
    });
    
    // Handle connection successful
    socket.on('connect', () => {
      setConnected(true);
      quill.enable();
      quill.setText('');
    });
    
    // Handle initial document content
    socket.on('session-data', (session) => {
      quill.setContents(session.document.content || {});
      setActiveUsers(session.participants.filter(p => p.isActive).map(p => p.user));
    });
    
    // Handle text changes from server
    socket.on('text-change', ({ delta, userId }) => {
      // Only apply changes from other users
      if (userId !== user.id) {
        quill.updateContents(delta);
      }
    });
    
    // Handle user joined
    socket.on('user-joined', ({ userId }) => {
      // Update active users list
      setActiveUsers(prev => {
        if (!prev.some(u => u._id === userId)) {
          return [...prev, { _id: userId }];
        }
        return prev;
      });
    });
    
    // Handle user left
    socket.on('user-left', ({ userId }) => {
      setActiveUsers(prev => prev.filter(u => u._id !== userId));
    });
    
    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('session-data');
      socket.off('text-change');
      socket.off('user-joined');
      socket.off('user-left');
      
      socket.emit('leave-document', { 
        documentId, 
        userId: user.id,
        sessionCode: document.sessionCode
      });
    };
  }, [socket, quill, documentId, user, document]);

  // Send text changes to server
  useEffect(() => {
    if (!socket || !quill || !connected) return;
    
    const textChangeHandler = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      
      socket.emit('text-change', {
        documentId,
        delta,
        userId: user.id
      });
    };
    
    quill.on('text-change', textChangeHandler);
    
    return () => {
      quill.off('text-change', textChangeHandler);
    };
  }, [socket, quill, documentId, user, connected]);

  // Auto-save document content
  useEffect(() => {
    if (!socket || !quill || !connected) return;
    
    const interval = setInterval(() => {
      // Send save event to server
      socket.emit('save-document', {
        documentId,
        content: quill.getContents()
      });
    }, SAVE_INTERVAL_MS);
    
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill, documentId, connected]);

  return (
    <div className="document-editor">
      {document && (
        <div className="document-header">
          <h2>{document.title}</h2>
          <div className="active-users">
            {activeUsers.map(u => (
              <span key={u._id} className="user-indicator">
                {u.username || 'Anonymous'}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="editor-container" ref={containerRef}>
        <div className="editor-wrapper" ref={wrapperRef}></div>
      </div>
    </div>
  );
};

export default DocumentEditor;