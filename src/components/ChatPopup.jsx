import React, { useEffect, useRef } from 'react';

const ChatPopup = ({ 
    showChat, 
    setShowChat, 
    chatMessages, 
    chatInput, 
    setChatInput, 
    unreadCount, 
    setUnreadCount, 
    onSendChat 
}) => {
    const chatEndRef = useRef(null);
    const showChatRef = useRef(showChat);

    useEffect(() => {
        showChatRef.current = showChat;
        if (showChat) {
            setUnreadCount(0);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [showChat, chatMessages, setUnreadCount]);

    const handleToggleChat = () => {
        const next = !showChat;
        setShowChat(next);
        if (next) setUnreadCount(0);
    };

    return (
        <>
            <button 
                className="fixed bottom-6 right-6 w-14 h-14 bg-jb-accent rounded-full shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center text-2xl hover:bg-indigo-600 transition-all hover:scale-110 active:scale-95 z-50 text-white"
                onClick={handleToggleChat}
            >
                💬
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-jb-dark animate-bounce shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showChat && (
                <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-jb-panel border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 h-96 animate-fade-in-up">
                    <div className="flex items-center justify-between px-4 py-3 bg-jb-surface border-b border-gray-700">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <h4 className="font-bold text-jb-text text-sm uppercase tracking-wide">Squad Chat</h4>
                        </div>
                        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">&times;</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-jb-panel scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-jb-muted opacity-50">
                                <span className="text-2xl mb-2">👋</span>
                                <span className="text-xs">Say hello to the team!</span>
                            </div>
                        ) : (
                            chatMessages.map((msg, i) => (
                                <div key={i} className="text-sm group">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="font-bold text-jb-accent text-xs font-mono">{msg.senderName}</span>
                                        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <div className="text-jb-text break-words bg-jb-surface/50 p-2 rounded-lg rounded-tl-none border border-gray-800">
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-3 bg-jb-surface border-t border-gray-700">
                        <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSendChat()}
                            className="w-full bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] border border-gray-600 rounded-lg px-4 py-2.5 text-jb-text focus:outline-none focus:border-jb-accent focus:ring-1 focus:ring-jb-accent transition-all placeholder-gray-500 text-sm font-medium"
                            placeholder="Type a message..."
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPopup;
