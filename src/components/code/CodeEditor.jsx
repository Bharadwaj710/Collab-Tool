import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, onLanguageChange, isReadOnly = false }) => {
  const [value, setValue] = useState(code || '');

  // Handle external updates (socket)
  useEffect(() => {
    if (code !== undefined && code !== value) {
        setValue(code);
    }
  }, [code, value]);

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 pl-2">EDITOR</span>
        <select 
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isReadOnly}
            className="bg-gray-800 text-gray-200 text-xs rounded border border-gray-600 px-2 py-1 outline-none focus:border-indigo-500"
        >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
        </select>
      </div>
      <div className="flex-1">
        <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language} // Monaco uses 'cpp' id or 'cpp' alias? 'cpp' is valid
            value={value}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{
                readOnly: isReadOnly,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
            }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
