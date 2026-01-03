import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import BackgroundEffect from './BackgroundEffect.js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
    const loginButtonRef = useRef(null);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            console.log('Attempting login for:', formData.identifier);
            const response = await axios.post(`${API_URL}/api/users/login`, {
                identifier: formData.identifier,
                password: formData.password
            });
            
            console.log('Login response received:', response.status);
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
            console.error('Login error:', msg);
            setError(`Login failed: ${msg}`);
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
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder=" " 
                            required
                            disabled={loading}
                        />
                        <label htmlFor="identifier">Username or Email</label>
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