/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon, PencilIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-100 text-center leading-tight">
          AI-Powered Photo Restoration, <span className="text-purple-400">Perfected</span>.
        </h1>
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-gray-400 text-center px-4">
          Restore vintage photos, enhance image quality, and bring your precious memories back to life using cutting-edge artificial intelligence.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
            <label htmlFor="image-upload-start" className="relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full cursor-pointer group hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1">
                <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
                Upload Your Photo
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <p className="text-xs sm:text-sm text-gray-500">or drag and drop a file anywhere</p>
        </div>

                <div className="mt-12 sm:mt-16 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="bg-black/20 p-4 sm:p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center relative overflow-hidden hover:border-purple-400/50 transition-all duration-300 hover:bg-black/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                    <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full mb-3 sm:mb-4">
                       <MagicWandIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="relative text-lg sm:text-xl font-bold text-white mb-2">✨ Magic Restoration</h3>
                    <p className="relative text-sm sm:text-base text-gray-300">One-click professional photo restoration. Automatically enhance quality, fix lighting, and remove imperfections.</p>
                </div>
                <div className="bg-black/20 p-4 sm:p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center hover:border-blue-400/50 transition-all duration-300 hover:bg-black/30">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full mb-3 sm:mb-4">
                       <PencilIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Precision Editing</h3>
                    <p className="text-sm sm:text-base text-gray-400">Click any point on your image to remove blemishes, change colors, or add elements with pinpoint accuracy.</p>
                </div>
                <div className="bg-black/20 p-4 sm:p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center hover:border-blue-400/50 transition-all duration-300 hover:bg-black/30">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full mb-3 sm:mb-4">
                       <PaletteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Creative Filters</h3>
                    <p className="text-sm sm:text-base text-gray-400">Transform photos with artistic styles. From vintage looks to futuristic glows, find or create the perfect filter.</p>
                </div>
                <div className="bg-black/20 p-4 sm:p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center hover:border-blue-400/50 transition-all duration-300 hover:bg-black/30">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full mb-3 sm:mb-4">
                       <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Pro Adjustments</h3>
                    <p className="text-sm sm:text-base text-gray-400">Enhance lighting, blur backgrounds, or change the mood. Get studio-quality results without complex tools.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;
