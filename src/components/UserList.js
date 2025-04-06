import React from 'react';

const UserList = ({ activeUsers = [] }) => {
  return (
    <div className="active-users">
      <h3>Active Users</h3>
      <div className="users-list">
        {activeUsers.length > 0 ? (
          activeUsers.map((user) => (
            <div key={user._id} className="user-item">
              <div 
                className="user-avatar"
                style={{
                  backgroundColor: getUserColor(user._id),
                }}
              >
                {getInitials(user.name)}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
          ))
        ) : (
          <p className="no-users">No other users active</p>
        )}
      </div>
    </div>
  );
};

// Helper function to get user initials
const getInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to generate a user color
const getUserColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#073B4C', '#7209B7', '#3A86FF', '#FB5607', '#FFBE0B'
  ];
  
  // Simple hash function
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
};

export default UserList;