import React, { useState } from 'react';

const ProfileModal = ({ user: initialUser, onClose, onSave }) => {
  const [username, setUsername] = useState(initialUser.username || '');
  const [bio, setBio] = useState(initialUser.profile?.bio || '');
  
  const isGuest = !localStorage.getItem('token');

  const handleSave = () => {
    if (isGuest) {
        alert('Guest users cannot save profile changes.');
        return;
    }
    onSave({ 
      username, 
      profile: { ...initialUser.profile, bio } 
    });
  };

  const getAvatarUrl = (seed) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4285f4,34a853,fbbc04,ea4335`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300" onClick={onClose}>
      <div 
        className="bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all scale-100" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">User Profile</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700" 
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
                <img 
                  src={getAvatarUrl(initialUser.profile?.avatarSeed || username)} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-xl"
                />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {isGuest && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg p-3 text-sm text-center">
              ⚠️ Log in to customize your profile and save changes permanently.
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Username</label>
            <input 
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              disabled={isGuest}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Email Address</label>
            <input 
              type="text" 
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
              value={initialUser.email || 'N/A (Guest)'} 
              disabled={true}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Bio</label>
            <textarea 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              disabled={isGuest}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button 
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors font-medium" 
            onClick={onClose}
          >
            Cancel
          </button>
          {!isGuest && (
            <button 
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all font-medium" 
              onClick={handleSave}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
