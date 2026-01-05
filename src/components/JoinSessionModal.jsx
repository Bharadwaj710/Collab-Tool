import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JoinSessionModal = ({ isOpen, onClose, onJoin }) => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onJoin(username, roomId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-jb-panel w-full max-w-md p-8 rounded-2xl border border-gray-700 shadow-2xl pointer-events-auto mx-4">
                            <h3 className="text-2xl font-bold text-white mb-2 text-center">Join Session</h3>
                            <p className="text-jb-muted text-center mb-6 text-sm">Enter the room details to connect.</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-jb-muted uppercase mb-1 ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alice"
                                        className="w-full px-4 py-3 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-jb-accent focus:ring-1 focus:ring-jb-accent transition-all font-mono text-sm"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-jb-muted uppercase mb-1 ml-1">Room ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. document-123"
                                        className="w-full px-4 py-3 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-jb-accent focus:ring-1 focus:ring-jb-accent transition-all font-mono text-sm"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full py-3.5 bg-jb-accent hover:bg-indigo-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20 mt-2"
                                >
                                    Connect to Room
                                </button>
                            </form>
                            
                            <button 
                                onClick={onClose}
                                className="w-full mt-4 py-2 text-sm text-jb-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JoinSessionModal;
