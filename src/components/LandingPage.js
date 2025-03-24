import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import BackgroundEffect from './BackgroundEffect';

const LandingPage = () => {
  const backgroundContainerRef = useRef(null);
  const startButtonRef = useRef(null);
  const elements = useRef([]);
  const elementCount = 2;
    const [displayText, setDisplayText] = useState('');
  const fullText = 'Welcome to \n CollabTool';
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
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