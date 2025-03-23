import React, { useEffect, useRef } from 'react';
import './BackgroundEffect.css';

const BackgroundEffect = ({ targetButtonRef }) => {
  const backgroundContainerRef = useRef(null);
  const elements = useRef([]);
  const elementCount = 5; // Adjust the number of circles as needed

  useEffect(() => {
    const createBackgroundElements = () => {
      if (!backgroundContainerRef.current) return;

      // Clear any existing elements
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

    const setupInteractions = () => {
      if (!targetButtonRef?.current) return;

      // Mouse enter effect (glow and scale)
      targetButtonRef.current.addEventListener('mouseenter', () => {
        elements.current.forEach(element => {
          // Random scale between 1.1 and 1.3
          const scale = Math.random() * 0.2 + 1.1;
          element.style.transform = `scale(${scale})`;
          element.style.opacity = (parseFloat(element.style.opacity) + 0.1).toString();
          element.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
        });
      });


      // Mouse leave effect (return to normal)
      targetButtonRef.current.addEventListener('mouseleave', () => {
        elements.current.forEach((element) => {
          element.style.transform = 'scale(1)';
          element.style.opacity = (parseFloat(element.style.opacity) - 0.1).toString();
          element.style.boxShadow = '0 0 5px rgba(250, 208, 0, 0.85)';
        });
      });
    };

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