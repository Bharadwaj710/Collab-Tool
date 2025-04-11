import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import BackgroundEffect from './BackgroundEffect.js';

const Login = () => {
    const loginButtonRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // For testing purposes, we'll manually log in the user
            // This will bypass API login until we fix backend issues
            const mockToken = 'temp-token-' + Math.random().toString(36).substring(2, 15);
            
            // Store token directly in localStorage
            localStorage.setItem('token', mockToken);
            
            // Also store user data for reference if needed
            localStorage.setItem('user', JSON.stringify({
                username: formData.username,
                token: mockToken
            }));
            
            // Wait a bit to simulate network latency
            setTimeout(() => {
                setLoading(false);
                navigate('/dashboard');
            }, 1000);
            
            // Comment out the actual API call for now
            /*
            const response = await axios.post('http://localhost:5000/api/users/login', {
                username: formData.username,
                password: formData.password
            });
            
            // Store token directly in localStorage
            localStorage.setItem('token', response.data.token);
            
            // Also store user data separately
            localStorage.setItem('user', JSON.stringify({
                username: formData.username,
                token: response.data.token
            }));
            
            setLoading(false);
            navigate('/dashboard');
            */
            
        } catch (err) {
            setLoading(false);
            
            // Enhanced error handling to show more specific errors
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);
                setError(`Login failed: ${err.response.data.message || err.response.statusText}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Please check your internet connection.');
            } else {
                console.error('Request error:', err.message);
                setError(`Request error: ${err.message}`);
            }
        }
    };

    return (
        <div className="auth-container">
            <BackgroundEffect targetButtonRef={loginButtonRef} />
            <div className="auth-form-container">
                <h2>Login to CollabTool</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder=" " 
                            required
                            disabled={loading}
                        />
                        <label htmlFor="username">Username</label>
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder=" " 
                            required
                            disabled={loading}
                        />
                        <label htmlFor="password">Password</label>
                    </div>
                    <button 
                        type="submit" 
                        className="auth-button"
                        ref={loginButtonRef}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="auth-redirect">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;