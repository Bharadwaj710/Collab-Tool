import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ProfileModal from '../components/ProfileModal';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [joinLink, setJoinLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user: currentUser, token, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !currentUser) {
      navigate('/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/documents', {
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
  }, [token, currentUser, navigate]);

  const handleCreateDocument = async () => {
    try {
      if (!token) return navigate('/login');
      
      setIsLoading(true);
      const response = await axios.post(
        '/api/documents',
        { title: `Untitled Document - ${new Date().toLocaleDateString()}` },
        { headers: { 'x-auth-token': token } }
      );
      
      navigate(`/documents/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/documents/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByLink = (e) => {
    e.preventDefault();
    let docId = joinLink.includes('/') ? joinLink.split('/').pop() : joinLink.trim();
    
    if (docId) {
      navigate(`/documents/${docId}`);
    } else {
      toast.warning("Please enter a valid document link or ID");
    }
  };
  
  const handleProfileSave = async (profileData) => {
    try {
      const response = await axios.put('/api/users/me', profileData, { headers: { 'x-auth-token': token } });
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      setShowProfileModal(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] pt-24 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-jb-accent selection:text-white font-urbanist">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-4xl font-bold text-jb-text tracking-tight mb-2">My Space</h1>
                <p className="text-jb-muted font-light text-lg">Manage your sessions and collaborative projects.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <form onSubmit={handleJoinByLink} className="flex gap-2 flex-grow sm:flex-grow-0">
                    <input
                        type="text"
                        placeholder="Paste Document ID or Link"
                        value={joinLink}
                        onChange={(e) => setJoinLink(e.target.value)}
                        className="w-full sm:w-64 bg-jb-panel border border-gray-700 text-jb-text rounded-lg px-4 py-2.5 focus:border-jb-accent focus:ring-1 focus:ring-jb-accent focus:outline-none placeholder-gray-600 transition-all shadow-sm"
                    />
                    <button type="submit" className="px-5 py-2.5 bg-jb-panel hover:bg-jb-surface text-jb-text rounded-lg border border-gray-700 font-medium transition-colors hover:border-gray-600">
                        Join
                    </button>
                </form>
                <button 
                    onClick={handleCreateDocument} 
                    className="px-6 py-2.5 bg-jb-accent hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 transform hover:scale-105" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                        </>
                    ) : (
                        <>
                           <span className="text-xl leading-none">+</span> New Session
                        </>
                    )}
                </button>
            </div>
        </header>

        {documents.length === 0 && !isLoading ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-jb-panel/50 rounded-2xl border border-gray-800 border-dashed"
            >
                <div className="w-20 h-20 bg-jb-surface rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-jb-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H6a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-jb-text mb-2">No active sessions</h3>
                <p className="text-jb-muted mb-8 max-w-sm mx-auto">Get started by creating a new document or joining an existing collaboration session.</p>
                <button onClick={handleCreateDocument} className="text-jb-accent hover:text-indigo-400 font-bold transition-colors">
                    Create your first document &rarr;
                </button>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc, index) => (
                    <motion.div 
                        key={doc._id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        onClick={() => navigate(`/documents/${doc._id}`)}
                        className="group relative bg-jb-panel border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-jb-accent/50 transition-all duration-300 shadow-lg"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jb-accent to-jb-secondary rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"/>
                        
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3 bg-jb-surface rounded-lg group-hover:bg-jb-accent/10 transition-colors">
                                <svg className="w-6 h-6 text-jb-muted group-hover:text-jb-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteDocument(e, doc._id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all transform hover:scale-110"
                                title="Delete Session"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        
                        <h5 className="text-lg font-bold text-gray-200 mb-2 line-clamp-1 group-hover:text-jb-accent transition-colors font-sans leading-tight">
                            {doc.title}
                        </h5>
                        
                        <div className="flex items-center text-xs font-mono text-gray-400 mt-6 pt-4 border-t border-gray-800 group-hover:border-gray-700 transition-colors">
                            <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
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
    </div>
  );
};

export default Dashboard;
