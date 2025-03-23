import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

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
  
  useEffect(() => {
    // Create background elements
    const createBackgroundElements = () => {
      if (!backgroundContainerRef.current) return;
      
      // Clear any existing elements first
      while (backgroundContainerRef.current.firstChild) {
        backgroundContainerRef.current.removeChild(backgroundContainerRef.current.firstChild);
      }
      
      elements.current = [];
      
      for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.className = 'background-element';
        
        // Random size between 100px and 300px
        const size = Math.random() * 2000 + 1000;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        
        // Random position
        element.style.left = `${(i+1) * 15}%`;
        element.style.top = `${(i+1) * 10}%`;
        
        // Random opacity
        element.style.opacity = '0.3';
        
        // Initial transform
        element.style.transform = 'scale(1)';
        
        backgroundContainerRef.current.appendChild(element);
        elements.current.push(element);
      }
    };
    
    // Set up the animation and hover effects
    const setupInteractions = () => {
      if (!startButtonRef.current) return;
      
      // Mouse enter effect (glow and scale)
      startButtonRef.current.addEventListener('mouseenter', () => {
        elements.current.forEach(element => {
          // Random scale between 1.1 and 1.3
          const scale = Math.random() * 0.2 + 1.1;
          element.style.transform = `scale(${scale})`;
          element.style.opacity = (parseFloat(element.style.opacity) + 0.1).toString();
          element.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
        });
      });
      
      // Mouse leave effect (return to normal)
      startButtonRef.current.addEventListener('mouseleave', () => {
        elements.current.forEach(element => {
          element.style.transform = 'scale(1)';
          element.style.opacity = (parseFloat(element.style.opacity) - 0.1).toString();
          element.style.boxShadow = '0 0 5px rgba(250, 208, 0, 0.85)';
        });
      });
    };
    
    // Animation loop for subtle movement
    const animateElements = () => {
      elements.current.forEach((element, index) => {
        const movementX = Math.sin(Date.now() * 0.001 + index) * 5;
        const movementY = Math.cos(Date.now() * 0.001 + index) * 5;
        const currentTransform = element.style.transform;
        
        // Extract current scale if it exists
        let scale = 1;
        if (currentTransform.includes('scale')) {
          scale = parseFloat(currentTransform.split('scale(')[1]);
        }
        
        element.style.transform = `translate(${movementX}px, ${movementY}px) scale(${scale})`;
      });
      
      animationFrameId = requestAnimationFrame(animateElements);
    };
    
    createBackgroundElements();
    setupInteractions();
    let animationFrameId = requestAnimationFrame(animateElements);
    
    // Clean up animation when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="landing-container">
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