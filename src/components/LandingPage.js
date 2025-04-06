import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import BackgroundEffect from './BackgroundEffect.js';

const LandingPage = () => {
  const backgroundContainerRef = useRef(null);
  const startButtonRef = useRef(null);
    const [displayText, setDisplayText] = useState('');
    const fullText = [
      'Collaborate with \n ',
      <span key="ease" style={{ backgroundColor: '#e1782dd8', color: '#ffffff', padding: '0 4px' }}>
        Ease
      </span>,
      '.'
    ];
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 498);
    
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="landing-container">
         <BackgroundEffect targetButtonRef={startButtonRef} />
      <div className="background-container" ref={backgroundContainerRef}></div>
      <div className="landing-content">
      <h1 className="landing-title">
          {displayText}
          <span className="cursor"></span>
          <span className="ease"></span>
        </h1>
        <p className="landing-description">
          CollabTool is your go-to platform for seamless real-time collaboration. 
        </p>       
        <p className="landing-subtext"> 
          CollabTool offers all the features you need to stay productive.
        </p>
        
        <div className="landing-buttons">
          <Link to="/register" className="btn btn-primary" ref={startButtonRef}>Start for free</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;