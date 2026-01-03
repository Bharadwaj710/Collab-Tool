import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DocumentEditor.css';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocumentEditor = () => {
    const { id } = useParams(); // roomId
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [version, setVersion] = useState(0);
    const [participants, setParticipants] = useState([]);
    const [documentTitle, setDocumentTitle] = useState('Untitled Document');
    const [status, setStatus] = useState('connecting');
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [currentUser, setCurrentUser] = useState(null);
    
    // Day 4-7 Features State
    const [problemStatement, setProblemStatement] = useState('');
    const [timer, setTimer] = useState({ duration: 0, remaining: 0, isRunning: false });
    const [chatMessages, setChatMessages] = useState([]);
    const [privateNotes, setPrivateNotes] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [noteInput, setNoteInput] = useState('');

    const [role, setRole] = useState('participant');
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [customTime, setCustomTime] = useState(0);

    const chatEndRef = useRef(null);
    const showChatRef = useRef(false);

    const [ownerId, setOwnerId] = useState(null);

    const quillRef = useRef(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const saveTimeoutRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    useEffect(() => {
        const userString = localStorage.getItem('user');
        let user = null;
        
        if (userString) {
            try {
                user = JSON.parse(userString);
            } catch (e) {
                console.error("Failed to parse user string");
            }
        }

        if (!user) {
            user = {
                id: 'guest-' + Math.random().toString(36).substring(2, 9),
                username: 'Guest ' + Math.random().toString(36).substring(2, 5).toUpperCase(),
                role: 'Participant'
            };
            localStorage.setItem('user', JSON.stringify(user));
        }
        

        
        setCurrentUser(user);

        // ROBUSTNESS FIX: Fetch fresh user data from API to ensure username is correct
        // This fixes the issue where username might be missing or stale in localStorage
        if (user.token || localStorage.getItem('token')) {
            const token = user.token || localStorage.getItem('token');
           axios.get(`${API_URL}/api/users/me`, {
  headers: { 'x-auth-token': token }
}).then(res => {
  const refreshedUser = res.data;
  setCurrentUser(refreshedUser);
  localStorage.setItem('user', JSON.stringify(refreshedUser));
});

        }

        try {
            const s = io(API_URL, {
                query: user.token ? { token: user.token } : {},
                transports: ['websocket', 'polling']
            });
            
            setSocket(s);

            s.on('connect', () => {
                setStatus('connected');
                s.emit('join-room', {
                    roomId: id,
                    user: {
                        id: user.id,
                        name: user.username,
                        role: user.role
                    }
                });
            });

            s.on('disconnect', () => {
                setStatus('disconnected');
            });
            
            s.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                setStatus('error');
            });
            
            // ISSUE 1: Listen for room-users
            s.on('room-users', (users) => {
                setParticipants(users);
                const myUser = users.find(u => String(u.userId || u.guestId) === String(user.id));
                if (myUser) setRole(myUser.role);
            });
            
            s.on('full-state', ({ content, version: serverVersion, title, ownerId: serverOwnerId, problemStatement: ps, timer: t, chat, notes }) => {
                if (quillRef.current) {
                    const editor = quillRef.current.getEditor();
                    try {
                        const delta = JSON.parse(content);
                        editor.setContents(delta, 'silent');
                    } catch (e) {
                        editor.setText(content || '', 'silent');
                    }
                }
                setVersion(serverVersion);
                if (title) setDocumentTitle(title);
                if (serverOwnerId) setOwnerId(serverOwnerId);
                if (ps) setProblemStatement(ps);
                if (t) setTimer(t);
                if (chat) setChatMessages(chat);
                if (notes) setPrivateNotes(notes);
            });

            s.on('problem-update', ({ problemStatement }) => setProblemStatement(problemStatement));
            s.on('timer-update', (t) => setTimer(t));
            s.on('chat-message', (msg) => {
                // Normalize ids to strings for comparison
                const senderIdStr = String(msg.senderId);
                const currentIdStr = String(user.id);
                
                // Add message to chat
                setChatMessages(prev => [...prev, msg]);
                
                // Increment unread ONLY if chat is currently closed AND message is NOT from me
                // Use ref to check current showChat state, not stale closure value
                setUnreadCount(prevCount => {
                    const isChatClosed = !showChatRef.current;
                    const isNotFromMe = senderIdStr !== currentIdStr;
                    return (isChatClosed && isNotFromMe) ? prevCount + 1 : prevCount;
                });
                
                if (showChatRef.current) {
                     setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            });
            s.on('note-added', (note) => setPrivateNotes(prev => [...prev, note]));
            
            // ISSUE 2: Listen for editor-update
            s.on('editor-update', ({ content, version: remoteVersion, senderId }) => {
                if (senderId === user.id) return;

                setVersion(prevVersion => {
                    if (remoteVersion >= prevVersion) {
                        if (quillRef.current) {
                            const editor = quillRef.current.getEditor();
                            const currentCursor = editor.getSelection();
                            try {
                                const delta = JSON.parse(content);
                                editor.setContents(delta, 'silent');
                            } catch (e) {
                                editor.setText(content, 'silent');
                            }
                            if (currentCursor) {
                                editor.setSelection(currentCursor);
                            }
                        }
                        return remoteVersion;
                    }
                    return prevVersion;
                });
            });
            
            s.on('title-update', ({ title }) => {
                setDocumentTitle(title);
            });

            s.on('user-typing', ({ username }) => {
                setTypingUsers(prev => new Set(prev).add(username));
            });
            
            s.on('user-stopped-typing', ({ username }) => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(username);
                    return next;
                });
            });
            
            return () => {
                s.emit('leave-room', { roomId: id, userId: user.id });
                s.disconnect();
            };
        } catch (error) {
            console.error('Error setting up document editor:', error);
            setStatus('error');
        }
    }, [id, API_URL]);

    // Timer Logic Effect
    useEffect(() => {
        let interval;
        if (timer.isRunning && timer.remaining > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev.remaining <= 1) return { ...prev, remaining: 0, isRunning: false };
                    return { ...prev, remaining: prev.remaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer.isRunning]);

    // Handlers
    const handleSendChat = () => {
        if (!chatInput.trim() || !socket || !currentUser) return;
        const safeSenderName = currentUser.username || currentUser.name || 'Anonymous';
        socket.emit('send-chat', {
            roomId: id,
            message: chatInput,
            senderId: currentUser.id,
            senderName: safeSenderName
        });
        setChatInput('');
    };

    const handleAddNote = () => {
        if (!noteInput.trim() || !socket || !currentUser) return;
        socket.emit('add-note', {
            roomId: id,
            text: noteInput,
            requesterId: currentUser.id
        });
        setNoteInput('');
    };

    const handleTimerControl = (action, duration) => {
        if (!socket || !currentUser) return;
        socket.emit('timer-control', {
            roomId: id,
            action,
            duration,
            requesterId: currentUser.id
        });
    };

    const handleProblemChange = (e) => {
        const newProblem = e.target.value;
        setProblemStatement(newProblem);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            if (socket && currentUser) {
                socket.emit('update-problem', {
                    roomId: id,
                    problemStatement: newProblem,
                    requesterId: currentUser.id
                });
            }
        }, 500);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isPrivileged = role === 'creator' || role === 'interviewer';

    const handleContentChange = useCallback((content, delta, source, editor) => {
        if (source !== 'user') return;
        
        // Local version increment
        setVersion(prev => {
            const nextVersion = prev + 1;

            // Debounced emit
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                if (socket && currentUser) {
                    const editorContents = JSON.stringify(editor.getContents());
                    socket.emit('editor-change', {
                        roomId: id,
                        content: editorContents,
                        version: nextVersion,
                        senderId: currentUser.id
                    });
                }
            }, 300);

            return nextVersion;
        });

        // Typing indication
        if (socket && currentUser) {
            socket.emit('user-typing', { roomId: id, username: currentUser.username });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('user-stopped-typing', { roomId: id, username: currentUser.username });
            }, 2000);
        }
    }, [socket, id, currentUser]);

    const handleCopyLink = () => {
        const roomLink = `${window.location.origin}/documents/${id}`;
        navigator.clipboard.writeText(roomLink)
            .then(() => {
                toast.success('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy link:', err);
                toast.error('Failed to copy link');
            });
    };

    const handleExport = async () => {
        if (!currentUser || !currentUser.token) return;
        try {
            const response = await fetch(`${API_URL}/api/documents/${id}/export`, {
                headers: { 'x-auth-token': currentUser.token }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `session-export-${id}.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success('Session exported!');
            } else {
                toast.error('Export failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Export error');
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setDocumentTitle(newTitle);
        if (socket && id) {
            socket.emit('title-change', { roomId: id, title: newTitle });
        }
    };

    const handleLeave = () => {
        navigate('/');
    };

    return (
        <div className="editor-container">
            <div className="editor-sidebar">
                <div className="participants-section">
                    <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                        <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            backgroundColor: status === 'connected' ? '#2ecc71' : status === 'connecting' ? '#f1c40f' : '#e74c3c' 
                        }}></div>
                        <span style={{ color: '#fff' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    {participants.length > 0 && (
                        <>
                            <h3 style={{ color: '#fff' }}>Participants ({participants.length})</h3>
                            <div className="participants-list">
                                    {participants.map((participant, index) => {
                                        const pId = participant.userId || participant.guestId;
                                        const isMe = String(pId) === String(currentUser?.id);
                                        const role = participant.role;
                                        const isOnline = participant.isOnline;
                                        const name = participant.name || 'Anonymous';
                                        
                                        let badgeColor = '#2ecc71'; // Default Green (Participant)
                                        let badgeLabel = role;

                                        if (role === 'creator') {
                                            badgeColor = '#e67e22'; // Orange
                                            badgeLabel = 'Creator';
                                        } else if (role === 'interviewer') {
                                            badgeColor = '#3498db'; // Blue
                                            badgeLabel = 'Interviewer';
                                        } else if (role === 'candidate') {
                                            badgeColor = '#9b59b6'; // Purple
                                            badgeLabel = 'Candidate';
                                        }

                                        const amICreator = participants.some(p => p.role === 'creator' && String(p.userId) === String(currentUser?.id));

                                        return (
                                            <div key={index} className="participant" style={{ 
                                                padding: '10px', 
                                                marginBottom: '6px', 
                                                background: 'rgba(255,255,255,0.08)', 
                                                borderRadius: '6px',
                                                borderLeft: `4px solid ${isOnline ? badgeColor : '#7f8c8d'}`,
                                                opacity: isOnline ? 1 : 0.6,
                                                fontWeight: isMe ? 'bold' : 'normal',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '5px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ 
                                                        fontSize: '0.95rem', 
                                                        color: '#fff', 
                                                        whiteSpace: 'nowrap', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        maxWidth: '120px' 
                                                    }}>
                                                        {name} {isMe ? '(Me)' : ''}
                                                        {role === 'creator' && <span title="Creator"> 👑</span>}
                                                        {!isOnline && <span style={{ fontSize: '0.7rem', marginLeft: '5px', opacity: 0.7 }}>(Offline)</span>}
                                                    </div>
                                                    
                                                    {amICreator && !isMe ? (
                                                        <select 
                                                            className="role-select"
                                                            value={role}
                                                            onChange={(e) => {
                                                                const newRole = e.target.value;
                                                                socket.emit('update-participant-role', {
                                                                    roomId: id,
                                                                    targetUserId: participant.userId,
                                                                    targetGuestId: participant.guestId,
                                                                    newRole: newRole,
                                                                    requesterId: currentUser.id
                                                                });
                                                            }}
                                                        >
                                                            <option value="participant">Participant</option>
                                                            <option value="interviewer">Interviewer</option>
                                                            <option value="candidate">Candidate</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ 
                                                            fontSize: '0.65rem', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '12px', 
                                                            backgroundColor: isOnline ? badgeColor : '#7f8c8d', 
                                                            color: '#fff',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 'bold',
                                                            letterSpacing: '0.5px',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                        }}>
                                                            {badgeLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                {typingUsers.has(name) && (
                                                    <div style={{ fontSize: '0.7rem', color: '#f1c40f', fontStyle: 'italic', marginTop: '2px' }}>
                                                        typing...
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                        </>
                    )}
                </div>
                <div className="sidebar-buttons">
                    <button onClick={handleCopyLink} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
                        Copy Link
                    </button>
                    {isPrivileged && (
                        <button onClick={handleExport} className="btn" style={{ width: '100%', marginBottom: '0.5rem', background: '#8e44ad', color: 'white' }}>
                            Export Session
                        </button>
                    )}
                    <button onClick={handleLeave} className="btn btn-danger" style={{ width: '100%' }}>
                        Leave
                    </button>
                    {/* Chat button removed from here, now FAB */}
                </div>
                
                <div className="panels-container">
                    {/* Timer Panel */}
                    <div className="timer-display">{formatTime(timer.remaining)}</div>
                    {isPrivileged && (
                        <div className="timer-controls">
                             <div style={{ display: 'flex', gap: '5px', marginBottom: '5px', justifyContent: 'center' }}>
                                <input 
                                    type="number" 
                                    value={customTime} 
                                    onChange={(e) => setCustomTime(e.target.value)} 
                                    style={{ width: '50px', padding: '2px', fontSize: '0.8rem', borderRadius: '4px', border: 'none' }}
                                    min="1"
                                />
                                <button onClick={() => handleTimerControl('start', customTime * 60)} className="btn-sm" style={{fontSize: '0.7rem', padding: '2px 4px', background: '#2ecc71'}}>Set & Start</button>
                             </div>
                            {timer.isRunning ? 
                                <button onClick={() => handleTimerControl('pause')} className="btn-sm" style={{fontSize: '0.7rem', padding: '2px 8px', background: '#f1c40f', color: '#000'}}>Pause ⏸</button> :
                                <button onClick={() => handleTimerControl('start')} className="btn-sm" style={{fontSize: '0.7rem', padding: '2px 8px', background: '#2ecc71'}}>Resume ▶</button>
                            }
                            <button onClick={() => handleTimerControl('reset')} className="btn-sm" style={{fontSize: '0.7rem', padding: '2px 8px', background: '#e74c3c'}}>Reset ↺</button>
                        </div>
                    )}

                </div>
                    {isPrivileged && (
                        <div className="notes-panel">
                            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px' }}>Private Notes 🔒</h4>
                            <div className="notes-list">
                                {privateNotes.map((note, i) => (
                                    <div key={i} className="note-card">
                                        <div className="note-header">
                                            <small>{new Date(note.timestamp).toLocaleTimeString()}</small>
                                        </div>
                                        <p>{note.text}</p>
                                    </div>
                                ))}
                            </div>
                            <input 
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                className="note-input"
                                placeholder="Add private note..."
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                    
                {/* Floating Chat Button (FAB) */}
                <button 
                    className="chat-fab"
                    onClick={() => {
                        const newShowChat = !showChat;
                        setShowChat(newShowChat);
                        showChatRef.current = newShowChat;
                        if (newShowChat) {
                             setUnreadCount(0);
                             setTimeout(() => chatEndRef.current?.scrollIntoView(), 100);
                        }
                    }}
                >
                    💬
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                    {/* Chat Panel - Now a Popup */}
                    {showChat && (
                        <div className="chat-popup">
                            <div className="chat-header">
                                <h4>Group Chat</h4>
                                <button onClick={() => setShowChat(false)} className="close-btn">×</button>
                            </div>
                            <div className="chat-messages">
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className="chat-msg">
                                        <strong style={{ color: '#4facfe' }}>{msg.senderName}: </strong>
                                        <span>{msg.message}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                className="chat-input"
                                placeholder="Type a message..."
                            />
                        </div>
                    )}
                </div>
            <div className="editor-main" style={{ background: '#fff', position: 'relative' }}>
                
                {/* Problem Statement - Top of Main */}
                <div className="problem-section-top">
                     <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#555' }}>Problem Statement</h4>
                     {isPrivileged ? (
                        <textarea 
                            value={problemStatement} 
                            onChange={handleProblemChange} 
                            className="problem-input-top"
                            rows={2}
                            placeholder="Enter problem statement here..."
                        />
                    ) : (
                        <div className="problem-display-top">
                            {problemStatement || "Waiting for problem statement..."}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '10px 10px 0 10px' }}>
                    <input
                        type="text"
                        value={documentTitle}
                        onChange={handleTitleChange}
                        className="document-title"
                        style={{ border: 'none', fontSize: '1.5rem', fontWeight: 'bold', outline: 'none', flexGrow: 1 }}
                    />
                    <div className="typing-indicator" style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', minHeight: '1.2rem' }}>
                        {typingUsers.size > 0 && Array.from(typingUsers).join(', ') + (typingUsers.size === 1 ? ' is ' : ' are ') + 'typing...'}
                    </div>
                </div>
                <ReactQuill
                    ref={quillRef}
                    onChange={handleContentChange}
                    theme="snow"
                    className="editor"
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    }}
                    style={{ height: 'calc(100vh - 120px)' }}
                />
            </div>
        </div>
    );
};

export default DocumentEditor;
