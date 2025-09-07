/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PencilIcon, SparklesIcon, XCircleIcon, LoaderIcon } from './icons';

interface FreeEditPanelProps {
  onApplyFreeEdit: (prompt: string) => void;
  isLoading: boolean;
  suggestions: string[];
  isSuggesting: boolean;
  onGenerateSuggestion: () => void;
}

const FreeEditPanel: React.FC<FreeEditPanelProps> = ({ 
  onApplyFreeEdit, 
  isLoading, 
  suggestions, 
  isSuggesting, 
  onGenerateSuggestion 
}) => {
  const [prompt, setPrompt] = useState('');

  const handleApply = () => {
    if (prompt) {
      onApplyFreeEdit(prompt);
    }
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 w-full">
        <PencilIcon className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-center text-gray-200">Free Edit</h3>
      </div>
      
      <p className="text-md text-gray-400 text-center max-w-lg">
        Describe any change you want to make to the entire image. Be creative!
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
            placeholder="e.g., 'make the sky look like a sunset', 'change the background to a beach', 'add a small dog to the scene'"
            rows={3}
            className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 pr-10 focus:ring-2 focus:ring-orange-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
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
            className="w-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-amber-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-orange-800 disabled:to-amber-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !prompt.trim()}
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Apply Edit
        </button>
      </form>
    </div>
  );
};

export default FreeEditPanel;
