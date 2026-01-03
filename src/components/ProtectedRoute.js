import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token && user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };
        
        checkAuth();
    }, []);
    
    // Show loading while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="container text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Verifying your session...</p>
            </div>
        );
    }
    
    // Redirect to login if not authenticated
    if (isAuthenticated === false) {
        return <Navigate to="/login" />;
    }
    
    // Render children if authenticated
    return children;
};

export default ProtectedRoute;