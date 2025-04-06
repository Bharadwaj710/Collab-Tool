import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { emitTitleChange } from '../utils/socketClient.js';

const DocumentTitle = ({ initialTitle = 'Untitled Document' }) => {
  const { id: documentId } = useParams();
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);
  
  useEffect(() => {
    // Fetch session code for the document
    const fetchSessionCode = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        const data = await response.json();
        
        if (data.success) {
          setSessionCode(data.data.sessionCode);
        }
      } catch (error) {
        console.error('Error fetching document info:', error);
      }
    };
    
    if (documentId) {
      fetchSessionCode();
    }
  }, [documentId]);
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleTitleBlur = () => {
    setIsEditing(false);
    
    // Only emit if title has changed
    if (title !== initialTitle && title.trim() !== '') {
      emitTitleChange(documentId, title);
    } else if (title.trim() === '') {
      // Reset to initial title if empty
      setTitle(initialTitle);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };
  
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    // Could add a toast notification here
  };
  
  return (
    <div className="document-header">
      <div className="title-container">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="title-input"
          />
        ) : (
          <h1 
            className="document-title" 
            onClick={() => setIsEditing(true)}
          >
            {title}
          </h1>
        )}
      </div>
      
      {sessionCode && (
        <div className="session-code">
          <span>Session Code: {sessionCode}</span>
          <button onClick={copySessionCode} className="copy-btn">
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentTitle;