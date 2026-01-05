import React from 'react';

/**
 * ConvergeLogo Component
 * A premium, modern developer-targeted branding component.
 * Features a geometric abstract icon representing convergence and real-time sync.
 */
const ConvergeLogo = ({ size = "md", className = "", showText = true }) => {
  const sizes = {
    sm: { height: 28, fontSize: "text-lg", gap: "gap-2" },
    md: { height: 38, fontSize: "text-2xl", gap: "gap-3" },
    lg: { height: 56, fontSize: "text-4xl", gap: "gap-4" },
    xl: { height: 80, fontSize: "text-6xl", gap: "gap-6" }
  };

  const { height, fontSize, gap } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${gap} ${className} select-none group`}>
      {/* Icon Design: Geometric abstract mark representing convergence & collaboration */}
      <svg 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 group-hover:scale-105"
      >
        <defs>
          {/* Brand Gradient: Indigo -> Violet -> Cyan */}
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          {/* Glowing Shadow Filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Sharp Glow for nodes */}
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Converging Path (Brackets Metaphor) */}
        <path 
          d="M25 20 L55 50 L25 80 L35 80 L65 50 L35 20 Z" 
          fill="url(#brand-grad)" 
          filter="url(#logo-glow)"
          className="opacity-90"
        />

        {/* Right Converging Path (Brackets Metaphor) */}
        <path 
          d="M75 20 L45 50 L75 80 L65 80 L35 50 L65 20 Z" 
          fill="url(#brand-grad)" 
          filter="url(#logo-glow)"
          className="opacity-80"
        />

        {/* Central Focus Point (Diamond) */}
        <g transform="rotate(45 50 50)">
          <rect 
            x="44" y="44" width="12" height="12" rx="2" 
            fill="white" 
            filter="url(#node-glow)"
          >
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Real-time Sync Nodes (Floating Dots) */}
        <circle cx="50" cy="12" r="3.5" fill="#22D3EE" filter="url(#node-glow)">
          <animate attributeName="cy" values="12;16;12" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="50" cy="88" r="3.5" fill="#6366F1" filter="url(#node-glow)">
          <animate attributeName="cy" values="88;84;88" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" delay="1s" />
        </circle>

        {/* Diagonal Path Dots */}
        <circle cx="20" cy="20" r="2" fill="#8B5CF6" />
        <circle cx="80" cy="80" r="2" fill="#22D3EE" />
      </svg>

      {/* Wordmark: Modern Sans-Serif Typography */}
      {showText && (
        <span className={`${fontSize} font-bold tracking-tight text-white font-sans opacity-95 group-hover:opacity-100 transition-opacity`}>
          Converge
        </span>
      )}
    </div>
  );
};

export default ConvergeLogo;
