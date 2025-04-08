import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DocumentForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : null;
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const { data } = await axios.post(
                'http://localhost:5000/api/documents',
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setLoading(false);
            
            // Dispatch event to refresh the dashboard
            const event = new Event('documentCreated');
            window.dispatchEvent(event);
            
            // Navigate back to dashboard with refresh flag
            navigate('/dashboard', { 
                state: { refresh: true }
            });
        } catch (error) {
            setLoading(false);
            setError(error.response?.data?.message || 'Failed to create document');
            console.error('Failed to create document:', error);
            
            if (error.response && error.response.status === 401) {
                // Redirect to login for auth errors
                navigate('/login');
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create New Document</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control form-control-lg"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Content</label>
                    <textarea
                        className="form-control form-control-lg"
                        id="content"
                        rows="10"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-lg mb-3"
                    style={{ backgroundColor: "#ff8000", color: "white", borderRadius: "12px" }}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </form>
        </div>
    );
};

export default DocumentForm;