import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DocumentEditor from './pages/DocumentEditor';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
    const location = useLocation();
    const isEditorRoute = location.pathname.startsWith('/documents') || location.pathname.startsWith('/join');

    return (
        <>
            {!isEditorRoute && <Navbar />}
            <div className={!isEditorRoute ? "pt-16 min-h-screen bg-slate-900" : ""}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Collaboration Routes */}
                    <Route path="/documents/:id" element={<DocumentEditor />} />
                    <Route path="/join/:id" element={<DocumentEditor />} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
