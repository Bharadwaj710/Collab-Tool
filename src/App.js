import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import DocumentForm from './components/DocumentForm';
import DocumentDetails from './components/DocumentDetails';
import LandingPage from './components/LandingPage';
import Document from './components/Document';
import VideoCollaboration from './components/VideoCollaboration';
import './App.css';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/document/:id" element={<Document />} />
                <Route path="/document/:id" element={<DocumentDetails/>} />
                <Route path="/document/new" element={<DocumentForm />} />
                <Route path="/chat" element={<div className="placeholder-page">Chat Feature Coming Soon</div>} />
        <Route path="/share-documents" element={<div className="placeholder-page">Document Sharing Feature Coming Soon</div>} />
        <Route path="/analytics" element={<div className="placeholder-page">Analytics Feature Coming Soon</div>} />
            </Routes>
        </Router>
    );
}

export default App;
