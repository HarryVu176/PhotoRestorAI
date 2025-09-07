/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { MagicWandIcon, SparklesIcon, XCircleIcon, LoaderIcon } from './icons';

interface RestorePanelProps {
  onApplyRestore: (prompt: string) => void;
  isRestoring: boolean;
  isDescribing: boolean;
  initialPrompt: string;
}

const RestorePanel: React.FC<RestorePanelProps> = ({ onApplyRestore, isRestoring, isDescribing, initialPrompt }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const isDisabled = isRestoring || isDescribing;

  useEffect(() => {
    setCustomPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleApply = () => {
    onApplyRestore(customPrompt);
  };
  
  const handleClearPrompt = () => {
    setCustomPrompt('');
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 w-full">
        <MagicWandIcon className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-center text-gray-200">Magic Restoration</h3>
      </div>

      <p className="text-md text-gray-400 text-center max-w-lg">
        Automatically enhance colors, clarity, and lighting. Add optional notes to guide the AI for better results.
      </p>

      <div className="relative w-full max-w-lg">
         {isDescribing && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LoaderIcon className="h-5 w-5 text-gray-400 animate-spin" />
            </div>
          )}
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={isDescribing ? "AI is analyzing your image..." : "Optional: e.g., 'This photo is from the 70s, make colors pop'"}
          className={`flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 pr-10 focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base ${isDescribing ? 'pl-10' : ''}`}
          disabled={isDisabled}
        />
        {customPrompt && !isDisabled && (
          <button
            onClick={handleClearPrompt}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear optional notes"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4 pt-2">
          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-purple-800 disabled:to-indigo-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isDisabled}
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Apply Magic Restore
          </button>
      </div>
    </div>
  );
};

export default RestorePanel;
