/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface ComparisonViewerProps {
  originalImageUrl: string;
  currentImageUrl: string;
  className?: string;
}

const ComparisonViewer: React.FC<ComparisonViewerProps> = ({ 
  originalImageUrl, 
  currentImageUrl, 
  className = '' 
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-xl">
        {/* Current image (default view) */}
        <img
          src={showOriginal ? originalImageUrl : currentImageUrl}
          alt={showOriginal ? "Original" : "Edited"}
          className="w-full h-auto object-contain max-h-[60vh] block transition-opacity duration-300"
          draggable={false}
        />
        
        {/* Toggle button */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showOriginal 
                ? 'bg-red-500/80 text-white hover:bg-red-500 backdrop-blur-sm' 
                : 'bg-green-500/80 text-white hover:bg-green-500 backdrop-blur-sm'
            }`}
            title={showOriginal ? "Click to show edited version" : "Click to show original"}
          >
            {showOriginal ? (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                <span className="text-sm">Original</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                <span className="text-sm">Enhanced</span>
              </>
            )}
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
          {showOriginal ? 'Viewing: Original' : 'Viewing: Enhanced'}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-3 text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <EyeIcon className="w-4 h-4" />
          <span>Click the eye button to compare before and after</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonViewer;
