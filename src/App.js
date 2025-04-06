import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Dashboard from './components/Dashboard.js';
import Navbar from './components/Navbar.js';
import DocumentForm from './components/DocumentForm.js';
import DocumentDetails from './components/DocumentDetails.js';
import LandingPage from './components/LandingPage.js';
import Document from './components/Document.js';
import VideoCollaboration from './components/VideoCollaboration.js';
import TextEditor from './components/Editor/EditorToolbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext.js';

function App() {
    const { user } = useAuth() || { user: null };
    return (
        <Router>
            <div className="app">
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/document/:id" element={user ? <Document /> : <Navigate to="/login" />} />
                        <Route path="/document-details/:id" element={user ? <DocumentDetails /> : <Navigate to="/login" />} />
                        <Route path="/chat" element={user ? <div className="placeholder-page">Chat Feature Coming Soon</div> : <Navigate to="/login" />} />
                        <Route path="/share-documents" element={user ? <div className="placeholder-page">Document Sharing Feature Coming Soon</div> : <Navigate to="/login" />} />
                        <Route path="/analytics" element={user ? <div className="placeholder-page">Analytics Feature Coming Soon</div> : <Navigate to="/login" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
