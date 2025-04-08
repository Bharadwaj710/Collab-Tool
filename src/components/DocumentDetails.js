import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DocumentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const message = location.state?.message;

    useEffect(() => {
        if (message) {
            setSuccessMessage(message);
            
            // Clear the message after 5 seconds
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [message]);

    const getDocumentById = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.get(`http://localhost:5000/api/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const updateDocument = async (id, data) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.put(
                `http://localhost:5000/api/documents/${id}`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const deleteDocument = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            await axios.delete(
                `http://localhost:5000/api/documents/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setLoading(true);
                const doc = await getDocumentById(id);
                setDocument(doc);
                setTitle(doc.title);
                setContent(doc.content);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch document');
                setLoading(false);
            }
        };
        
        fetchDocument();
    }, [id]);

    useEffect(() => {
        socket.emit('joinDocument', id);

        socket.on('receiveUpdate', (updatedData) => {
            if (updatedData.title) setTitle(updatedData.title);
            if (updatedData.content) setContent(updatedData.content);
        });

        return () => {
            socket.emit('leaveDocument', id);
            socket.off();
        };
    }, [id]);

    const handleUpdate = async () => {
        try {
            await updateDocument(id, { title, content });
            socket.emit('documentUpdate', { documentId: id, title, content });
            setSuccessMessage('Document updated successfully!');
            
            // Clear the success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (error) {
            setError('Failed to update document');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDocument(id);
            // Navigate to dashboard with refresh flag
            navigate('/dashboard', { state: { refresh: true } });
        } catch (error) {
            setError('Failed to delete document');
        }
    };

    const handleBack = () => {
        // Navigate back to dashboard with refresh flag
        navigate('/dashboard', { state: { refresh: true } });
    };

    if (loading) {
        return (
            <div className="container text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading document...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={handleBack}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!document && !loading) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">Document not found</div>
                <button className="btn btn-primary" onClick={handleBack}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
            <h2 className="mb-4">Document Details</h2>
            <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    className="form-control form-control-lg"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        socket.emit('documentUpdate', { documentId: id, title: e.target.value, content });
                    }}
                />
            </div>
            <div className="form-group mt-3">
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    className="form-control form-control-lg"
                    rows="10"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        socket.emit('documentUpdate', { documentId: id, title, content: e.target.value });
                    }}
                />
            </div>
            <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={handleUpdate}>Update</button>
                <button className="btn btn-danger me-2" onClick={handleDelete}>Delete</button>
                <button className="btn btn-secondary" onClick={handleBack}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default DocumentDetails;