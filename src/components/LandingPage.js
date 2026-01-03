import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';
import BackgroundEffect from './BackgroundEffect.js';

const LandingPage = () => {
    const backgroundContainerRef = useRef(null);
    const startButtonRef = useRef(null);
    const [displayText, setDisplayText] = useState('');
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('Interviewer');
    const navigate = useNavigate();
const [loggedInUser, setLoggedInUser] = useState(
  localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null
);

useEffect(() => {
  const syncUser = () => {
    const u = localStorage.getItem('user');
    setLoggedInUser(u ? JSON.parse(u) : null);
  };

  window.addEventListener('storage', syncUser);
  return () => window.removeEventListener('storage', syncUser);
}, []);


    const fullText = [
        'Collaborate with \n ',
        <span key="ease" style={{ backgroundColor: '#e1782dd8', color: '#ffffff', padding: '0 4px' }}>
            Ease
        </span>,
        '.'
    ];

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 498);

        return () => clearInterval(typingInterval);
    }, []);

    const handleCreateRoom = () => {
  const newRoomId = Math.random().toString(36).substring(2, 9);

  const existingUser = localStorage.getItem('user');

  // Only create guest if NOT logged in
  if (!existingUser || !localStorage.getItem('token')) {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      username: 'Guest ' + Math.random().toString(36).substring(2, 5).toUpperCase(),
      role: 'Participant'
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    window.dispatchEvent(new Event('storage'));
  }

  navigate(`/documents/${newRoomId}`);
};

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (username.trim() && roomId.trim()) {
            const user = {
                id: 'user-' + Math.random().toString(36).substring(2, 9),
                username: username.trim(),
                role: role
            };
            localStorage.setItem('user', JSON.stringify(user));
            navigate(`/documents/${roomId.trim()}`);
        } else {
            alert('Please enter both Name and Room ID');
        }
    };

    return (
        <div className="landing-container">
            <BackgroundEffect targetButtonRef={startButtonRef} />
            <div className="background-container" ref={backgroundContainerRef}></div>
            <div className="landing-content">
              {loggedInUser && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      justifyContent: 'center',
      marginBottom: '20px'
    }}
  >
    <img
      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(loggedInUser.username)}`}
      style={{ width: 40, height: 40, borderRadius: '50%' }}
    />
    <span style={{ color: '#fff', fontWeight: 'bold' }}>
      {loggedInUser.username}
    </span>
  </div>
)}

                <h1 className="landing-title">
                    {displayText}
                    <span className="cursor"></span>
                    <span className="ease"></span>
                </h1>
                <p className="landing-description">
                    CollabTool is your go-to platform for seamless real-time collaboration.
                </p>
                <p className="landing-subtext">
                    Designed for collaborative interviews and real-time project sync.
                </p>

                <div className="landing-buttons">
                    <button onClick={handleCreateRoom} className="btn btn-primary" ref={startButtonRef} style={{ padding: '0.75rem 2rem' }}>
                        Create New Workspace
                    </button>
                    
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', margin: '2rem auto' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.2rem' }}>Join Existing Room</h3>
                        <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="form-control"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Room ID"
                                className="form-control"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                required
                            />
                            <select
                                className="form-control"
                                style={{ backgroundColor: 'rgba(50,50,50,0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Interviewer">Role: Interviewer</option>
                                <option value="Candidate">Role: Candidate</option>
                                <option value="Participant">Role: Participant</option>
                            </select>
                            <button type="submit" className="btn btn-outline-light">Enter Room</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;