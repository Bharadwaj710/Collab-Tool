import React, { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

const CodeRunner = ({ code, language, isReadOnly }) => {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('stdout'); // stdout, stderr

  const handleRun = async () => {
    if (!code || !code.trim()) {
        toast.warning("Write some code first!");
        return;
    }

    setLoading(true);
    setOutput(null);

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/execute', 
            { language, sourceCode: code },
            { headers: { 'x-auth-token': token } }
        );
        setOutput(response.data);
        if (response.data.stderr) setActiveTab('stderr');
        else if (response.data.compile_output) setActiveTab('compile');
        else setActiveTab('stdout');
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Execution Failed");
    } finally {
        setLoading(false);
    }
  };

  const hasOutput = output !== null;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-gray-700 w-80 flex-shrink-0 font-mono text-sm shadow-xl z-20">
        <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center bg-[#2b2d30]">
            <span className="text-xs font-bold text-gray-400 tracking-wider">TERMINAL</span>
            <button 
                onClick={handleRun}
                disabled={loading || isReadOnly}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all ${
                    loading || isReadOnly
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 text-white shadow shadow-green-900/40'
                }`}
            >
                {loading ? (
                    <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Running...</>
                ) : (
                    <>▶ Run</>
                )}
            </button>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e] text-gray-300 custom-scrollbar">
            {!hasOutput && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-60">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-sans">Ready to execute</span>
                </div>
            )}
            
            {hasOutput && (
                <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${output.status?.id === 3 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                output.status?.id === 3 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {output.status?.description || 'Unknown'}
                            </span>
                         </div>
                         <span className="text-gray-600 text-[10px]">{output.time ? `${output.time}s` : ''}</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex mb-2 space-x-4">
                        {['stdout', 'stderr', 'compile'].map(tab => {
                             const hasContent = tab === 'stdout' ? output.stdout : (tab === 'stderr' ? output.stderr : output.compile_output);
                             if (!hasContent && tab !== 'stdout') return null;

                             return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[10px] uppercase font-bold pb-1 border-b-2 transition-colors ${
                                        activeTab === tab 
                                        ? 'border-indigo-500 text-indigo-400' 
                                        : 'border-transparent text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    {tab}
                                </button>
                             );
                        })}
                    </div>

                    {/* Content */}
                    <pre className={`whitespace-pre-wrap break-all text-xs font-mono leading-relaxed ${
                        activeTab === 'stderr' || activeTab === 'compile' ? 'text-red-400' : 'text-gray-300'
                    }`}>
                        {(activeTab === 'stdout' ? output.stdout : (activeTab === 'stderr' ? output.stderr : output.compile_output)) || <span className="text-gray-600 italic">// No output to display</span>}
                    </pre>
                </div>
            )}
        </div>
    </div>
  );
};

export default CodeRunner;
