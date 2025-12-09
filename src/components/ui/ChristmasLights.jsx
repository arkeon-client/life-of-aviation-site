import React from 'react';

export default function ChristmasLights() {
  // Generate 16 bulbs for the width of the navbar
  const bulbs = Array.from({ length: 16 });

  return (
    <div className="absolute -top-3 -left-2 -right-2 h-24 z-[60] pointer-events-none overflow-visible">
      
      {/* 1. The Wire (Coiled/Draped Look) */}
      <svg 
        className="absolute top-4 left-0 w-full h-full overflow-visible drop-shadow-md" 
        preserveAspectRatio="none"
        viewBox="0 0 100 20"
      >
        {/* Main Wire draping over */}
        <path 
          d="M0,2 Q10,-2 20,2 T40,2 T60,2 T80,2 T100,2" 
          fill="none" 
          stroke="#0f172a" 
          strokeWidth="0.4"
          className="opacity-80"
        />
        {/* Second tangled wire for 'wrapped' effect */}
        <path 
          d="M0,2 Q15,6 30,2 T60,2 T90,2" 
          fill="none" 
          stroke="#1e293b" 
          strokeWidth="0.3"
          className="opacity-60"
        />
      </svg>

      {/* 2. The 3D Bulbs */}
      <div className="flex justify-between w-full px-2 relative">
        {bulbs.map((_, i) => {
          // Alternating lengths to simulate "wrapped" vs "hanging"
          const isLong = i % 3 === 0; // Every 3rd bulb hangs low
          const isOnGlass = i % 2 !== 0 && !isLong; // Some sit ON the navbar
          
          return (
            <div 
              key={i} 
              className={`bulb-wrapper type-${i % 4}`}
              style={{ 
                marginTop: isLong ? '24px' : isOnGlass ? '12px' : '4px',
                transform: `rotate(${Math.random() * 10 - 5}deg)` // Random subtle tilt
              }}
            >
              {/* The Cord connecting bulb to main wire */}
              <div className="cord" style={{ height: isLong ? '12px' : '6px' }}></div>
              
              {/* The Bulb Assembly */}
              <div className="socket"></div>
              <div className="bulb">
                <div className="reflection"></div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .bulb-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 60; /* Above the navbar glass */
          animation: swing 3s ease-in-out infinite alternate;
        }

        /* Randomize swing durations */
        .bulb-wrapper:nth-child(2n) { animation-duration: 3.5s; }
        .bulb-wrapper:nth-child(3n) { animation-duration: 4s; }

        .cord {
          width: 1px;
          background: #334155;
          margin-bottom: -1px;
        }

        .socket {
          width: 6px;
          height: 6px;
          background: linear-gradient(90deg, #1e293b, #475569, #1e293b);
          border-radius: 1px;
          margin-bottom: -1px;
          z-index: 2;
        }

        .bulb {
          width: 12px;
          height: 18px;
          border-radius: 50% 50% 45% 45%;
          position: relative;
          z-index: 1;
          transition: box-shadow 0.3s ease;
        }

        /* The "Wet" 3D Highlight */
        .reflection {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 4px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          transform: rotate(-20deg);
          filter: blur(0.5px);
        }

        /* --- COLORS & GLOW ANIMATIONS --- */

        /* Red */
        .type-0 .bulb {
          background: radial-gradient(circle at 30% 30%, #fca5a5, #ef4444, #7f1d1d);
          animation: flash-red 2s infinite alternate;
        }
        @keyframes flash-red {
          0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); filter: brightness(1); }
          100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); filter: brightness(1.3); }
        }

        /* Green */
        .type-1 .bulb {
          background: radial-gradient(circle at 30% 30%, #86efac, #22c55e, #14532d);
          animation: flash-green 2.5s infinite alternate 0.5s;
        }
        @keyframes flash-green {
          0% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3); filter: brightness(1); }
          100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); filter: brightness(1.3); }
        }

        /* Gold */
        .type-2 .bulb {
          background: radial-gradient(circle at 30% 30%, #fde047, #eab308, #713f12);
          animation: flash-gold 2.2s infinite alternate 1s;
        }
        @keyframes flash-gold {
          0% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); filter: brightness(1); }
          100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.8); filter: brightness(1.3); }
        }

        /* Blue */
        .type-3 .bulb {
          background: radial-gradient(circle at 30% 30%, #93c5fd, #3b82f6, #1e3a8a);
          animation: flash-blue 1.8s infinite alternate 0.2s;
        }
        @keyframes flash-blue {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); filter: brightness(1); }
          100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); filter: brightness(1.3); }
        }

        @keyframes swing {
          from { transform: rotate(-3deg); }
          to { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}