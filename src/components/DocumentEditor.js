import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DocumentEditor = () => {
  const { id: documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const quillRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { id: 'guest', username: 'Guest' };
  const token = localStorage.getItem('token');
  
  // Redirect if no authentication
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);
  
  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching document ${documentId} with token:`, token);
        
        // For testing without backend, create mock document
        if (!API_URL || API_URL === 'http://localhost:5000') {
          console.log("Using mock document data");
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mockDocument = {
            _id: documentId,
            title: `Untitled Document - ${new Date().toLocaleDateString()}`,
            content: null,
            updatedAt: new Date().toISOString()
          };
          
          setDocument(mockDocument);
          setTitle(mockDocument.title);
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/documents/${documentId}`, {
          headers: { 'x-auth-token': token }
        });
        
        console.log("Document data received:", response.data);
        setDocument(response.data);
        setTitle(response.data.title);
        
        // If document has content, set it
        if (response.data.content && quillRef.current) {
          quillRef.current.getEditor().setContents(response.data.content);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching document:', error);
        
        // Don't redirect automatically, just show the error
        setError('Could not load document. It may not exist or you may not have permission to view it.');
        setIsLoading(false);
        
        // Create a blank document anyway to prevent redirect
        setDocument({
          _id: documentId,
          title: `Untitled Document`,
          content: null,
          updatedAt: new Date().toISOString()
        });
        setTitle(`Untitled Document`);
      }
    };
    
    if (documentId && token) {
      fetchDocument();
    }
  }, [documentId, token, navigate]);
  
  // Socket.io setup
  useEffect(() => {
    if (!documentId) return;
    
    console.log("Initializing socket connection to:", API_URL);
    
    // For testing without backend
    if (!API_URL || API_URL === 'http://localhost:5000') {
      console.log("Using mock socket for development");
      // Add a mock participant after a delay
      setTimeout(() => {
        setParticipants([
          { socketId: 'mock-user-1', username: 'Current User (You)', userId: user.id }
        ]);
      }, 1000);
      
      return;
    }
    
    // Create new socket connection
    const newSocket = io(API_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = newSocket;
    
    newSocket.on('connect', () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
      
      // Join document room immediately after connection
      newSocket.emit('join-document', {
        documentId,
        userId: user.id,
        username: user.username || user.email || 'Anonymous'
      });
    });
    
    newSocket.on('connect_error', (err) => {
      console.error("Socket connection error:", err);
      setError(`Could not connect to server: ${err.message}`);
      
      // Add current user to participants list even if socket fails
      setParticipants([{ 
        socketId: 'local-user', 
        username: `${user.username || user.email || 'You'} (offline mode)`,
        userId: user.id
      }]);
    });
    
    // Set up event handlers
    newSocket.on('load-document', (documentData) => {
      console.log("Document content received from socket");
      if (quillRef.current && documentData.content) {
        quillRef.current.getEditor().setContents(documentData.content);
      }
      if (documentData.title) {
        setTitle(documentData.title);
      }
    });
    
    newSocket.on('receive-changes', (delta) => {
      console.log("Received changes from server");
      if (quillRef.current) {
        quillRef.current.getEditor().updateContents(delta);
      }
    });
    
    newSocket.on('participants-updated', (updatedParticipants) => {
      console.log("Participants updated:", updatedParticipants);
      setParticipants(updatedParticipants);
    });
    
    return () => {
      if (newSocket) {
        console.log("Disconnecting socket");
        newSocket.emit('leave-document', { documentId, userId: user.id });
        newSocket.disconnect();
      }
    };
  }, [documentId, user.id, user.username, user.email, API_URL]);
  
  // Setup Quill editor to send changes to server
  useEffect(() => {
    if (!quillRef.current || !socket) return;
    
    const quill = quillRef.current.getEditor();
    
    const handleChange = (delta, oldContents, source) => {
      if (source !== 'user') return;
      
      console.log("Sending changes to server");
      socket.emit('send-changes', { documentId, delta });
      
      // Debounce save to server
      handleSaveDocument();
    };
    
    quill.on('text-change', handleChange);
    
    return () => {
      quill.off('text-change', handleChange);
    };
  }, [socket, documentId]);
  
  // Debounced save function
  const saveTimeout = useRef(null);
  
  const handleSaveDocument = () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(async () => {
      if (!quillRef.current || !documentId || !token) return;
      
      try {
        setIsSaving(true);
        const quill = quillRef.current.getEditor();
        const contents = quill.getContents();
        
        console.log("Saving document to server");
        
        // For testing without backend
        if (!API_URL || API_URL === 'http://localhost:5000') {
          console.log("Mock saving document:", { content: contents, title });
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsSaving(false);
          return;
        }
        
        if (socket && socket.connected) {
          socket.emit('save-document', { documentId, contents });
        }
        
        // Also save to database
        await axios.put(
          `${API_URL}/api/documents/${documentId}`,
          { content: contents, title },
          { headers: { 'x-auth-token': token } }
        );
        
        console.log("Document saved successfully");
      } catch (error) {
        console.error("Error saving document:", error);
        setError("Failed to save document. Changes may be lost if you leave the page.");
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity
  };
  
  // Save title changes
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleTitleBlur = async () => {
    if (!documentId || !token) return;
    
    try {
      // For testing without backend
      if (!API_URL || API_URL === 'http://localhost:5000') {
        console.log("Mock updating title:", title);
        return;
      }
      
      await axios.put(
        `${API_URL}/api/documents/${documentId}`,
        { title },
        { headers: { 'x-auth-token': token } }
      );
      console.log("Title updated successfully");
      
      // Also update via socket if connected
      if (socket && socket.connected) {
        socket.emit('update-title', { documentId, title });
      }
    } catch (error) {
      console.error("Error updating title:", error);
      setError("Failed to update document title");
    }
  };
  
  // Copy room link to clipboard
  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        // Fallback for browsers that don't support clipboard API
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Link copied to clipboard!');
      });
  };
  
  // Leave document
  const handleLeave = () => {
    // Ensure we emit leave-document before navigating away
    if (socketRef.current) {
      socketRef.current.emit('leave-document', { documentId, userId: user.id });
    }
    navigate('/dashboard');
  };
  
  // Define Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ]
  };
  
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'image'
  ];
  
  if (isLoading) {
    return (
      <div className="document-loading">
        <div className="loading-spinner"></div>
        <p>Loading document...</p>
      </div>
    );
  }
  
  return (
    <div className="document-editor">
      <style>{`
        /* Document Editor Styles */
        .document-editor {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .editor-header {
          background-color: #f8f9fa;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .document-title {
          flex: 1;
          margin: 0;
          padding: 0.5rem;
          font-size: 1.5rem;
          color: #343a40;
          font-weight: 600;
          border: 1px solid transparent;
          border-radius: 4px;
          background-color: transparent;
        }
        
        .document-title:focus {
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          background-color: white;
        }
        
        .save-status {
          font-size: 0.85rem;
          color: #6c757d;
          margin-left: 1rem;
        }
        
        .editor-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .sidebar {
          width: 280px;
          background-color: #f8f9fa;
          border-right: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
        
        .participants-list {
          margin-bottom: 1rem;
        }
        
        .participants-list h3 {
          font-size: 1rem;
          color: #343a40;
          margin-bottom: 0.5rem;
        }
        
        .participant-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 4px;
          margin-bottom: 0.25rem;
        }
        
        .participant-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #4285f4;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 0.75rem;
        }
        
        .participant-name {
          font-size: 0.9rem;
          color: #343a40;
        }
        
        .actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }
        
        .editor-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .error-message {
          color: #d93025;
          padding: 0.5rem;
          margin: 0.5rem;
          border-radius: 4px;
          background-color: #fce8e6;
        }
        
        .document-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f8f9fa;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Override ReactQuill styles for better integration */
        .editor-wrapper .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .editor-wrapper .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 16px;
        }
        
        .editor-wrapper .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e9ecef;
          background-color: #f8f9fa;
        }
        
        /* Button styles */
        .btn {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        
        .btn-primary {
          background-color: #4285f4;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #3367d6;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        
        /* Media queries for responsiveness */
        @media (max-width: 768px) {
          .editor-container {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid #e9ecef;
          }
          
          .actions {
            flex-direction: row;
            justify-content: space-between;
            padding-top: 0.5rem;
          }
          
          .btn {
            flex: 1;
          }
        }
      `}</style>
      
      <div className="editor-header">
        <input
          type="text"
          className="document-title"
          value={title || 'Untitled Document'}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
        />
        <div className="save-status">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="editor-container">
        <div className="sidebar">
          <div className="participants-list">
            <h3>Participants ({participants.length})</h3>
            {participants.length === 0 && (
              <div className="participant-item">
                <div className="participant-avatar">
                  {user.username ? user.username[0].toUpperCase() : 'Y'}
                </div>
                <div className="participant-name">
                  {user.username || user.email || 'You'} (Only you)
                </div>
              </div>
            )}
            {participants.map((participant) => (
              <div key={participant.socketId} className="participant-item">
                <div className="participant-avatar">
                  {participant.username ? participant.username[0].toUpperCase() : '?'}
                </div>
                <div className="participant-name">
                  {participant.username || 'Anonymous'}
                  {participant.userId === user.id ? ' (You)' : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="actions">
            <button onClick={copyLinkToClipboard} className="btn btn-primary">
              Copy Link
            </button>
            <button onClick={handleLeave} className="btn btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <div className="editor-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Start typing..."
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;