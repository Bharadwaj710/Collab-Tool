import React from 'react';

const ProblemStatement = ({ problemStatement, isPrivileged, onProblemChange }) => {
    return (
        <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-sm z-20">
            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Problem Statement</h4>
            {isPrivileged ? (
                <textarea 
                    value={problemStatement} 
                    onChange={onProblemChange} 
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y min-h-[80px]"
                    rows={2}
                    placeholder="Enter problem statement here..."
                />
            ) : (
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-gray-200 min-h-[80px] whitespace-pre-wrap">
                    {problemStatement || <span className="text-gray-500 italic">Waiting for problem statement...</span>}
                </div>
            )}
        </div>
    );
};

export default ProblemStatement;
