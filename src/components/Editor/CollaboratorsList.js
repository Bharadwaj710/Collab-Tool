import React from 'react';

const CollaboratorsList = ({ activeUsers }) => {
  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  return (
    <div style={{ 
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px'
    }}>
      <h4 style={{ marginBottom: '0.5rem' }}>Active Users</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {activeUsers.map((user) => (
          <div
            key={user.id}
            style={{
              backgroundColor: '#e6f4ff',
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.9rem',
            }}
          >
            {user.username}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorsList;