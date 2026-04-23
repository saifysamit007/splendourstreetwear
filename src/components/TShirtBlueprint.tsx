import React from 'react';

interface TShirtBlueprintProps {
  className?: string;
  showLabels?: boolean;
}

export default function TShirtBlueprint({ className = '', showLabels = true }: TShirtBlueprintProps) {
  return (
    <div className={`relative w-full aspect-square flex items-center justify-center p-4 bg-brand-card/50 rounded-3xl border border-white/10 shadow-inner group ${className}`}>
      {/* CAD Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none rounded-3xl" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full text-white relative z-10" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow Drop Under the Shirt */}
        <path d="M120 345 L280 345" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />

        {/* T-Shirt Outline (Architectural Style) */}
        <path 
          d="M110 90 
             C110 90, 155 78, 200 85 
             C245 78, 290 90, 290 90 
             L350 135 
             L315 185 
             L275 165 
             L275 350 
             L125 350 
             L125 165 
             L85 185 
             L50 135 
             Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinejoin="round"
          className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        />
        
        {/* Collar Inner */}
        <path 
          d="M165 82 C165 82, 200 105, 235 82" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* 1. Body Length Line (Technical Detail) */}
        <g className="text-brand-red">
          <line x1="75" y1="90" x2="75" y2="350" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="90" x2="85" y2="90" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="350" x2="85" y2="350" stroke="currentColor" strokeWidth="2" />
          {showLabels && (
            <text x="60" y="220" fill="currentColor" fontSize="11" fontWeight="900" transform="rotate(-90 60 220)" textAnchor="middle" className="font-mono uppercase tracking-[0.2em] drop-shadow-sm">
              [ LENGTH ]
            </text>
          )}
        </g>

        {/* 2. Chest Width (Technical Detail) */}
        <g className="text-brand-red">
          <line x1="125" y1="210" x2="275" y2="210" stroke="currentColor" strokeWidth="2" />
          <line x1="125" y1="200" x2="125" y2="220" stroke="currentColor" strokeWidth="2" />
          <line x1="275" y1="200" x2="275" y2="220" stroke="currentColor" strokeWidth="2" />
          {showLabels && (
            <text x="200" y="200" fill="currentColor" fontSize="11" fontWeight="900" textAnchor="middle" className="font-mono uppercase tracking-[0.2em] drop-shadow-sm">
              [ WIDTH ]
            </text>
          )}
        </g>

        {/* 3. Sleeve Opening (Technical Detail) */}
        <g className="text-brand-red">
          <line x1="320" y1="180" x2="355" y2="135" stroke="currentColor" strokeWidth="2" />
          <line x1="315" y1="172" x2="328" y2="185" stroke="currentColor" strokeWidth="2" />
          <line x1="348" y1="128" x2="361" y2="142" stroke="currentColor" strokeWidth="2" />
          {showLabels && (
            <text x="355" y="170" fill="currentColor" fontSize="10" fontWeight="900" transform="rotate(-53 355 170)" textAnchor="start" className="font-mono uppercase tracking-[0.1em] drop-shadow-sm">
              SLEEVE OPENING
            </text>
          )}
        </g>

        {/* Points of Interest */}
        <circle cx="200" cy="85" r="4" fill="currentColor" className="text-brand-red animate-pulse" />
        <circle cx="290" cy="90" r="3" fill="white" opacity="0.5" />
        <circle cx="110" cy="90" r="3" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}
