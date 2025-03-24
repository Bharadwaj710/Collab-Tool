import React, { useState } from 'react';
import './VideoCollaboration.css';

const VideoCollaboration = () => {
  const [users] = useState([
    { id: 'you', name: 'You' },
    { id: 'user2', name: 'User 2' },
    { id: 'user3', name: 'User 3' }
  ]);

  return (
    <div className="video-collaboration">
      <h2>Video Collaboration</h2>
      
      <div className="video-grid">
        {users.map(user => (
          <div key={user.id} className="video-container">
            <div className="video-placeholder"></div>
            <div className="video-user-label">{user.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoCollaboration;