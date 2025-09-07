/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { EyeIcon, DownloadIcon, XCircleIcon, UploadIcon } from './icons';

interface FloatingActionButtonsProps {
  onCompare: () => void;
  onDownload: () => void;
  onNewUpload: () => void;
  canCompare: boolean;
  isVisible: boolean;
  isProcessing?: boolean;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onCompare,
  onDownload,
  onNewUpload,
  canCompare,
  isVisible,
  isProcessing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay showing the buttons for a smooth entrance
      const timer = setTimeout(() => setShowButtons(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowButtons(false);
      setIsExpanded(false);
    }
  }, [isVisible]);

  if (!isVisible || !showButtons) return null;

  const toggleExpanded = () => {
    if (isProcessing) return; // Don't allow expanding while processing
    setIsExpanded(!isExpanded);
  };

  const handleDownload = () => {
    onDownload();
    setShowDownloadSuccess(true);
    setTimeout(() => setShowDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Secondary Action Buttons */}
      <div className={`flex flex-col space-y-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* New Upload Button */}
        <button
          onClick={() => {
            onNewUpload();
          }}
          className="group relative w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center"
          aria-label="Upload new image"
        >
          <UploadIcon className="w-6 h-6" />
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            New Upload
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
          </div>
        </button>

        {/* Compare Button */}
        {canCompare && (
          <button
            onClick={() => {
              onCompare();
            }}
            className="group relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="Compare before and after"
          >
            <EyeIcon className="w-6 h-6" />
            
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Compare
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
            </div>
          </button>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className={`group relative w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Download image"
        >
          <DownloadIcon className="w-6 h-6" />
          
          {/* Success checkmark */}
          {showDownloadSuccess && (
            <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {showDownloadSuccess ? 'Downloaded!' : 'Download'}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
          </div>
        </button>
      </div>

      {/* Main FAB Button - Aligned with mobile toolbar */}
      <button
        onClick={toggleExpanded}
        disabled={isProcessing}
        className={`relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
        style={{ marginBottom: '0px' }}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isExpanded ? (
          <XCircleIcon className="w-7 h-7" />
        ) : (
          <div className="flex flex-col space-y-0.5">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        )}
        
        {/* Pulse effect when collapsed and not processing */}
        {!isExpanded && !isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-30"></div>
        )}
      </button>
    </div>
  );
};

export default FloatingActionButtons;
