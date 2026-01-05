import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import BackgroundEffect from '../components/BackgroundEffect';
import { useAuth } from '../context/AuthContext';
import ConvergeLogo from '../components/ConvergeLogo';

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
    const { token, setToken, setUser } = useAuth();
    const registerButtonRef = useRef(null);

    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

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
            const response = await axios.post('/api/users/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('storage'));
            
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
            setError(`Registration failed: ${msg}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] overflow-hidden relative py-12">
            <BackgroundEffect />
            <div className="relative z-10 w-full max-w-md mx-4 p-8 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-8">
                    <ConvergeLogo size="md" />
                </div>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center mb-6">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="peer w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Username"
                            required
                            disabled={loading}
                        />
                        <label 
                            htmlFor="username"
                            className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all 
                                       peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 
                                       peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 peer-focus:bg-gray-900 peer-focus:px-1 pointer-events-none"
                        >
                            Username
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="peer w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Email Address"
                            required
                            disabled={loading}
                        />
                        <label 
                            htmlFor="email"
                            className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all 
                                       peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 
                                       peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 peer-focus:bg-gray-900 peer-focus:px-1 pointer-events-none"
                        >
                            Email Address
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="peer w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Password"
                            required
                            minLength="6"
                            disabled={loading}
                        />
                        <label 
                            htmlFor="password"
                            className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all 
                                       peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 
                                       peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 peer-focus:bg-gray-900 peer-focus:px-1 pointer-events-none"
                        >
                            Password
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="peer w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Confirm Password"
                            required
                            minLength="6"
                            disabled={loading}
                        />
                        <label 
                            htmlFor="confirmPassword"
                            className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all 
                                       peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 
                                       peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 peer-focus:bg-gray-900 peer-focus:px-1 pointer-events-none"
                        >
                            Confirm Password
                        </label>
                    </div>
                    <button 
                        type="submit" 
                        ref={registerButtonRef}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div className="mt-8 text-center text-gray-400 text-sm">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1 transition-colors">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
