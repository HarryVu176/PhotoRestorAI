/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'lg', message }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          className={`animate-spin ${sizeClasses[size]} text-purple-600 mx-auto`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        
        {/* Sparkle effect */}
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      {message && (
        <p className="text-gray-300 text-center animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default Spinner;