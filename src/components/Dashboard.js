import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.log('No user found in localStorage');
                setDocuments([]);
                setLoading(false);
                return;
            }
            
            const user = JSON.parse(userStr);
            const token = user ? user.token : null;
            
            if (!token) {
                console.log('Invalid user data or missing token');
                setDocuments([]);
                setLoading(false);
                return;
            }

            const { data } = await axios.get('http://localhost:5000/api/documents', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 5000
            });
            
            setDocuments(data);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            setDocuments([]);
            setError('Warning: Backend connection issue. Some features may not work properly.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        
        // Listen for document creation events
        const handleDocumentCreated = () => {
            fetchDocuments();
        };
        
        window.addEventListener('documentCreated', handleDocumentCreated);
        
        return () => {
            window.removeEventListener('documentCreated', handleDocumentCreated);
        };
    }, []);

    // Check for refresh state from navigation
    useEffect(() => {
        if (location.state?.refresh) {
            fetchDocuments();
            // Clear the state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    if (loading) {
        return (
            <div className="container text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading your documents...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="my-4">Dashboard</h2>
            
            {error && (
                <div className="alert alert-warning mb-4">
                    {error}
                </div>
            )}
            
            {documents.length === 0 && !error ? (
                <div className="alert alert-info mb-4">
                    You don't have any documents yet. Create your first document below!
                </div>
            ) : (
                <div className="row mb-4">
                    {documents.map((doc) => (
                        <div key={doc._id} className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{doc.title}</h5>
                                    <p className="card-text">
                                        Created on: {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                    <Link
                                        to={`/document/${doc._id}`}
                                        className="btn btn-lg w-100 mb-3 mt-auto"
                                        style={{
                                            backgroundColor: "#FFAF00",
                                            color: "white",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        Open Document
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="text-center mt-4">
                <button
                    className="btn btn-lg mb-3"
                    style={{
                        backgroundColor: "#F5004F",
                        color: "white",
                        borderRadius: "12px",
                    }}
                    onClick={() => navigate("/document/new")}
                >
                    Create New Document
                </button>
            </div>
        </div>
    );
};

export default Dashboard;