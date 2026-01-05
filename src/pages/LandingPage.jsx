import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundEffect from '../components/BackgroundEffect';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import JoinSessionModal from '../components/JoinSessionModal';



// --- Collaboration Preview Component ---
const CollaborationPreview = () => {
    const lines = [
        { code: 'const syncData = async (payload) => {', color: 'text-white' },
        { code: '  // Process incoming real-time updates', color: 'text-jb-muted' },
        { code: '  const result = await processor.handle(payload);', color: 'text-jb-text' },
        { code: '  return result.status === "success";', color: 'text-white' },
        { code: '};', color: 'text-jb-text' }
    ];

    const users = [
        { name: 'Bharat', color: 'bg-white', text: 'text-black', line: 0, pos: '35%' },
        { name: 'Alice', color: 'bg-jb-muted', text: 'text-white', line: 2, pos: '60%' },
        { name: 'David', color: 'bg-jb-secondary', text: 'text-white', line: 3, pos: '45%' }
    ];

    return (
        <div className="flex flex-col p-6 font-mono text-xs h-full bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]/50 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-jb-secondary pb-2">
                <div className="flex gap-1.5 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <span className="text-jb-muted/60 text-xs tracking-wide">workspace/Editor.js</span>
            </div>
            <div className="space-y-3 relative">
                {lines.map((line, i) => (
                    <div key={i} className="flex gap-4 group">
                        <span className="text-jb-muted/30 w-4 text-right select-none">{i + 1}</span>
                        <div className="relative flex-1">
                            <span className={line.color}>{line.code}</span>
                            
                            {/* Render Cursors for this line */}
                            {users.filter(u => u.line === i).map((user, idx) => (
                                <motion.div 
                                    key={user.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-0 bottom-0 pointer-events-none"
                                    style={{ left: user.pos }}
                                >
                                    {/* Cursor Beam */}
                                    <motion.div 
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className={`w-[2px] h-full ${user.color}`}
                                    />
                                    {/* Name Tag */}
                                    <motion.div 
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`absolute -top-5 left-0 px-1.5 py-0.5 ${user.color} ${user.text} text-[9px] font-bold rounded-sm shadow-sm whitespace-nowrap z-10`}
                                    >
                                        {user.name}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Context Chat Snippets */}
            <div className="mt-auto pt-4 border-t border-jb-secondary/50 flex flex-col gap-2">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 max-w-[80%]"
                >
                    <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-[10px] font-bold">B</div>
                    <div className="bg-jb-surface border border-jb-secondary p-2 rounded-lg text-xs text-jb-text leading-tight font-sans">
                        Should we use a more robust error handling here?
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-2 max-w-[80%] self-end flex-row-reverse"
                >
                    <div className="w-5 h-5 rounded bg-jb-secondary text-white flex items-center justify-center text-[10px] font-bold">A</div>
                    <div className="bg-jb-surface border border-jb-secondary p-2 rounded-lg text-xs text-jb-text leading-tight font-sans">
                        Added a processor.handle call to catch edge cases.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Role Preview Component (for Control Section) ---
const RolePreview = () => {
    const roles = [
        { name: 'Creator', color: 'bg-white text-black', permissions: 'Full Access • Manage Roles • Session Control', icon: '👑' },
        { name: 'Interviewer', color: 'bg-jb-text text-black', permissions: 'Edit Markdown • Run Code • Private Notes', icon: '👤' },
        { name: 'Candidate', color: 'bg-jb-secondary text-white', permissions: 'Edit Code • View Problem • Shared Chat', icon: '💻' },
        { name: 'Participant', color: 'bg-jb-surface text-jb-muted', permissions: 'View Mode • Shared Chat • View Cursor', icon: '👥' }
    ];

    return (
        <div className="flex flex-col gap-3 p-6 h-full justify-center">
            {roles.map((role, i) => (
                <motion.div 
                    key={role.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] p-4 rounded-xl border border-jb-secondary hover:border-white transition-all duration-300 group"
                >
                    <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center text-xl font-bold`}>
                        {role.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white uppercase tracking-wider">{role.name}</span>
                        </div>
                        <p className="text-xs text-jb-muted font-medium uppercase tracking-wide">{role.permissions}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="px-2 py-1 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wide">Active</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// --- Capability Section Component ---
const CapabilitySection = ({ label, headline, text, align = 'left', delay, image, children }) => {
    return (
        <motion.div 
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`py-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
            <div className={`flex-1 ${align === 'right' ? 'md:pl-10' : 'md:pr-10'}`}>
                <span className="text-xs font-bold tracking-[0.05em] text-white uppercase mb-6 block font-mono border-l-2 border-white pl-4 opacity-90">{label}</span>
                <h3 className="text-3xl md:text-[3.0rem] font-bold text-white mb-6 leading-[1.15] tracking-tight">{headline}</h3>
                <p className="text-lg text-jb-muted leading-relaxed max-w-lg font-normal">{text}</p>
            </div>
            <div className="flex-1 w-full relative">
                <div className="aspect-video bg-jb-panel rounded-xl border border-jb-secondary shadow-sm overflow-hidden relative group hover:border-jb-muted transition-all duration-500">
                    {image ? (
                        <>
                            <img 
                                src={image} 
                                alt={label} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-jb-dark/60 via-transparent to-transparent pointer-events-none" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Landing Page ---
const LandingPage = () => {
    const navigate = useNavigate();
    const { user: loggedInUser } = useAuth();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    
    // Join logic extracted from original component
    const handleJoin = (uName, rId) => {
         if (uName.trim() && rId.trim()) {
            const existingToken = localStorage.getItem('token');
            const existingUserString = localStorage.getItem('user');
            
            if (!existingToken || !existingUserString) {
                const guestUser = {
                    id: 'user-' + Math.random().toString(36).substring(2, 9),
                    username: uName.trim(),
                    role: 'Participant'
                };
                localStorage.setItem('user', JSON.stringify(guestUser));
                window.dispatchEvent(new Event('storage'));
            }
            navigate(`/documents/${rId.trim()}`);
        }
    };

    return (
        <div className="relative bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] min-h-screen text-jb-text selection:bg-white selection:text-black overflow-x-hidden">
            <BackgroundEffect />
            <JoinSessionModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoin} />

            {/* 1. Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-40 pb-32 text-center text-white" style={{ zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white max-w-5xl mx-auto leading-[1.05]">
                        A focused workspace for <br className="hidden md:block"/>
                        <span className="text-white border-b-4 border-white/20 pb-2">real-time collaboration</span>
                    </h1>
                    <p className="text-lg md:text-xl text-jb-muted max-w-2xl mx-auto mb-12 font-normal leading-relaxed text-gray-400">
                        Designed for interviews, discussions, and problem-solving. <br className="hidden md:block"/>
                        No clutter. Just clarity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button 
                            onClick={() => navigate(loggedInUser ? '/dashboard' : '/register')} 
                            className="group relative px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-white/95 transition-all transform hover:-translate-y-1 shadow-2xl shadow-indigo-500/20 border border-white"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-jb-accent/0 via-jb-secondary/10 to-jb-accent/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <span className="relative z-10">{loggedInUser ? 'Go to Dashboard' : 'Create Workspace'}</span>
                        </button>
                        <button 
                            onClick={() => setIsJoinModalOpen(true)}
                            className="px-10 py-4 bg-transparent border-2 border-gray-700 text-gray-300 hover:text-white hover:border-jb-secondary hover:bg-jb-secondary/5 text-lg font-medium rounded-full transition-all backdrop-blur-sm"
                        >
                            Join Session
                        </button>
                    </div>
                </motion.div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 text-jb-muted text-[10px] font-medium tracking-[0.2em] uppercase z-0 pointer-events-none"
                >
                    <span className="opacity-70">Scroll to explore</span>
                    <div className="w-px h-16 bg-gradient-to-b from-jb-muted/50 to-transparent" />
                </motion.div>
            </section>

            {/* 2. Identity Strip */}
            <section className="py-12 border-y border-jb-secondary bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
                    {['Technical Interviews', 'Live Pair Programming', 'Architecture Review', 'Education'].map((item, i) => (
                        <motion.span 
                            key={i}
                            initial={{ y: 10 }}
                            whileInView={{ y: 0 }}
                            transition={{ delay: i * 0.1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.05em] text-jb-muted"
                        >
                            {item}
                        </motion.span>
                    ))}
                </div>
            </section>

            {/* 3. Capabilities */}
            <CapabilitySection 
                label="COLLABORATION"
                headline="Work together, without getting in each other's way."
                text="Experience seamless real-time syncing. See who is typing, and discuss ideas in context without latency."
                align="left"
            >
                <CollaborationPreview />
            </CapabilitySection>
            <CapabilitySection 
                label="INTERVIEWS"
                headline="Built for structured discussions."
                text="Define problem statements, set timers, and take private notes. The perfect environment for evaluating technical skills objectively."
                align="right"
                delay={0.2}
                image="/visuals/interviews.png"
            />
            <CapabilitySection 
                label="CONTROL"
                headline="Everyone knows their role."
                text="Granular permissions ensure that interviewers maintain control while candidates have the freedom to demonstrate their skills."
                align="left"
            >
                <RolePreview />
            </CapabilitySection>


            {/* 5. Philosophy */}
            <section className="py-40 px-6 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">Built for clarity, not clutter.</h2>
                    <p className="text-lg md:text-xl text-jb-muted font-normal leading-relaxed max-w-2xl mx-auto">
                        No distractions. No complex setups. Just the tools you need—code execution, rich text, and communication—exactly when you need them.
                    </p>
                </motion.div>
            </section>

            {/* 6. Final CTA */}
            <section className="py-32 bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14] text-center border-t border-jb-secondary">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-5xl md:text-[5rem] font-extrabold text-white mb-8 tracking-tight leading-[1.1]">Create your first workspace.</h2>
                    <p className="text-lg text-jb-muted mb-12">No setup required.</p>
                    <button 
                         onClick={() => navigate(loggedInUser ? '/dashboard' : '/register')} 
                        className="px-10 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-white/90 transition-colors shadow-sm"
                    >
                        Start Now
                    </button>
                    <p className="mt-8 text-xs text-jb-muted tracking-wide">Free for early access users.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-jb-muted text-sm border-t border-jb-secondary bg-gradient-to-b from-[#0b0f14] via-[#0e1420] to-[#0b0f14]">
                <p>&copy; {new Date().getFullYear()} Converge. Inspired by the best in developer tools.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
