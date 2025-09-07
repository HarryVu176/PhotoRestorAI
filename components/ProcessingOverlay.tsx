/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { LoaderIcon } from './icons';

interface ProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  processingTime?: number;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  message = "Processing your image...",
  progress,
  processingTime = 0
}) => {
  if (!isVisible) return null;

  const formatProcessingTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto">
              <LoaderIcon className="w-16 h-16 text-blue-500 animate-spin" />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-blue-500 rounded-full animate-ping opacity-20"></div>
          </div>

          {/* Processing message */}
          <h3 className="text-xl font-semibold text-white mb-2">
            AI Processing
            {processingTime > 0 && (
              <span className="ml-2 text-lg text-blue-400 font-mono">
                {formatProcessingTime(processingTime)}
              </span>
            )}
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            {message}
          </p>

          {/* Progress bar (if progress is provided) */}
          {typeof progress === 'number' && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          )}

          {/* Processing steps */}
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Analyzing image content</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Applying AI enhancements</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Finalizing results</span>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-xs">
              💡 Tip: Higher quality images may take longer to process
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
