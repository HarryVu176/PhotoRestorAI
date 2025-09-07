/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PhotoIcon, PlayIcon } from './icons';

interface RestorationStylesPanelProps {
  onApplyStyle: (prompt: string) => void;
  isLoading: boolean;
  processingTime?: number;
  formatProcessingTime?: (seconds: number) => string;
}

const RestorationStylesPanel: React.FC<RestorationStylesPanelProps> = ({ 
  onApplyStyle, 
  isLoading, 
  processingTime = 0, 
  formatProcessingTime 
}) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const restorationStyles = [
    { 
      name: 'Black & White', 
      prompt: 'Convert to professional black and white with rich contrast, proper tonal separation, and classic darkroom quality. Maintain all detail while enhancing the dramatic monochrome aesthetic.',
      icon: '⚫',
      color: 'from-gray-600/20 to-slate-500/20 hover:from-gray-600/30 hover:to-slate-500/30 border-gray-500/30 text-gray-300'
    },
    { 
      name: 'Sepia Tone', 
      prompt: 'Apply authentic sepia toning with warm brown hues reminiscent of vintage photographs from the early 1900s. Create that classic aged appearance with proper chemical toning effects.',
      icon: '🟤',
      color: 'from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 border-amber-500/30 text-amber-300'
    },
    { 
      name: 'Cyanotype', 
      prompt: 'Transform into a cyanotype with distinctive Prussian blue tones and white highlights, recreating the classic blueprint photography process from the 19th century.',
      icon: '🔵',
      color: 'from-blue-600/20 to-cyan-500/20 hover:from-blue-600/30 hover:to-cyan-500/30 border-blue-500/30 text-blue-300'
    },
    { 
      name: 'Vintage Warm', 
      prompt: 'Apply warm vintage color grading with golden highlights, amber midtones, and slightly faded shadows. Create the look of aged color photographs from the 1960s-70s.',
      icon: '🌅',
      color: 'from-orange-600/20 to-red-500/20 hover:from-orange-600/30 hover:to-red-500/30 border-orange-500/30 text-orange-300'
    },
    { 
      name: 'Restoration Tones', 
      prompt: 'Enhance with natural restoration color grading - balanced skin tones, authentic period-appropriate colors, and subtle warmth that brings old photos back to life naturally.',
      icon: '🎨',
      color: 'from-emerald-600/20 to-teal-500/20 hover:from-emerald-600/30 hover:to-teal-500/30 border-emerald-500/30 text-emerald-300'
    },
    { 
      name: 'Antique Paper', 
      prompt: 'Add the appearance of being printed on aged paper with subtle cream tones, gentle texture, and the warm patina of old photographs stored in family albums.',
      icon: '📜',
      color: 'from-yellow-600/20 to-amber-500/20 hover:from-yellow-600/30 hover:to-amber-500/30 border-yellow-500/30 text-yellow-300'
    },
    { 
      name: 'Film Grain', 
      prompt: 'Enhance with authentic film grain texture and the characteristic look of analog photography, adding organic texture and vintage photographic authenticity.',
      icon: '🎞️',
      color: 'from-purple-600/20 to-indigo-500/20 hover:from-purple-600/30 hover:to-indigo-500/30 border-purple-500/30 text-purple-300'
    },
    { 
      name: 'Hand-Tinted', 
      prompt: 'Apply the delicate hand-tinted colorization style popular in early portrait photography, with soft, painterly colors applied selectively to key features like cheeks, lips, and clothing.',
      icon: '🖌️',
      color: 'from-pink-600/20 to-rose-500/20 hover:from-pink-600/30 hover:to-rose-500/30 border-pink-500/30 text-pink-300'
    },
  ];
  
  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyStyle(activePrompt);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PhotoIcon className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-300">Restoration Styles</h3>
        </div>
        <p className="text-sm text-gray-400">Apply authentic period-appropriate styles to enhance your restored photo</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {restorationStyles.map(style => (
          <button
            key={style.name}
            onClick={() => handlePresetClick(style.prompt)}
            disabled={isLoading}
            className={`w-full flex flex-col items-center gap-2 p-3 bg-gradient-to-br ${style.color} border rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === style.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-amber-500 scale-105' : ''}`}
          >
            <span className="text-lg">{style.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">{style.name}</span>
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe a custom restoration style (e.g., 'Victorian-era portrait tones')"
        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-amber-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
        disabled={isLoading}
      />
      
      {activePrompt && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
          <button
            onClick={handleApply}
            className="w-full bg-gradient-to-br from-amber-600 to-amber-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-amber-800 disabled:to-amber-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            disabled={isLoading || !activePrompt.trim()}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Applying Style... {processingTime > 0 && formatProcessingTime && `(${formatProcessingTime(processingTime)})`}</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Apply Style
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RestorationStylesPanel;
