/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { RetouchIcon, SparklesIcon, XCircleIcon, LoaderIcon } from './icons';

interface RetouchPanelProps {
  onApplyRetouch: (prompt: string) => void;
  isLoading: boolean;
  suggestions: string[];
  isSuggesting: boolean;
  onGenerateSuggestion: () => void;
}

const RetouchPanel: React.FC<RetouchPanelProps> = ({ 
  onApplyRetouch, 
  isLoading, 
  suggestions, 
  isSuggesting, 
  onGenerateSuggestion 
}) => {
  const [prompt, setPrompt] = useState('');

  const handleApply = () => {
    if (prompt) {
      onApplyRetouch(prompt);
    }
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 w-full">
        <RetouchIcon className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-bold text-center text-gray-200">Smart Retouch</h3>
      </div>
      
      <p className="text-md text-gray-400 text-center max-w-lg">
        Remove unwanted objects, fix imperfections, or enhance specific areas. Describe what you want to change.
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

      {/* Quick Preset Actions */}
      <div className="w-full max-w-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setPrompt('Blur the background to create depth of field effect')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🌫️</span>
            <span className="text-xs font-medium text-center">Blur Background</span>
          </button>

          <button
            onClick={() => setPrompt('Add warm lighting and golden hour effect to enhance the mood')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-orange-600/20 to-yellow-500/20 hover:from-orange-600/30 hover:to-yellow-500/30 border border-orange-500/30 text-orange-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🌅</span>
            <span className="text-xs font-medium text-center">Warmer Lighting</span>
          </button>

          <button
            onClick={() => setPrompt('Add professional studio lighting with soft shadows and highlights')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-purple-600/20 to-pink-500/20 hover:from-purple-600/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">💡</span>
            <span className="text-xs font-medium text-center">Studio Light</span>
          </button>

          <button
            onClick={() => setPrompt('Replace background with clean white backdrop')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-gray-600/20 to-slate-500/20 hover:from-gray-600/30 hover:to-slate-500/30 border border-gray-500/30 text-gray-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🎭</span>
            <span className="text-xs font-medium text-center">Change Background</span>
          </button>

          <button
            onClick={() => setPrompt('Remove skin blemishes, wrinkles, and imperfections for natural beauty enhancement')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-rose-600/20 to-pink-500/20 hover:from-rose-600/30 hover:to-pink-500/30 border border-rose-500/30 text-rose-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">✨</span>
            <span className="text-xs font-medium text-center">Skin Retouch</span>
          </button>

          <button
            onClick={() => setPrompt('Remove unwanted objects and people from the photo cleanly')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-red-600/20 to-red-500/20 hover:from-red-600/30 hover:to-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🗑️</span>
            <span className="text-xs font-medium text-center">Remove Objects</span>
          </button>

          <button
            onClick={() => setPrompt('Enhance eyes to make them brighter and more vivid')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-cyan-600/20 to-blue-500/20 hover:from-cyan-600/30 hover:to-blue-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">👁️</span>
            <span className="text-xs font-medium text-center">Enhance Eyes</span>
          </button>

          <button
            onClick={() => setPrompt('Whiten teeth and enhance smile naturally')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-white/20 to-gray-300/20 hover:from-white/30 hover:to-gray-300/30 border border-gray-400/30 text-gray-200 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">😊</span>
            <span className="text-xs font-medium text-center">Whiten Teeth</span>
          </button>

          <button
            onClick={() => setPrompt('Add dramatic cinematic lighting and mood enhancement')}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-indigo-600/20 to-purple-500/20 hover:from-indigo-600/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🎬</span>
            <span className="text-xs font-medium text-center">Cinematic Effect</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="w-full max-w-lg flex flex-col items-center gap-4">
        <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'remove the person in the background', 'fix the red-eye effect', 'remove scratches and dust spots'"
            rows={3}
            className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 pr-10 focus:ring-2 focus:ring-pink-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
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
                    <span>AI is analyzing your photo for suggestions...</span>
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
            className="w-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-rose-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-pink-800 disabled:to-rose-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !prompt.trim()}
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Apply Retouch
        </button>
      </form>
    </div>
  );
};

export default RetouchPanel;
