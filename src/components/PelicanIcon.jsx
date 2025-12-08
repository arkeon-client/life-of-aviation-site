// src/components/PelicanIcon.jsx
import React from 'react';

export default function PelicanIcon({ className = "w-6 h-6", color = "currentColor" }) {
  // A stylized bird/pelican flight icon
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 7c0-3-2-5-5-5S6 4 6 7c0 4 4 8 4 8s-6-1-8 4" />
      <path d="M4 19c0 2 2 3 4 3 5 0 10-6 12-12" />
      <path d="M15 10c2-1 4-1 6 0" />
      <path d="M12 15c3 0 6-2 9-5" />
    </svg>
  );
}