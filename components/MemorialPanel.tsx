/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PortraitIcon, SparklesIcon, XCircleIcon, LoaderIcon } from './icons';

interface MemorialPanelProps {
  onApplyMemorial: (prompt: string) => void;
  isLoading: boolean;
  suggestions: string[];
  isSuggesting: boolean;
  onGenerateSuggestion: () => void;
}

const MemorialPanel: React.FC<MemorialPanelProps> = ({ 
  onApplyMemorial, 
  isLoading, 
  suggestions, 
  isSuggesting, 
  onGenerateSuggestion 
}) => {
  const [prompt, setPrompt] = useState('');
  
  const defaultPrompt = "Automatically create a formal portrait with a neutral background.";

  const handleApply = () => {
    onApplyMemorial(prompt || defaultPrompt);
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 w-full">
        <PortraitIcon className="w-6 h-6 text-sky-400" />
        <h3 className="text-xl font-bold text-center text-gray-200">Memorial Portrait</h3>
      </div>
      
      <p className="text-md text-gray-400 text-center max-w-lg">
        Create formal portraits or memorial photos. The AI can change clothes, replace the background, and restore quality.
      </p>

      {/* Generate Suggestions Button */}
      <button
        onClick={onGenerateSuggestion}
        disabled={isSuggesting || isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSuggesting ? (
          <>
            <LoaderIcon className="w-4 h-4 animate-spin" />
            Generating Ideas...
          </>
        ) : (
          <>
            <SparklesIcon className="w-4 h-4" />
            Get AI Suggestions
          </>
        )}
      </button>

      <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="w-full max-w-lg flex flex-col items-center gap-4">
        <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Change clothes to a black suit', 'Create a portrait with an Áo Dài'"
            rows={3}
            className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 pr-10 focus:ring-2 focus:ring-sky-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
            disabled={isLoading}
          />
           {prompt && !isLoading && (
            <button
              onClick={handleClearPrompt}
              className="absolute top-3 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
              aria-label="Clear prompt"
              type="button"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="w-full">
            {isSuggesting && (
                <div className="w-full flex items-center justify-center gap-2 p-3 bg-gray-900/50 rounded-lg text-sm text-gray-400">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>AI is analyzing your photo for ideas...</span>
                </div>
            )}
            {!isSuggesting && suggestions.length > 0 && (
                <div className="w-full p-3 bg-gray-900/50 rounded-lg animate-fade-in flex flex-col gap-2">
                    <p className="text-sm text-gray-400 mb-1 font-semibold">AI Suggestions:</p>
                    {suggestions.map((suggestion, index) => (
                         <button
                            key={index}
                            type="button"
                            onClick={() => setPrompt(suggestion)}
                            className="w-full text-left p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm"
                        >
                           &rarr; "{suggestion}"
                        </button>
                    ))}
                </div>
            )}
        </div>

        <button
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-cyan-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-sky-800 disabled:to-cyan-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Create Portrait
        </button>
      </form>
    </div>
  );
};

export default MemorialPanel;
