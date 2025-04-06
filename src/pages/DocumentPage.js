import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextEditor from './TextEditor/TextEditor.js';
import DocumentTitle from '../components/DocumentTitle.js';
import UserList from '../components/UserList.js';
import Chat from '../components/ChatBox.js';
import { useAuth } from '../utils/contexts/AuthContext.js';
import { initializeSocket, joinDocument, leaveDocument } from '../utils/socketClient.js';

const DocumentPage = () => {
  const { id: documentId } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser || !token) {
      navigate('/login');
      return;
    }
    
    // Initialize socket connection
    const socket = initializeSocket(token);
    
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch document');
        }
        
        setDocument(data.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    // Socket event callbacks
    const callbacks = {
      onUserJoined: ({ user, activeUsers }) => {
        setActiveUsers(activeUsers);
      },
      
      onUserLeft: ({ userId, activeUsers }) => {
        setActiveUsers(activeUsers);
      },
      
      onNewMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      
      onTitleChanged: ({ title }) => {
        setDocument(prev => prev ? { ...prev, title } : null);
      }
    };
    
    if (documentId) {
      fetchDocument();
      joinDocument(documentId, callbacks);
    }
    
    return () => {
      leaveDocument(documentId);
    };
  }, [documentId, currentUser, token, navigate]);
  
  if (isLoading) {
    return <div className="loading">Loading document...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!document) {
    return <div className="error">Document not found</div>;
  }
  
  return (
    <div className="document-page">
      <div className="document-header">
        <DocumentTitle initialTitle={document.title} />
        <div className="toolbar">
          {/* Additional toolbar buttons can go here */}
          <button onClick={() => navigate('/documents')}>
            Back to Documents
          </button>
        </div>
      </div>
      
      <div className="document-content">
        <div className="main-content">
          <TextEditor />
        </div>
        
        <div className="sidebar">
          <UserList activeUsers={activeUsers} />
          <Chat 
            messages={messages} 
            onNewMessage={(message) => setMessages(prev => [...prev, message])}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;