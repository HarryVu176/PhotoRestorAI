/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { EyeIcon, DownloadIcon, CheckIcon } from './icons';

interface ResultsPanelProps {
  isVisible: boolean;
  onCompare: () => void;
  onDownload: () => void;
  canCompare: boolean;
  processingTime?: number;
  formatProcessingTime?: (seconds: number) => string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  isVisible,
  onCompare,
  onDownload,
  canCompare,
  processingTime = 0,
  formatProcessingTime = (s) => `${s}s`
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-4 shadow-2xl animate-fade-in">
        <div className="flex items-center space-x-6">
          {/* Success Icon & Message */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Processing Complete!</p>
              <p className="text-gray-400 text-xs">
                Completed in {formatProcessingTime(processingTime)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {canCompare && (
              <button
                onClick={onCompare}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Compare</span>
              </button>
            )}
            
            <button
              onClick={onDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
