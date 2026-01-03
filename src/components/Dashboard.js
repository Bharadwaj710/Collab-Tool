import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from './ProfileModal';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [joinLink, setJoinLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/documents`, {
          headers: { 'x-auth-token': token },
        });
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
    
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { 'x-auth-token': token }
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [token, navigate]);

  const handleCreateDocument = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/api/documents`,
        { title: `Untitled Document - ${new Date().toLocaleDateString()}` },
        { headers: { 'x-auth-token': token } }
      );
      
      navigate(`/documents/${response.data._id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/api/documents/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByLink = (e) => {
    e.preventDefault();
    let docId;
    if (joinLink.includes('/')) {
      const urlParts = joinLink.split('/');
      docId = urlParts[urlParts.length - 1];
    } else {
      docId = joinLink.trim();
    }
    
    if (docId) {
      navigate(`/documents/${docId}`);
    } else {
      alert("Please enter a valid document link or ID");
    }
  };
  
  const openDocument = (id) => {
    navigate(`/documents/${id}`);
  };
  
 const handleProfileSave = async (profileData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/users/me`,
      profileData,
      { headers: { 'x-auth-token': token } }
    );

    // ✅ SINGLE SOURCE OF TRUTH
    const updatedUser = response.data;

    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // 🔥 FORCE NAVBAR + LANDING PAGE UPDATE
    window.dispatchEvent(new Event('storage'));

    setShowProfileModal(false);
    toast.success('Profile updated successfully!');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};
  
  const getAvatarUrl = (seed) => {
    if (!seed) return null;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4285f4,34a853,fbbc04,ea4335`;
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Documentation</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {currentUser && (
              <div 
                onClick={() => setShowProfileModal(true)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '50px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                title={`${currentUser.username} - ${currentUser.email}`}
              >
                <img 
                  src={getAvatarUrl(currentUser.profile?.avatarSeed || currentUser.username)}
                  alt="Profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #4285f4'
                  }}
                />
              </div>
            )}
            <form onSubmit={handleJoinByLink} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Document ID or Link"
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    className="form-control"
                    style={{ width: '250px' }}
                />
                <button type="submit" className="btn btn-outline-primary">Join Room</button>
            </form>
            <button onClick={handleCreateDocument} className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : '+ New Document'}
            </button>
        </div>
      </header>

      {documents.length === 0 && !isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <p>You haven't created any documents yet.</p>
            <button onClick={handleCreateDocument} className="btn btn-link">Create your first one</button>
        </div>
      ) : (
        <div className="row g-4">
          {documents.map((doc) => (
            <div key={doc._id} className="col-md-4 col-sm-6">
              <div 
                className="card h-100 shadow-sm" 
                onClick={() => openDocument(doc._id)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <h5 className="card-title">{doc.title}</h5>
                  <p className="card-text text-muted small">
                    Last updated: {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-0 d-flex justify-content-end">
                    <button 
                        onClick={(e) => handleDeleteDocument(e, doc._id)}
                        className="btn btn-sm btn-outline-danger"
                    >
                        Delete
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showProfileModal && currentUser && (
        <ProfileModal 
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default Dashboard;