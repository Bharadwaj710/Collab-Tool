import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivateNotes = ({ privateNotes, noteInput, setNoteInput, onAddNote, onDeleteNote }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddNote();
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-jb-panel/50 backdrop-blur-md rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]/40 border-b border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-jb-secondary animate-pulse" />
                    <h4 className="text-[11px] font-bold text-jb-muted uppercase tracking-[0.15em] font-sans">
                        Private Notes
                    </h4>
                </div>
                <div className="flex items-center gap-1.5 bg-jb-accent/10 px-2 py-0.5 rounded-full border border-jb-accent/20">
                    <svg className="w-3 h-3 text-jb-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-bold text-jb-accent uppercase">Locked</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]/20">
                <AnimatePresence initial={false}>
                    {privateNotes.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center px-6"
                        >
                            <div className="w-12 h-12 bg-jb-panel rounded-full flex items-center justify-center mb-4 border border-gray-800/50">
                                <svg className="w-6 h-6 text-jb-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <p className="text-xs text-jb-muted italic font-medium leading-relaxed">
                                Your private space for thoughts <br/> and interview feedback.
                            </p>
                            <p className="text-[10px] text-jb-muted/40 mt-2 uppercase tracking-tighter">
                                Only you can see this
                            </p>
                        </motion.div>
                    ) : (
                        privateNotes.map((note, i) => (
                            <motion.div 
                                key={note.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="group bg-jb-surface/30 p-3.5 rounded-lg border border-gray-800/40 hover:border-jb-accent/20 transition-all duration-300 shadow-sm relative"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-jb-accent/50" />
                                        <span className="text-[10px] font-bold font-mono text-jb-muted/60 uppercase">
                                            {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onDeleteNote(note.id || i)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300"
                                        title="Delete note"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-jb-text leading-relaxed font-sans font-light selection:bg-jb-accent/30 tracking-tight whitespace-pre-wrap">
                                    {note.text}
                                </p>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <div className="p-4 border-t border-gray-800/80 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]/40">
                <div className="relative group">
                    <textarea 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows="2"
                        className="w-full bg-jb-panel border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-jb-text placeholder-gray-600 focus:outline-none focus:border-jb-accent focus:ring-1 focus:ring-jb-accent/30 transition-all shadow-inner resize-none custom-scrollbar font-sans"
                        placeholder="Type a private note..."
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[10px] text-jb-muted/50 font-mono">⏎ to add</span>
                        <button 
                            onClick={onAddNote}
                            disabled={!noteInput.trim()}
                            className="p-1.5 bg-jb-accent hover:bg-indigo-600 disabled:bg-gray-700 text-white rounded-lg transition-all shadow-lg shadow-jb-accent/20"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateNotes;
