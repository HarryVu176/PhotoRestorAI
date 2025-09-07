/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { MagicWandIcon, SparklesIcon, XCircleIcon, LoaderIcon } from './icons';

interface MagicPanelProps {
  onApplyMagic: (customOptions?: {
    enhanceDetails?: boolean;
    fixLighting?: boolean;
    removeNoise?: boolean;
    colorCorrection?: boolean;
    removeArtifacts?: boolean;
    customPrompt?: string;
    subjectDescription?: string;
  }) => void;
  isLoading: boolean;
  processingTime: number;
  formatProcessingTime: (seconds: number) => string;
}

const MagicPanel: React.FC<MagicPanelProps> = ({ 
  onApplyMagic, 
  isLoading, 
  processingTime, 
  formatProcessingTime 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [options, setOptions] = useState({
    enhanceDetails: true,
    fixLighting: true,
    removeNoise: true,
    colorCorrection: true,
    removeArtifacts: true,
  });

  const handleQuickMagic = () => {
    onApplyMagic(); // Use default settings
  };

  const handleAdvancedMagic = () => {
    onApplyMagic({
      ...options,
      customPrompt: customPrompt.trim() || undefined,
      subjectDescription: subjectDescription.trim() || undefined
    });
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const allOptionsDisabled = !Object.values(options).some(Boolean);

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col gap-6 animate-fade-in backdrop-blur-sm">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <MagicWandIcon className="w-8 h-8 text-yellow-400" />
          Magic Restoration
        </h3>
        <p className="text-gray-400">
          Automatically enhance your photo with professional AI restoration
        </p>
      </div>

      {/* Quick Magic Button */}
      <div className="text-center">
        <button
          onClick={handleQuickMagic}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-500 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-px active:scale-95 disabled:from-purple-800 disabled:to-indigo-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none group w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Processing... ({formatProcessingTime(processingTime)})
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              Apply Magic ✨
            </>
          )}
        </button>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          One-click professional restoration with optimal settings
        </p>
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t border-gray-600 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-center text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 animate-fade-in">
          <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-2">
            Customize Restoration
          </h4>
          
          {/* Restoration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'enhanceDetails', label: 'Enhance Details', description: 'Sharpen and improve fine details' },
              { key: 'fixLighting', label: 'Fix Lighting', description: 'Correct exposure and contrast' },
              { key: 'removeNoise', label: 'Remove Noise', description: 'Eliminate grain and digital noise' },
              { key: 'colorCorrection', label: 'Color Correction', description: 'Fix colors and white balance' },
              { key: 'removeArtifacts', label: 'Remove Artifacts', description: 'Clean compression artifacts' },
            ].map((option) => (
              <label
                key={option.key}
                className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={options[option.key as keyof typeof options]}
                  onChange={() => handleOptionChange(option.key as keyof typeof options)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <div className="text-white font-medium text-sm sm:text-base">{option.label}</div>
                  <div className="text-gray-400 text-xs sm:text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Subject Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              🎯 Describe the Subject Details (Recommended)
            </label>
            <div className="relative">
              <textarea
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="Describe details to help AI restore better:&#10;- Hair color: blonde, brown, black, gray...&#10;- Clothing color: blue shirt, red dress...&#10;- Skin tone: fair, medium, dark...&#10;- Eye color: brown, blue, green...&#10;- Age group: child, young adult, elderly...&#10;- Gender: male, female&#10;&#10;Example: 'Middle-aged woman with brown hair, wearing a blue dress, fair skin, brown eyes'"
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none text-sm"
                rows={6}
                disabled={isLoading}
              />
              {subjectDescription && !isLoading && (
                <button
                  onClick={() => setSubjectDescription('')}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear subject description"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              💡 Tip: More specific details = better restoration results!
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Additional Custom Instructions (Optional)
            </label>
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'focus on restoring the subject's face' or 'preserve the vintage look'"
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                rows={3}
                disabled={isLoading}
              />
              {customPrompt && !isLoading && (
                <button
                  onClick={() => setCustomPrompt('')}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear custom prompt"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Advanced Apply Button */}
          <button
            onClick={handleAdvancedMagic}
            disabled={isLoading || allOptionsDisabled}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-600 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="animate-spin h-5 w-5 mr-3" />
                Processing... ({formatProcessingTime(processingTime)})
              </>
            ) : allOptionsDisabled ? (
              'Select at least one restoration option'
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Apply Custom Magic Restoration
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MagicPanel;
