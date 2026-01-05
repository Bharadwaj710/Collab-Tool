import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionEditor from './discussion/DiscussionEditor';
import CodeEditor from './code/CodeEditor';
import CodeRunner from './code/CodeRunner';

const WorkspaceEditor = ({ socket, roomId, currentUser, isReadOnly, initialData, onTypingStatusChange }) => {
  const [activeTab, setActiveTab] = useState('discussion'); // discussion | code
  const [discussionContent, setDiscussionContent] = useState(initialData?.discussionContent || null);
  const [codeData, setCodeData] = useState(initialData?.code || { language: 'javascript', source: '' });
  
  // Helper to get robust ID
  const getCurrentUserId = () => currentUser?._id || currentUser?.id;

  // Real-time Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('discussion-update', ({ content, userId }) => {
        console.log('[Workspace] Discussion Update Recv', userId);
        if (String(userId) !== String(getCurrentUserId())) {
            setDiscussionContent(content);
        }
    });

    socket.on('code-update', ({ code, language, userId }) => {
        console.log('[Workspace] Code Update Recv', userId);
        if (String(userId) !== String(getCurrentUserId())) {
            setCodeData({ source: code, language });
        }
    });

    return () => {
        socket.off('discussion-update');
        socket.off('code-update');
    };
  }, [socket, currentUser]); // Depends on currentUser ref

  // Sync initialData if it changes later (e.g. from full-state)
  useEffect(() => {
     if (initialData?.discussionContent) setDiscussionContent(initialData.discussionContent);
     if (initialData?.code) setCodeData(initialData.code);
  }, [initialData]);

  const typingTimeoutRef = React.useRef(null);
  const isTypingRef = React.useRef(false);

  const emitTyping = () => {
      if (!socket || !currentUser) return;
      
      // 1. If not already marked as typing, emit START
      if (!isTypingRef.current) {
          isTypingRef.current = true;
          socket.emit('user-typing', { roomId, username: currentUser.username });
          // Notify parent locally
          if (onTypingStatusChange) onTypingStatusChange(true);
      }
      
      // 2. Clear existing STOP timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // 3. Set new STOP timer (debounce)
      typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          socket.emit('user-stopped-typing', { roomId, username: currentUser.username });
          // Notify parent locally
          if (onTypingStatusChange) onTypingStatusChange(false);
      }, 2000);
  };

  const handleDiscussionChange = (content) => {
    setDiscussionContent(content);
    emitTyping();
    socket.emit('discussion-change', { 
        roomId, 
        content, 
        userId: getCurrentUserId()
    });
  };

  const handleCodeChange = (newCode) => {
    const updated = { ...codeData, source: newCode };
    setCodeData(updated);
    emitTyping();
    socket.emit('code-change', { 
        roomId, 
        code: newCode, 
        language: codeData.language, 
        userId: getCurrentUserId()
    });
  };

  const handleLanguageChange = (lang) => {
     const updated = { ...codeData, language: lang };
     setCodeData(updated);
     socket.emit('code-change', {
         roomId,
         code: codeData.source,
         language: lang,
         userId: getCurrentUserId()
     });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center px-4 bg-jb-panel border-b border-gray-800 shrink-0">
            {['discussion', 'code'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-6 py-3 text-sm font-semibold capitalize transition-colors font-mono ${
                        activeTab === tab ? 'text-jb-accent' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {tab}
                    {activeTab === tab && (
                        <motion.div 
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-jb-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        />
                    )}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 p-0 transition-opacity duration-300 ${activeTab === 'discussion' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <DiscussionEditor 
                    content={discussionContent} 
                    onChange={handleDiscussionChange} 
                    isReadOnly={isReadOnly}
                 />
            </div>
            
            <div className={`absolute inset-0 flex transition-opacity duration-300 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="flex-1 h-full min-w-0">
                    <CodeEditor 
                        code={codeData.source} 
                        language={codeData.language}
                        onChange={handleCodeChange}
                        onLanguageChange={handleLanguageChange}
                        isReadOnly={isReadOnly}
                    />
                 </div>
                 <CodeRunner 
                    code={codeData.source} 
                    language={codeData.language} 
                    isReadOnly={isReadOnly}
                 />
            </div>
        </div>
    </div>
  );
};

export default WorkspaceEditor;
