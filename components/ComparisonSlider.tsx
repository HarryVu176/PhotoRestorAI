/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  originalImageUrl: string;
  currentImageUrl: string;
  className?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ 
  originalImageUrl, 
  currentImageUrl, 
  className = '' 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault();
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const position = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, position)));
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-xl cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Original image (background) */}
        <img
          src={originalImageUrl}
          alt="Original"
          className="w-full h-auto object-contain max-h-[60vh] block"
          draggable={false}
        />
        
        {/* Current image (overlay with clip-path) */}
        <img
          src={currentImageUrl}
          alt="Edited"
          className="absolute top-0 left-0 w-full h-auto object-contain max-h-[60vh] block"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
          draggable={false}
        />
        
        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-ew-resize pointer-events-auto">
            <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          Edited
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-2 text-sm text-gray-400">
        Drag the slider to compare before and after
      </div>
    </div>
  );
};

export default ComparisonSlider;
