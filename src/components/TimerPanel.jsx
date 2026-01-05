import React, { useState } from 'react';

const TimerPanel = ({ timer, isPrivileged, onTimerControl }) => {
    const [customTime, setCustomTime] = useState(0);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700 shadow-lg mt-4">
            <div className={`
                text-4xl font-mono text-center font-bold tracking-widest my-3
                ${timer.remaining < 60 && timer.remaining > 0 ? 'text-red-500 animate-pulse' : 'text-white'}
            `}>
                {formatTime(timer.remaining)}
            </div>
            
            {isPrivileged && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-center">
                        <input 
                            type="number" 
                            value={customTime} 
                            onChange={(e) => setCustomTime(e.target.value)} 
                            className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none text-center"
                            min="1"
                            placeholder="Min"
                        />
                        <button 
                            onClick={() => onTimerControl('start', customTime * 60)} 
                            className="bg-jb-accent hover:bg-indigo-600 text-white text-xs font-bold py-1 px-3 rounded transition-colors shadow-sm"
                        >
                            Set & Start
                        </button>
                    </div>
                    
                    <div className="flex gap-2 justify-center mt-1">
                        {timer.isRunning ? 
                            <button 
                                onClick={() => onTimerControl('pause')} 
                                className="flex-1 bg-jb-panel hover:bg-jb-surface text-jb-secondary text-xs font-bold py-1.5 px-3 rounded border border-jb-secondary/50 transition-colors flex items-center justify-center gap-1"
                            >
                                Pause
                            </button> :
                            <button 
                                onClick={() => onTimerControl('start')} 
                                className="flex-1 bg-jb-secondary/20 hover:bg-jb-secondary/30 text-jb-secondary text-xs font-bold py-1.5 px-3 rounded border border-jb-secondary/30 transition-colors flex items-center justify-center gap-1"
                            >
                                Resume
                            </button>
                        }
                        <button 
                            onClick={() => onTimerControl('reset')} 
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-1.5 px-3 rounded border border-red-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimerPanel;
