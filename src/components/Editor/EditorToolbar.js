import React from 'react';

// Icons for toolbar buttons
const BoldIcon = () => <strong>B</strong>;
const ItalicIcon = () => <em>I</em>;
const UnderlineIcon = () => <span style={{ textDecoration: 'underline' }}>U</span>;
const StrikethroughIcon = () => <span style={{ textDecoration: 'line-through' }}>S</span>;

const EditorToolbar = () => {
  return (
    <div id="toolbar" style={{ 
      padding: '10px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      gap: '10px'
    }}>
      <span className="ql-formats">
        <select className="ql-header" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="">Normal</option>
        </select>
      </span>
      
      <span className="ql-formats">
        <button className="ql-bold">
          <BoldIcon />
        </button>
        <button className="ql-italic">
          <ItalicIcon />
        </button>
        <button className="ql-underline">
          <UnderlineIcon />
        </button>
        <button className="ql-strike">
          <StrikethroughIcon />
        </button>
      </span>
      
      <span className="ql-formats">
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
      </span>
      
      <span className="ql-formats">
        <button className="ql-link"></button>
        <button className="ql-image"></button>
      </span>
      
      <span className="ql-formats">
        <select className="ql-align"></select>
      </span>
      
      <span className="ql-formats">
        <select className="ql-color"></select>
        <select className="ql-background"></select>
      </span>
    </div>
  );
};

export default EditorToolbar;