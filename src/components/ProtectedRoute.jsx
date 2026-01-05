import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, token } = useAuth();
    
    // Check if authenticated
    const isAuthenticated = token && user;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    // Render children if authenticated
    return children;
};

export default ProtectedRoute;
