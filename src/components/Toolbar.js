import React from 'react';

const Toolbar = () => {
  const handleBold = () => {
    document.execCommand('bold');
  };

  const handleItalic = () => {
    document.execCommand('italic');
  };

  const handleUnderline = () => {
    document.execCommand('underline');
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <button onClick={handleBold}>B</button>
      <button onClick={handleItalic}>I</button>
      <button onClick={handleUnderline}>U</button>
      {/* Add more toolbar options here */}
    </div>
  );
};

export default Toolbar;