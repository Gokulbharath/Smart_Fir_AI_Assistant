/**
 * BackButton Component
 * 
 * Reusable back button component for navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  label?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  className = '', 
  label = 'Back',
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center space-x-2 px-4 py-2 
        bg-white dark:bg-slate-800 
        border border-slate-200 dark:border-slate-700 
        rounded-lg 
        text-slate-700 dark:text-slate-300 
        hover:bg-slate-50 dark:hover:bg-slate-700 
        hover:shadow-md 
        transition-all duration-200 
        font-medium
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;

