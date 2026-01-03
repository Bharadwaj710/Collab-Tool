import React, { useState } from 'react';
import './ProfileModal.css';

const ProfileModal = ({ user, onClose, onSave }) => {
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        username: username.trim(),
        bio
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Deterministic avatar (Google Docs style)
  const getAvatarUrl = (seed) => {
    if (!seed) return null;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4285f4,34a853,fbbc04,ea4335`;
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Profile</h2>
          <button className="profile-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-modal-content">
          <div className="profile-avatar-section">
            <img
              src={getAvatarUrl(user.profile?.avatarSeed || username)}
              alt="Avatar"
              className="profile-avatar-large"
            />
          </div>

          <div className="profile-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className="profile-field">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>
        </div>

        <div className="profile-modal-footer">
          <button
            className="profile-btn profile-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
