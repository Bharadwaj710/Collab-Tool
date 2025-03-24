import React from 'react';
import { useParams } from 'react-router-dom';
import VideoCollaboration from '../components/VideoCollaboration';
import './Document.css';

const Document = () => {
  const { id } = useParams();
  
  // Mock data for active users
  const activeUsers = [
    { id: 1, name: 'John Doe', color: '#ff4081' },
    { id: 2, name: 'Jane Smith', color: '#ffa000' },
    { id: 3, name: 'Alex Johnson', color: '#9c27b0' }
  ];

  // Mock chat messages
  const messages = [
    { user: 'John Doe', text: 'Hey team, I added the introduction section.', timestamp: '10:30 AM' },
    { user: 'Jane Smith', text: 'Looks good! I\'ll work on the methodology part.', timestamp: '10:32 AM' }
  ];

  return (
    <div className="document-page">
      <div className="document-header">
        <h1>Untitled Document</h1>
        <div className="document-toolbar">
          <button className="toolbar-btn bold">B</button>
          <button className="toolbar-btn italic">I</button>
          <button className="toolbar-btn underline">U</button>
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn">Left</button>
          <button className="toolbar-btn">Center</button>
          <button className="toolbar-btn">Right</button>
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn">List</button>
          <button className="toolbar-btn">Link</button>
          <button className="toolbar-btn">Image</button>
        </div>
      </div>

      <div className="document-content">
        <div className="left-panel">
          <VideoCollaboration />
        </div>
        
        <div className="main-editor">
          <div className="editor-placeholder">
            <div className="editor-cursor"></div>
          </div>
        </div>
        
        <div className="right-panel">
          <div className="document-link">
            <h3>Document Link</h3>
            <div className="link-container">
              <input 
                type="text" 
                value={`https://jigsawcollab.vercel.app/document/${id}`} 
                readOnly 
              />
              <button className="copy-btn">□</button>
            </div>
          </div>
          
          <div className="active-users">
            <h3>Active Users</h3>
            <ul className="users-list">
              {activeUsers.map(user => (
                <li key={user.id} className="user-item">
                  <div className="user-avatar" style={{ backgroundColor: user.color }}></div>
                  <span className="user-name">{user.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="chat-section">
            <h3>Chat <button className="minimize-btn">Minimize</button></h3>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <div className="message-header">
                    <span className="message-user">{msg.user}</span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;