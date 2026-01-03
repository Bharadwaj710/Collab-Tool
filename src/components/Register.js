import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import BackgroundEffect from './BackgroundEffect.js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const registerButtonRef = useRef(null);

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
            const response = await axios.post(`${API_URL}/api/users/register`, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
            setError(`Registration failed: ${msg}`);
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
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            disabled={loading}
                        />
                        <label htmlFor="email">Email Address</label>
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