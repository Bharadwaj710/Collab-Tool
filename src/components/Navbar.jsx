import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ConvergeLogo from './ConvergeLogo';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, token, setUser, logout } = useAuth();
    const [isOpen, setIsOpen   ] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        setShowProfileModal(true);
        setIsOpen(false);
    };

    const handleProfileSave = async (profileData) => {
        try {
            const response = await axios.put('/api/users/me', profileData, { headers: { 'x-auth-token': token } });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success('Profile updated');
            setShowProfileModal(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 w-full z-50 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]/90 backdrop-blur-lg border-b border-gray-800"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                             <Link to="/">
                                 <ConvergeLogo size="sm" />
                             </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-6">
                                <Link to="/dashboard" className="text-sm font-medium text-jb-muted hover:text-jb-text transition-colors">Dashboard</Link>
                                <Link to="/" className="text-sm font-medium text-jb-muted hover:text-jb-text transition-colors">Community</Link>
                                
                                {user ? (
                                    <div className="relative ml-4 group">
                                        <button className="flex items-center gap-3 text-sm font-medium text-jb-text hover:bg-jb-panel px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-gray-700">
                                            <img 
                                                src={getAvatarUrl(user.profile?.avatarSeed || user.username)} 
                                                alt="Avatar" 
                                                className="h-6 w-6 rounded-full"
                                            />
                                            <span>{user.username}</span>
                                        </button>
                                        
                                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-jb-panel border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right overflow-hidden">
                                            <div className="py-1">
                                                <button onClick={handleProfileClick} className="block w-full text-left px-4 py-2.5 text-sm text-jb-text hover:bg-jb-surface transition-colors">
                                                    Profile Settings
                                                </button>
                                                <div className="h-px bg-gray-700 my-1 mx-2" />
                                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-jb-surface transition-colors">
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4 ml-6">
                                        <Link to="/login" className="text-sm font-medium text-jb-muted hover:text-jb-text transition-colors">Log In</Link>
                                        <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-jb-accent rounded hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Button */}
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded text-gray-400 hover:text-white">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-jb-panel border-b border-gray-800 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-4 space-y-2">
                                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-jb-text hover:bg-jb-surface rounded">Dashboard</Link>
                                <Link to="/" className="block px-3 py-2 text-base font-medium text-jb-text hover:bg-jb-surface rounded">Community</Link>
                                {user ? (
                                    <>
                                        <div className="border-t border-gray-700 my-2 pt-2">
                                            <div className="flex items-center px-3 py-2">
                                                <img src={getAvatarUrl(user.profile?.avatarSeed || user.username)} className="h-8 w-8 rounded-full" alt="" />
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-white">{user.username}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button onClick={handleProfileClick} className="block w-full text-left px-3 py-2 text-sm text-jb-text hover:bg-jb-surface rounded">Profile</button>
                                            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-jb-surface rounded">Logout</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pt-2 flex flex-col gap-2">
                                        <Link to="/login" className="block text-center px-4 py-2 text-jb-text hover:bg-jb-surface rounded">Login</Link>
                                        <Link to="/register" className="block text-center px-4 py-2 bg-jb-accent text-white rounded font-bold">Register</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {showProfileModal && user && (
                <ProfileModal user={user} onClose={() => setShowProfileModal(false)} onSave={handleProfileSave} />
            )}
        </>
    );
};

export default Navbar;
