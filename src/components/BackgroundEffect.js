import React, { useEffect, useRef } from 'react';
import './BackgroundEffect.css';

const BackgroundEffect = ({ targetButtonRef }) => {
  const backgroundContainerRef = useRef(null);
  const elements = useRef([]);
  const elementPositions = [
    { left: '20%', top: '30%' }, // Fixed positions for circles
    { left: '40%', top: '50%' },
  ];
  const elementSize = 2000; // Fixed size for all circles

  useEffect(() => {
    const createBackgroundElements = () => {
      if (!backgroundContainerRef.current) return;

      // Clear any existing elements
      while (backgroundContainerRef.current.firstChild) {
        backgroundContainerRef.current.removeChild(backgroundContainerRef.current.firstChild);
      }

      elements.current = [];

      elementPositions.forEach((position, i) => {
        const element = document.createElement('div');
        element.className = 'background-element';

        // Set fixed size
        element.style.width = `${elementSize}px`;
        element.style.height = `${elementSize}px`;

        // Set fixed position
        element.style.left = position.left;
        element.style.top = position.top;

        // Set opacity and initial transform
        element.style.opacity = '0.3';
        element.style.transform = 'scale(1)';

        backgroundContainerRef.current.appendChild(element);
        elements.current.push(element);
      });
    };

    const setupInteractions = () => {
      if (!targetButtonRef?.current) return;

      // Mouse enter effect (glow and scale)
      targetButtonRef.current.addEventListener('mouseenter', () => {
        elements.current.forEach((element) => {
          element.style.transform = 'scale(1.2)';
          element.style.opacity = '0.5';
          element.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
        });
      });

      // Mouse leave effect (return to normal)
      targetButtonRef.current.addEventListener('mouseleave', () => {
        elements.current.forEach((element) => {
          element.style.transform = 'scale(1)';
          element.style.opacity = '0.3';
          element.style.boxShadow = 'none';
        });
      });
    };

    const animateElements = () => {
      elements.current.forEach((element, index) => {
        const movementX = Math.sin(Date.now() * 0.001 + index) * 5; // Slight horizontal hover
        const movementY = Math.cos(Date.now() * 0.001 + index) * 5; // Slight vertical hover

        element.style.transform = `translate(${movementX}px, ${movementY}px) scale(1)`;
      });

      requestAnimationFrame(animateElements);
    };

    createBackgroundElements();
    setupInteractions();
    const animationFrameId = requestAnimationFrame(animateElements);

    // Clean up animation when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetButtonRef]);

  return <div className="background-container" ref={backgroundContainerRef}></div>;
};

export default BackgroundEffect;