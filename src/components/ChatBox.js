import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../utils/contexts/AuthContext.js';
import { sendChatMessage } from '../utils/socketClient.js';

const Chat = ({ messages = [], onNewMessage }) => {
  const { id: documentId } = useParams();
  const { currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageText.trim() === '') return;
    
    sendChatMessage(documentId, messageText);
    setMessageText('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header" onClick={toggleMinimize}>
        <h3>Chat</h3>
        <button className="minimize-btn">
          {isMinimized ? 'Maximize' : 'Minimize'}
        </button>
      </div>
      
      {!isMinimized && (
        <>
          <div className="messages-container">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.userId === currentUser.id ? 'self' : 'other'}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{msg.user.name}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))
            ) : (
              <div className="no-messages">No messages yet</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="message-form" onSubmit={handleSendMessage}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;