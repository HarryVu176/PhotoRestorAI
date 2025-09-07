/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UndoIcon, RedoIcon, ResetIcon } from './icons';

interface MobileToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isVisible: boolean;
  isProcessing?: boolean;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  isVisible,
  isProcessing = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-24 md:hidden z-40">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 shadow-2xl h-16 flex items-center">
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            className="group relative flex items-center justify-center w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 disabled:bg-gray-800/40 disabled:cursor-not-allowed text-gray-200 disabled:text-gray-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Undo last action"
          >
            <UndoIcon className="w-5 h-5" />
            
            {/* Mobile-friendly tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Undo
            </div>
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo || isProcessing}
            className="group relative flex items-center justify-center w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 disabled:bg-gray-800/40 disabled:cursor-not-allowed text-gray-200 disabled:text-gray-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Redo last action"
          >
            <RedoIcon className="w-5 h-5" />
            
            {/* Mobile-friendly tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Redo
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600"></div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={!canUndo || isProcessing}
            className="group relative flex items-center justify-center w-12 h-12 bg-gray-800/80 hover:bg-red-700/80 disabled:bg-gray-800/40 disabled:cursor-not-allowed text-gray-200 disabled:text-gray-500 hover:text-red-200 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Reset to original"
          >
            <ResetIcon className="w-5 h-5" />
            
            {/* Mobile-friendly tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Reset
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileToolbar;
