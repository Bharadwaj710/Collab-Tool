import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './VideoCollaboration.css';

const VideoCollaboration = () => {
  // State for document and session
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [sessionCode, setSessionCode] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  
  // Video call states
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(true);
  
  // UI states
  const [activeTab, setActiveTab] = useState('editor');
  const [showFeatures, setShowFeatures] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const localVideoRef = useRef(null);
  const editorRef = useRef(null);
  
  useEffect(() => {
    // Check if this is a new document or joining session from the state
    const state = location.state || {};
    
    if (state.isNewDocument) {
      // Set document title from state or use default
      setDocumentTitle(state.documentTitle || 'Untitled Document');
      
      // Generate a random session code for new documents
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSessionCode(randomCode);
      
      // Set default content for new document
      setDocumentContent('Start typing your document here...');
    } else if (state.isJoining && state.joinCode) {
      // Set the join code from state
      setSessionCode(state.joinCode);
      
      // In a real app, you would fetch document details based on the join code
      setDocumentTitle('Shared Document');
      setDocumentContent('This is a shared document. Start collaborating!');
    } else {
      // Default case - new blank document
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSessionCode(randomCode);
    }
    
    // Simulating connection to video call
    const connectToSession = async () => {
      setTimeout(() => {
        setIsConnected(true);
        // Mock participants
        setParticipants([
          { id: 1, name: 'Jane Smith', isVideoOn: true, isMuted: false },
          { id: 2, name: 'John Doe', isVideoOn: true, isMuted: true },
        ]);
        
        // Mock getting local video
        if (localVideoRef.current) {
          console.log('Local video ref initialized');
        }
      }, 1500);
    };
    
    connectToSession();
    
    // Focus on editor if it exists
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    return () => {
      // Cleanup function - disconnect from video service
      console.log('Disconnecting from video session');
    };
  }, [location]);
  
  // Video call controls
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleCollaborationPanel = () => setShowCollaborationPanel(!showCollaborationPanel);
  
  const endCall = () => {
    console.log('Ending call and returning to dashboard');
    navigate('/');
  };

  const handleUserClick = (participant) => {
    setSelectedUser(participant);
    console.log(`Selected user: ${participant.name}`);
  };

  const navigateToDashboard = () => {
    if (window.confirm('Are you sure you want to leave this collaboration? Changes might not be saved.')) {
      navigate('/');
    }
  };

  // Handle feature buttons
  const handleFeatureClick = (feature) => {
    console.log(`Feature clicked: ${feature}`);
    
    switch(feature) {
      case 'chat':
        setActiveTab('chat');
        break;
      case 'share':
        // Show a mock share dialog
        window.prompt('Share this session code with collaborators:', sessionCode);
        break;
      case 'save':
        alert('Document saved successfully!');
        break;
      case 'history':
        setActiveTab('history');
        break;
      default:
        break;
    }
  };

  // Toggle features panel
  const toggleFeatures = () => setShowFeatures(!showFeatures);
  
  // Generate a shareable link
  const getShareableLink = () => {
    return `https://yourapp.com/join/${sessionCode}`;
  };
  
  // Copy session code to clipboard
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode)
      .then(() => {
        alert('Session code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy session code: ', err);
      });
  };

  return (
    <div className="video-collab-container">
      {}
      <div className="video-header">
        <div className="left-header">
          <h2>Video Collaboration</h2>
          <div className="document-info">
            <input 
              type="text" 
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="document-title-input"
              placeholder="Enter document title"
            />
            {sessionCode && (
              <div className="session-code">
                <span>Session Code: </span>
                <strong>{sessionCode}</strong>
                <button 
                  className="copy-code-btn" 
                  onClick={copySessionCode}
                  title="Copy session code"
                >
                  📋
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="right-header">
          <div className="session-info">
            {isConnected ? (
              <span className="connected">Connected</span>
            ) : (
              <span className="connecting">Connecting...</span>
            )}
          </div>
          <button 
            className="panel-toggle" 
            onClick={toggleCollaborationPanel}
            title={showCollaborationPanel ? "Hide collaboration panel" : "Show collaboration panel"}
          >
            {showCollaborationPanel ? '👥 Hide Panel' : '👥 Show Panel'}
          </button>
          <button 
            className="features-toggle" 
            onClick={toggleFeatures}
            title={showFeatures ? "Hide features" : "Show features"}
          >
            {showFeatures ? '⚙️ Hide Features' : '⚙️ Show Features'}
          </button>
          <button 
            className="dashboard-link" 
            onClick={navigateToDashboard}
            title="Return to dashboard"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {}
      {showFeatures && (
        <div className="feature-buttons">
          <button 
            className={`feature-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <div className="feature-icon document-icon"></div>
            <span>Document</span>
          </button>
          <button 
            className={`feature-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <div className="feature-icon chat-icon"></div>
            <span>Chat</span>
          </button>
          <button 
            className="feature-button"
            onClick={() => handleFeatureClick('share')}
          >
            <div className="feature-icon share-icon"></div>
            <span>Share</span>
          </button>
          <button 
            className="feature-button"
            onClick={() => handleFeatureClick('save')}
          >
            <div className="feature-icon save-icon"></div>
            <span>Save</span>
          </button>
          <button 
            className={`feature-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleFeatureClick('history')}
          >
            <div className="feature-icon history-icon"></div>
            <span>History</span>
          </button>
        </div>
      )}
      
      {}
      <div className="main-content-area">
        {}
        <div className="content-panel">
          {activeTab === 'editor' && (
            <div className="document-editor">
              <textarea
                ref={editorRef}
                className="editor-textarea"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Start typing your document here..."
              />
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="chat-panel">
              <div className="chat-messages">
                <div className="message system-message">
                  <p>Welcome to the chat! You can communicate with other participants here.</p>
                </div>
                <div className="message">
                  <div className="message-header">
                    <span className="sender">Jane Smith</span>
                    <span className="timestamp">10:32 AM</span>
                  </div>
                  <p>Hello everyone! Let's collaborate on this document.</p>
                </div>
                <div className="message">
                  <div className="message-header">
                    <span className="sender">John Doe</span>
                    <span className="timestamp">10:34 AM</span>
                  </div>
                  <p>Sounds good! I have some ideas for the introduction.</p>
                </div>
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type your message here..."
                />
                <button className="send-message-btn">Send</button>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="history-panel">
              <h3>Document History</h3>
              <div className="history-entries">
                <div className="history-entry">
                  <div className="history-entry-header">
                    <span className="history-user">You</span>
                    <span className="history-time">11:45 AM</span>
                  </div>
                  <div className="history-description">Created document</div>
                </div>
                <div className="history-entry">
                  <div className="history-entry-header">
                    <span className="history-user">Jane Smith</span>
                    <span className="history-time">11:50 AM</span>
                  </div>
                  <div className="history-description">Edited introduction</div>
                </div>
                <div className="history-entry">
                  <div className="history-entry-header">
                    <span className="history-user">John Doe</span>
                    <span className="history-time">12:05 PM</span>
                  </div>
                  <div className="history-description">Added second paragraph</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {}
        {showCollaborationPanel && (
          <div className="collaboration-panel">
            <div className="video-grid">
              {}
              <div className="video-container local-video">
                <div className={`video-frame ${isVideoOff ? 'video-off' : ''} ${selectedUser === null ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(null)}>
                  {isVideoOff ? (
                    <div className="video-placeholder">
                      <span className="initials">ME</span>
                    </div>
                  ) : (
                    <div className="mock-video">
                      <video ref={localVideoRef} autoPlay muted />
                      <div className="mock-video-placeholder">You</div>
                    </div>
                  )}
                  <div className="participant-info">
                    <span className="participant-name">You</span>
                    {isMuted && <span className="muted-indicator">🔇</span>}
                  </div>
                </div>
              </div>
              
              {}
              {participants.map(participant => (
                <div key={participant.id} className="video-container">
                  <div 
                    className={`video-frame ${!participant.isVideoOn ? 'video-off' : ''} ${selectedUser === participant ? 'selected' : ''}`}
                    onClick={() => handleUserClick(participant)}
                  >
                    {!participant.isVideoOn ? (
                      <div className="video-placeholder">
                        <span className="initials">{participant.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    ) : (
                      <div className="mock-video">
                        <div className="mock-video-placeholder">{participant.name}</div>
                      </div>
                    )}
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      {participant.isMuted && <span className="muted-indicator">🔇</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {}
            <div className="video-controls">
              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`} 
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
              <button 
                className={`control-btn ${isVideoOff ? 'active' : ''}`} 
                onClick={toggleVideo}
                title={isVideoOff ? "Start Video" : "Stop Video"}
              >
                {isVideoOff ? '📷 Start Video' : '📷 Stop Video'}
              </button>
              <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`} 
                onClick={toggleScreenShare}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                {isScreenSharing ? '🖥️ Stop Sharing' : '🖥️ Share Screen'}
              </button>
              <button 
                className="control-btn end-call" 
                onClick={endCall}
                title="End Call"
              >
                ❌ End Call
              </button>
            </div>
            
            {}
            <div className="participants-panel">
              <h3>Participants</h3>
              <ul className="participants-list">
                <li className={selectedUser === null ? 'active' : ''} onClick={() => setSelectedUser(null)}>
                  You (Host)
                </li>
                {participants.map(participant => (
                  <li 
                    key={participant.id} 
                    className={selectedUser === participant ? 'active' : ''}
                    onClick={() => handleUserClick(participant)}
                  >
                    {participant.name} {participant.isMuted && '🔇'}
                  </li>
                ))}
              </ul>
              <div className="invite-section">
                <h4>Invite others</h4>
                <p>Share this code: <strong>{sessionCode}</strong></p>
                <div className="invite-actions">
                  <button 
                    className="invite-btn copy-link"
                    onClick={() => {
                      navigator.clipboard.writeText(getShareableLink());
                      alert('Link copied to clipboard!');
                    }}
                  >
                    Copy Link
                  </button>
                  <button 
                    className="invite-btn copy-code"
                    onClick={copySessionCode}
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {}
      {isScreenSharing && (
        <div className="screen-sharing-indicator">
          You are currently sharing your screen
        </div>
      )}
    </div>
  );
};

export default VideoCollaboration;