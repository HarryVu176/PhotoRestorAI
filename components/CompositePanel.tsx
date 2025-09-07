/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { LayersIcon, SparklesIcon, UploadIcon, XCircleIcon, LoaderIcon } from './icons';

interface CompositePanelProps {
  onApplyComposite: (sourceImage: File, prompt: string) => void;
  isLoading: boolean;
  onGenerateSuggestion: (sourceImage: File) => void;
  suggestions: string[];
  isSuggesting: boolean;
}

const CompositePanel: React.FC<CompositePanelProps> = ({ 
    onApplyComposite, isLoading, onGenerateSuggestion, suggestions, isSuggesting 
}) => {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    if (sourceImage) {
      const url = URL.createObjectURL(sourceImage);
      setSourceImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setSourceImageUrl(null);
    }
  }, [sourceImage]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setSourceImage(files[0]);
      onGenerateSuggestion(files[0]);
    }
  };
  
  const handleRemoveImage = () => {
    setSourceImage(null);
  };

  const handleApply = () => {
    if (sourceImage && prompt) {
      onApplyComposite(sourceImage, prompt);
    }
  };

  const handleClearPrompt = () => {
    setPrompt('');
  };
  
  const dropHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [onGenerateSuggestion]);
  
  const dragOverHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);
  
  const dragLeaveHandler = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 w-full">
        <LayersIcon className="w-6 h-6 text-teal-400" />
        <h3 className="text-xl font-bold text-center text-gray-200">Composite Images</h3>
      </div>
      
      <p className="text-md text-gray-400 text-center max-w-lg">
        Upload a second image and describe how to combine it with your main photo.
      </p>

      {sourceImageUrl ? (
          <div className="relative w-full max-w-sm group">
              <img src={sourceImageUrl} alt="Source Preview" className="w-full h-auto rounded-lg object-contain max-h-48" />
              <button 
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="Remove source image"
              >
                  <XCircleIcon className="w-6 h-6" />
              </button>
          </div>
      ) : (
        <div 
          onDrop={dropHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          className={`w-full max-w-lg p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDraggingOver ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
        >
          <input 
            id="source-image-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <label htmlFor="source-image-upload" className="flex flex-col items-center gap-2 cursor-pointer">
            <UploadIcon className="w-8 h-8 text-gray-400" />
            <span className="font-semibold text-gray-300">Upload Source Image</span>
            <span className="text-sm text-gray-500">or drag and drop</span>
          </label>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="w-full max-w-lg flex flex-col items-center gap-4">
        <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Place this chair in the corner of the room', 'Make the person wear this t-shirt'"
            rows={3}
            className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 pr-10 focus:ring-2 focus:ring-teal-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
            disabled={isLoading || !sourceImage}
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
                  <span>AI is generating suggestions...</span>
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
            className="w-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-500 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-teal-800 disabled:to-cyan-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !prompt.trim() || !sourceImage}
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Apply Composite
        </button>
      </form>
    </div>
  );
};

export default CompositePanel;
