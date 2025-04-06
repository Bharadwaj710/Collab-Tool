import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import { getSocket, initSocket } from '../../services/socketService';
import api from '../../services/api';
import EditorToolbar from './EditorToolbar';
import CollaboratorsList from './CollaboratorsList';
import { useAuth } from '../../context/AuthContext';

// Register Quill modules
Quill.register('modules/cursors', QuillCursors);

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['link', 'image'],
  [{ color: [] }, { background: [] }],
  ['clean'],
];

const TextEditor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const cursorsRef = useRef(null);
  
  // Set up the editor when component mounts
  useEffect(() => {
    if (!documentId) return;
    
    const setupEditor = async () => {
      try {
        // Fetch document details
        setLoading(true);
        const { data } = await api.get(`/documents/${documentId}`);
        setDocument(data);
        
        // Initialize Quill editor
        if (!quillRef.current) {
          // Configure Quill
          const quill = new Quill(editorRef.current, {
            modules: {
              toolbar: '#toolbar',
              cursors: {
                transformOnTextChange: true,
              },
            },
            scrollingContainer: 'html',
            theme: 'snow',
          });
          
          quillRef.current = quill;
          cursorsRef.current = quill.getModule('cursors');
          
          // Initialize with document content
          if (data.content && data.content.ops) {
            quill.setContents(data.content);
          }
          
          // Set up Socket.IO for realtime collaboration
          const socket = initSocket();
          socketRef.current = socket;
          
          if (socket) {
            // Join document room
            socket.emit('join-document', { documentId });
            
            // Handle received changes from other users
            socket.on('receive-changes', ({ delta, userId }) => {
              if (userId !== user?._id) {
                quill.updateContents(delta);
              }
            });
            
            // Handle cursor updates from other users
            socket.on('cursor-update', ({ userId, range, username }) => {
              if (userId !== user?._id && cursorsRef.current) {
                cursorsRef.current.createCursor(userId, username, getRandomColor());
                cursorsRef.current.moveCursor(userId, range);
              }
            });
            
            // Handle active users updates
            socket.on('active-users', ({ users }) => {
              setActiveUsers(users);
            });
            
            // Handle initial document loading
            socket.on('load-document', ({ content }) => {
              if (content && content.ops) {
                quill.setContents(content);
                quill.enable();
              }
            });
            
            // Handle errors
            socket.on('error', (err) => {
              setError(err.message || 'An error occurred');
            });
            
            // Text change handler
            quill.on('text-change', (delta, oldDelta, source) => {
              if (source === 'user') {
                socket.emit('text-change', {
                  documentId,
                  delta: quill.getContents(),
                  source,
                });
                
                // Auto save to database (debounced)
                handleSave(quill.getContents());
              }
            });
            
            // Selection change handler for cursor position
            quill.on('selection-change', (range) => {
              if (range) {
                socket.emit('cursor-position', {
                  documentId,
                  range,
                  userId: user?._id,
                });
              }
            });
          }
        }
      } catch (err) {
        setError('Failed to load document');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    setupEditor();
    
    // Cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-document', { documentId });
      }
    };
  }, [documentId, user]);
  
  // Debounced save function
  const saveTimeoutRef = useRef(null);
  const handleSave = (content) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await api.put(`/documents/${documentId}`, {
          content,
        });
      } catch (err) {
        console.error('Error saving document:', err);
      } finally {
        setSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity
  };
  
  // Generate random colors for cursor
  const getRandomColor = () => {
    const colors = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#3F51B5'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Back to dashboard handler
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return <div className="loading">Loading document...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={handleBack} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="text-editor-container">
      <div className="document-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem' 
      }}>
        <div>
          <h2>{document?.title || 'Untitled Document'}</h2>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {saving ? 'Saving...' : 'All changes saved'}
          </div>
        </div>
        <button onClick={handleBack} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
      
      <div className="editor-wrapper" style={{ 
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff'
      }}>
        <EditorToolbar />
        <div 
          ref={editorRef} 
          style={{ 
            height: '400px',
            overflowY: 'auto'
          }}
        />
      </div>
      
      <CollaboratorsList activeUsers={activeUsers} />
    </div>
  );
};

export default TextEditor;