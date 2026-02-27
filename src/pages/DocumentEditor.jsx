import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import html2pdf from 'html2pdf.js';

// Extracted Components
import ParticipantsList from '../components/ParticipantsList';
import TimerPanel from '../components/TimerPanel';
import ChatPopup from '../components/ChatPopup';
import ProblemStatement from '../components/ProblemStatement';
import PrivateNotes from '../components/PrivateNotes';
import WorkspaceEditor from '../components/WorkspaceEditor';

const DocumentEditor = () => {
    const { id: roomId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token, logout } = useAuth();
    const { socket, status } = useSocket(roomId, currentUser);

    const [participants, setParticipants] = useState([]);
    const [documentTitle, setDocumentTitle] = useState('Untitled Document');
    const [typingUsers, setTypingUsers] = useState(new Set());
    
    const [problemStatement, setProblemStatement] = useState('');
    const [timer, setTimer] = useState({ duration: 0, remaining: 0, isRunning: false });
    const [chatMessages, setChatMessages] = useState([]);
    const [privateNotes, setPrivateNotes] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [noteInput, setNoteInput] = useState('');

    const [role, setRole] = useState('participant');
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Editor Initial State
    const [editorInitialData, setEditorInitialData] = useState(null);

    const problemTimeoutRef = useRef(null);
    const showChatRef = useRef(false);
    const typingTimeouts = useRef({});

    // Sync showChatRef with showChat state for socket listener
    useEffect(() => {
        showChatRef.current = showChat;
    }, [showChat]);
    
    // ... Identity handling ...

    // Socket Events
    useEffect(() => {
        if (!socket) return;
        
        socket.on('room-users', (users) => {
            setParticipants(users);
            const myId = currentUser?._id || currentUser?.id;
            const myUser = users.find(u => String(u.userId || u.guestId) === String(myId));
            if (myUser) setRole(myUser.role);
        });

        socket.on('full-state', (data) => {
            // Unpack data
            const { 
                discussionContent, 
                code, 
                title, 
                problemStatement: ps, 
                timer: t, 
                chat, 
                notes,
                personalNotes
            } = data;

            setEditorInitialData({ discussionContent, code });

            if (title) setDocumentTitle(title);
            if (ps) setProblemStatement(ps);
            if (t) setTimer(t);
            if (chat) setChatMessages(chat);
            // 'notes' is shared interviewer notes, 'personalNotes' is private to the participant
            if (personalNotes) setPrivateNotes(personalNotes);
            else if (notes) setPrivateNotes(notes);
        });

        socket.on('problem-update', ({ problemStatement }) => setProblemStatement(problemStatement));
        socket.on('timer-update', (t) => setTimer(t));
        socket.on('chat-message', (msg) => {
            const senderIdStr = String(msg.senderId);
            const currentIdStr = String(currentUser?._id || currentUser?.id);
            setChatMessages(prev => [...prev, msg]);
            
            setUnreadCount(prevCount => {
                const isChatClosed = !showChatRef.current;
                const isNotFromMe = senderIdStr !== currentIdStr;
                return (isChatClosed && isNotFromMe) ? prevCount + 1 : prevCount;
            });
        });

        socket.on('notes-updated', (notes) => setPrivateNotes(notes));
        socket.on('title-update', ({ title }) => setDocumentTitle(title));

        socket.on('user-typing', ({ username }) => {
            if (currentUser && username === currentUser.username) return;

            setTypingUsers(prev => {
                const next = new Set(prev);
                next.add(username);
                return next;
            });

            if (typingTimeouts.current[username]) clearTimeout(typingTimeouts.current[username]);

            typingTimeouts.current[username] = setTimeout(() => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(username);
                    return next;
                });
                delete typingTimeouts.current[username];
            }, 3000);
        });

        socket.on('user-stopped-typing', ({ username }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(username);
                return next;
            });
            if (typingTimeouts.current[username]) {
                clearTimeout(typingTimeouts.current[username]);
                delete typingTimeouts.current[username];
            }
        });

        socket.on('user-kicked', () => {
             toast.error("You have been removed from the session.");
             navigate('/dashboard');
        });

        return () => {
            socket.off('room-users');
            socket.off('full-state');
            socket.off('problem-update');
            socket.off('timer-update');
            socket.off('chat-message');
            socket.off('note-added');
            socket.off('title-update');
            socket.off('user-typing');
            socket.off('user-stopped-typing');
            socket.off('user-kicked');
        };
    }, [socket, currentUser, navigate]);

    // Timer Logic
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
    }, [timer.isRunning, timer.remaining]);

    // Handlers
    const handleSendChat = () => {
        if (!chatInput.trim() || !socket || !currentUser) return;
        socket.emit('send-chat', {
            roomId,
            message: chatInput,
            senderId: currentUser._id || currentUser.id,
            senderName: currentUser.username || 'Anonymous'
        });
        setChatInput('');
    };

    const handleAddNote = () => {
        if (!noteInput.trim() || !socket || !currentUser) return;
        socket.emit('add-note', {
            roomId,
            text: noteInput,
            requesterId: currentUser._id || currentUser.id
        });
        setNoteInput('');
    };

    const handleDeleteNote = (noteId) => {
        if (!socket || !currentUser) return;
        socket.emit('delete-note', {
            roomId,
            noteId,
            requesterId: currentUser._id || currentUser.id
        });
    };

    const handleTimerControl = (action, duration) => {
        if (!socket || !currentUser) return;
        socket.emit('timer-control', {
            roomId,
            action,
            duration,
            requesterId: currentUser._id || currentUser.id
        });
    };

    const handleProblemChange = (e) => {
        const newProblem = e.target.value;
        setProblemStatement(newProblem);
        if (problemTimeoutRef.current) clearTimeout(problemTimeoutRef.current);
        problemTimeoutRef.current = setTimeout(() => {
            if (socket && currentUser) {
                socket.emit('update-problem', {
                    roomId,
                    problemStatement: newProblem,
                    requesterId: currentUser._id || currentUser.id
                });
            }
        }, 500);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`)
            .then(() => toast.success('Link copied!'))
            .catch(() => toast.error('Failed to copy'));
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomId)
            .then(() => toast.success('Code copied!'))
            .catch(() => toast.error('Failed to copy'));
    };

    const handleExport = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${axios.defaults.baseURL}/api/documents/${roomId}/export`, {
                headers: { 'x-auth-token': token }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `session-export-${roomId}.md`;
                a.click();
                toast.success('Exported!');
            }
        } catch (err) { toast.error('Export error'); }
    };
    
    // PDF Export targeting the Discussion Editor specific content
    const handleExportPDF = () => {
        const element = document.querySelector('.ProseMirror'); // TipTap class
        if (!element) {
            toast.error("Nothing to export");
            return;
        }

        const opt = {
            margin: 1,
            filename: `${documentTitle || 'Document'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
        toast.info('Generating PDF...');
    };

    const handleTitleChange = (e) => {
        setDocumentTitle(e.target.value);
        if (socket) socket.emit('title-change', { roomId, title: e.target.value });
    };

    const isPrivileged = role === 'creator' || role === 'interviewer';
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] text-jb-text selection:bg-jb-accent selection:text-white">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-80 bg-jb-panel border-r border-gray-800 
                transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full p-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-jb-secondary shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                             <span className="text-xs font-mono uppercase tracking-wider text-jb-muted font-bold">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                             </span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-jb-muted hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <h3 className="text-xs font-bold text-jb-muted uppercase tracking-widest mb-4 flex items-center justify-between pl-1">
                        Participants 
                        <span className="bg-jb-surface text-jb-text px-2 py-0.5 rounded-full text-[10px] font-mono border border-gray-700">{participants.length}</span>
                    </h3>
                    
                    <div className="mb-6">
                        <ParticipantsList 
                            participants={participants}
                            currentUser={currentUser}
                            socket={socket}
                            roomId={roomId}
                            typingUsers={typingUsers}
                        />
                    </div>
                
                    <div className="mt-auto space-y-2.5 pt-4 border-t border-gray-800/50">
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCopyLink} 
                                className="flex-1 bg-jb-accent hover:bg-indigo-600 text-white text-[10px] font-bold py-2 px-3 rounded shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Share</span> <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                            <button 
                                onClick={handleCopyCode} 
                                className="flex-1 bg-jb-surface hover:bg-gray-700 text-jb-muted hover:text-white text-[10px] font-bold py-2 px-3 rounded border border-gray-700 transition-all flex items-center justify-center gap-2 group"
                                title="Copy Room ID"
                            >
                                <span className="font-mono truncate max-w-[50px]">{roomId}</span> 
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </button>
                        </div>

                        {isPrivileged && (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleExport} className="bg-jb-panel hover:bg-jb-surface text-jb-accent text-[9px] font-bold py-2 px-3 rounded border border-jb-accent/10 transition-all uppercase tracking-wider">
                                    MD
                                </button>
                                <button onClick={handleExportPDF} className="bg-jb-panel hover:bg-jb-surface text-jb-secondary text-[9px] font-bold py-2 px-3 rounded border border-jb-secondary/10 transition-all uppercase tracking-wider">
                                    PDF
                                </button>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => {
                                if (!token) { logout(); }
                                navigate('/');
                            }} 
                            className="w-full bg-jb-panel hover:bg-red-500/5 text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-500/20 text-[9px] font-bold py-2.5 px-3 rounded transition-all flex items-center justify-center gap-2 uppercase tracking-widest" 
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Leave Room
                        </button>
                    </div>

                    <div className="mt-4 mb-2 flex-shrink-0">
                         <TimerPanel timer={timer} isPrivileged={isPrivileged} onTimerControl={handleTimerControl} />
                    </div>
                    
                    {isPrivileged && (
                        <div className="mt-4 flex-shrink-0 pt-4 border-t border-gray-800/50">
                            <PrivateNotes 
                                privateNotes={privateNotes} 
                                noteInput={noteInput} 
                                setNoteInput={setNoteInput} 
                                onAddNote={handleAddNote}
                                onDeleteNote={handleDeleteNote}
                            />
                         </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]">
                <ProblemStatement 
                    problemStatement={problemStatement} 
                    isPrivileged={isPrivileged} 
                    onProblemChange={handleProblemChange} 
                />

                <div className="flex items-center gap-4 p-3 border-b border-gray-800 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] z-20 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-jb-accent to-jb-secondary flex items-center justify-center text-white font-bold font-mono text-sm shadow-lg shadow-indigo-500/20">
                            DOC
                        </div>
                        <input 
                            value={documentTitle} 
                            onChange={handleTitleChange} 
                            className="bg-transparent text-lg font-bold text-jb-text focus:outline-none focus:ring-0 placeholder-gray-600 w-full truncate font-sans tracking-tight"
                            placeholder="Untitled Document"
                        />
                    </div>
                    
                    <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="hidden sm:flex h-6 items-center justify-end min-w-[200px]">
                            {(() => {
                                const others = Array.from(typingUsers).filter(u => u !== currentUser?.username);
                                if (others.length === 0) return null;
                                let text = others.length === 1 ? `${others[0]} is typing...` : others.length <= 3 ? `${others.join(', ')} are typing...` : 'Multiple users are typing...';
                                return (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-jb-accent italic animate-pulse">
                                         <span className="w-1.5 h-1.5 rounded-full bg-jb-accent"></span>
                                        {text}
                                    </div>
                                );
                            })()}
                        </div>
                        
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-jb-surface hover:bg-gray-700 text-jb-muted hover:text-white text-xs font-bold py-2 px-3 rounded border border-gray-700 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            <span className="hidden sm:inline">My Workspace</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]">
                   {socket && currentUser && (
                       <WorkspaceEditor 
                          socket={socket} 
                          roomId={roomId} 
                          currentUser={currentUser} 
                          isReadOnly={false} 
                          initialData={editorInitialData}
                       />
                   )}
                </div>
            </div>

            <ChatPopup 
                showChat={showChat}
                setShowChat={setShowChat}
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                unreadCount={unreadCount}
                setUnreadCount={setUnreadCount}
                onSendChat={handleSendChat}
            />
        </div>
    );
};

export default DocumentEditor;
