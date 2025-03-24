import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  // Define a ref for the "Create New Document" button
  const createButtonRef = useRef(null);

  useEffect(() => {
    // Simulate API call to fetch user's documents
    const fetchDocuments = () => {
      setTimeout(() => {
        const dummyDocuments = [
          { id: 1, title: 'Project Proposal', updatedAt: '2025-03-15T14:22:00Z', collaborators: 3 },
          { id: 2, title: 'Meeting Notes', updatedAt: '2025-03-18T09:45:00Z', collaborators: 2 },
          { id: 3, title: 'Marketing Strategy', updatedAt: '2025-03-20T11:30:00Z', collaborators: 5 }
        ];
        
        setDocuments(dummyDocuments);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchDocuments();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const createNewDocument = () => {
    // Redirect to video collaboration page with a new document
    console.log('Creating new document and redirecting to video collaboration');
    navigate('/document/1', { 
      state: { 
        isNewDocument: true,
        documentTitle: 'Untitled Document'
      } 
    });
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      console.log(`Joining session with code: ${joinCode}`);
      navigate('/video-collaboration', { 
        state: { 
          isJoining: true,
          joinCode: joinCode
        } 
      });
    }
  };

  const handleDocumentClick = (id) => {
    navigate(`/document/${id}`);
  };

  const handleFeatureClick = (feature) => {
    console.log(`Feature clicked: ${feature}`);
    // Handle different features
    switch(feature) {
      case 'video':
        navigate('/video-collaboration');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'share':
        navigate('/share-documents');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Documents</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={createNewDocument} ref={createButtonRef}>
            Create New Document
          </button>
          <form className="join-form" onSubmit={handleJoinSession}>
            <input 
              type="text" 
              placeholder="Enter join code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="join-code-input"
            />
            <button type="submit" className="join-btn">Join</button>
          </form>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Documents
        </button>
        <button 
          className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          Shared With Me
        </button>
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button 
          className={`tab-button ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          Archived
        </button>
      </div>
      
      {/* Feature Buttons */}
      <div className="feature-buttons">
        <button 
          className="feature-button" 
          onClick={() => handleFeatureClick('video')}
        >
          <div className="feature-icon video-icon"></div>
          <span>Video Collaboration</span>
        </button>
        <button 
          className="feature-button"
          onClick={() => handleFeatureClick('chat')}
        >
          <div className="feature-icon chat-icon"></div>
          <span>Chat</span>
        </button>
        <button 
          className="feature-button"
          onClick={() => handleFeatureClick('share')}
        >
          <div className="feature-icon share-icon"></div>
          <span>Share Documents</span>
        </button>
        <button 
          className="feature-button"
          onClick={() => handleFeatureClick('analytics')}
        >
          <div className="feature-icon analytics-icon"></div>
          <span>Analytics</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading your documents...</div>
      ) : (
        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="no-documents">
              <p>You don't have any documents yet. Create your first one!</p>
            </div>
          ) : (
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Last Updated</th>
                  <th>Collaborators</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} onClick={() => handleDocumentClick(doc.id)} style={{cursor: 'pointer'}}>
                    <td>{doc.title}</td>
                    <td>{formatDate(doc.updatedAt)}</td>
                    <td>{doc.collaborators}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="action-btn edit" onClick={() => navigate(`/document/${doc.id}`)}>Edit</button>
                      <button className="action-btn share">Share</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;