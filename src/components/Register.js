import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import BackgroundEffect from './BackgroundEffect.js';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const registerButtonRef = useRef(null);

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // For testing purposes we'll manually create a user object
            // This will bypass API registration until we fix backend issues
            const mockToken = 'temp-token-' + Math.random().toString(36).substring(2, 15);
            
            // Store token directly in localStorage
            localStorage.setItem('token', mockToken);
            
            // Also store user data separately
            localStorage.setItem('user', JSON.stringify({
                name: formData.name,
                email: formData.email,
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
            const response = await axios.post('http://localhost:5000/api/users/register', {
                name: formData.name,
                email: formData.email,
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
                setError(`Registration failed: ${err.response.data.message || err.response.statusText}`);
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
            <BackgroundEffect targetButtonRef={registerButtonRef} />
            <div className="auth-form-container">
                <h2>Create an Account</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            disabled={loading}
                        />
                        <label htmlFor="name">Full Name</label>
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            disabled={loading}
                        />
                        <label htmlFor="email">Email</label>
                    </div>
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
                            minLength="6"
                            disabled={loading}
                        />
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            minLength="6"
                            disabled={loading}
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    <button 
                        type="submit" 
                        className="auth-button" 
                        ref={registerButtonRef}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-redirect">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;