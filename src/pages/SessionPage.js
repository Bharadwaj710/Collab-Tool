import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useSocket } from '../context/AuthContext';
import DocumentEditor from '../components/document/DocumentEditor';
import ParticipantList from '../components/session/ParticipantList';
import ChatBox from '../components/chat/ChatBox';
import VideoCall from '../components/session/VideoCall';
import { getSessionByCode, endSession } from '../services/socketService';

const SessionPage = () => {
  const { sessionCode } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  
  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSessionByCode(sessionCode);
        setSession(sessionData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionCode) {
      fetchSession();
    }
  }, [sessionCode]);
  
  // Handle session events
  useEffect(() => {
    if (!socket || !session) return;
    
    // Handle participant joined
    const handleUserJoined = ({ userId, user: userData }) => {
      setSession(prev => ({
        ...prev,
        participants: [
          ...prev.participants.filter(p => p.user._id !== userId),
          { user: userData, isActive: true }
        ]
      }));
    };
    
    // Handle participant left
    const handleUserLeft = ({ userId }) => {
      setSession(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.user._id === userId ? { ...p, isActive: false } : p
        )
      }));
    };
    
    // Handle session ended
    const handleSessionEnded = () => {
      navigate('/dashboard');
    };
    
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('session-ended', handleSessionEnded);
    
    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('session-ended', handleSessionEnded);
    };
  }, [socket, session, navigate]);
  
  // End the session (host only)
  const handleEndSession = async () => {
    try {
      if (session?.host?._id === user?.id) {
        await endSession(session._id);
        socket.emit('end-session', { sessionCode });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading session...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!session) {
    return <div className="not-found">Session not found</div>;
  }
  
  return (
    <div className="session-page">
      <div className="session-header">
        <h1>{session.document.title}</h1>
        <div className="session-controls">
          <button onClick={() => setShowChat(!showChat)}>
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          <button onClick={() => setShowVideo(!showVideo)}>
            {showVideo ? 'Hide Video' : 'Show Video'}
          </button>
          {session.host._id === user?.id && (
            <button className="end-session" onClick={handleEndSession}>
              End Session
            </button>
          )}
        </div>
      </div>
      
      <div className="session-content">
        <div className="editor-container">
          <DocumentEditor documentId={session.document._id} />
        </div>
        
        <div className="sidebar">
          {showVideo && (
            <div className="video-container">
              <VideoCall sessionCode={sessionCode} />
            </div>
          )}
          
          <div className="participants-container">
            <ParticipantList 
              participants={session.participants.filter(p => p.isActive)} 
              host={session.host}
            />
          </div>
          
          {showChat && (
            <div className="chat-container">
              <ChatBox sessionCode={sessionCode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;