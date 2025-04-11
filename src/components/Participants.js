import React from 'react';

const Participants = ({ participants }) => {
  return (
    <div className="participants">
      <style jsx>{`
        .participants {
          margin-bottom: 1.5rem;
        }
        
        .participants h3 {
          font-size: 1rem;
          color: #343a40;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .participant {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 4px;
          background-color: #f1f3f5;
          transition: background-color 0.2s ease;
        }
        
        .participant:hover {
          background-color: #e9ecef;
        }
        
        .participant-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #4285f4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 0.75rem;
        }
        
        .participant-name {
          font-size: 0.9rem;
          color: #343a40;
        }
      `}</style>
      
      <h3>Participants ({participants.length})</h3>
      
      <div className="participants-list">
        {participants.length === 0 ? (
          <p>No other participants</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.socketId} className="participant">
              <div className="participant-avatar">
                {participant.username ? participant.username[0].toUpperCase() : '?'}
              </div>
              <div className="participant-name">
                {participant.username || 'Anonymous'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Participants;