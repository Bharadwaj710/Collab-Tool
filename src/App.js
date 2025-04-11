import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import DocumentEditor from './components/DocumentEditor'; // Add this import

function App() {
    return (
        <Router>
            <Navbar />
            <div className="main-content">
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
                    {/* New routes for real-time document editing */}
                    <Route path="/documents/:id" element={
                        <ProtectedRoute>
                            <DocumentEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="/join/:id" element={
                        <ProtectedRoute>
                            <DocumentEditor />
                        </ProtectedRoute>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;