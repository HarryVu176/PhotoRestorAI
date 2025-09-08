/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-700/50 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="PhotoRestorAI Logo" 
                className="w-8 h-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h3 className="text-xl font-bold text-white">PhotoRestorAI</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              Comprehensive AI-powered photo restoration suite. Transform vintage photos, enhance memories, and create artistic masterpieces with professional-grade artificial intelligence technology.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:vudanmax@gmail.com"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <span className="text-sm">Contact DHA</span>
              </a>
            </div>
          </div>

          {/* AI Restoration Modes */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-base">AI Restoration</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✨</span>
                Magic Restoration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">🖼️</span>
                Memorial Care
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">🎨</span>
                Creative Edit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-400">🔧</span>
                Smart Composite
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">✏️</span>
                Precision Retouch
              </li>
            </ul>
          </div>

          {/* Professional Tools */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-base">Pro Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">🎭</span>
                Vintage Styles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✂️</span>
                Smart Cropping
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">⚙️</span>
                AI Adjustments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">🔍</span>
                Compare Slider
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">📱</span>
                Mobile Optimized
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center sm:text-left">
            <p className="font-medium">© 2025 PhotoRestorAI. Developed by{' '}
              <a 
                href="https://github.com/harryvu176"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors hover:underline"
              >
                DHA
              </a>
            </p>
            <p className="mt-1 text-gray-500">Powered by Google Gemini AI • Made with ❤️ for photographers</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full border border-blue-500/30 font-medium">
              🚀 v2.1
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full border border-emerald-500/30 font-medium">
              🤖 AI Enhanced
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
