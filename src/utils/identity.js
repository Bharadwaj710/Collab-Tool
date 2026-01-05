/**
 * Utility to handle user/guest identity logic consistently.
 */
export const getUserFromStorage = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    try {
        return JSON.parse(userString);
    } catch (e) {
        return null;
    }
};

export const getTokenFromStorage = () => {
    return localStorage.getItem('token');
};

export const getUserId = (user) => {
    if (!user) return null;
    return user._id || user.id;
};

export const getUserRole = (user) => {
    return user?.role || 'participant';
};
