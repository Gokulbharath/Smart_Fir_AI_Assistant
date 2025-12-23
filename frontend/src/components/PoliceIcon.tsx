import React from 'react';

interface PoliceIconProps {
  className?: string;
}

const PoliceIcon: React.FC<PoliceIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
    >
      {/* Police Badge Shape */}
      <path
        d="M50 5 L65 15 L80 10 L85 25 L95 35 L85 50 L95 65 L85 75 L80 90 L65 85 L50 95 L35 85 L20 90 L15 75 L5 65 L15 50 L5 35 L15 25 L20 10 L35 15 Z"
        fill="currentColor"
      />
      {/* Inner Circle */}
      <circle cx="50" cy="50" r="25" fill="white" />
      {/* Star in Center */}
      <path
        d="M50 35 L52.5 42.5 L60 42.5 L54.5 47 L57 55 L50 50.5 L43 55 L45.5 47 L40 42.5 L47.5 42.5 Z"
        fill="currentColor"
      />
      {/* Text "POLICE" */}
      <text x="50" y="70" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">
        POLICE
      </text>
    </svg>
  );
};

export default PoliceIcon;