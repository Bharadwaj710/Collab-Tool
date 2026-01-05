import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserFromStorage, getTokenFromStorage } from '../utils/identity';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getUserFromStorage());
    const [token, setToken] = useState(getTokenFromStorage());

    useEffect(() => {
        const syncUser = () => {
            setUser(getUserFromStorage());
            setToken(getTokenFromStorage());
        };

        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
