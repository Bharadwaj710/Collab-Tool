import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import DocumentForm from './components/DocumentForm';
import DocumentDetails from './components/DocumentDetails';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute'; // We'll create this component

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
                    <Route path="/document/:id" element={
                        <ProtectedRoute>
                            <DocumentDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/document/new" element={
                        <ProtectedRoute>
                            <DocumentForm />
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