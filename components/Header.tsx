/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
// Removed authentication imports for hackathon version

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.874-.219-.874a1.5 1.5 0 00-1.023-1.023l-.874-.219.874-.219a1.5 1.5 0 001.023-1.023l.219-.874.219.874a1.5 1.5 0 001.023 1.023l.874.219-.874.219a1.5 1.5 0 00-1.023 1.023z" />
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Removed authentication for hackathon version

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full bg-gray-900/80 border-b border-gray-700/50 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
                    {/* Logo & Brand */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            aria-label="Go to home"
          >
            <img
              src="/logo.png"
              alt="PhotoRestorAI Logo"
              className="w-8 h-8 sm:w-10 sm:h-10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <h1 className="heading-quaternary text-white group-hover:text-blue-300 transition-colors">
                PhotoRestorAI
              </h1>
              <div className="hidden sm:flex items-center gap-1 text-xs text-blue-400">
                <SparkleIcon className="w-3 h-3" />
                <span className="font-medium">AI Enhanced</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors font-medium">
              About
            </a>
            <a
              href="mailto:vudanmax@gmail.com"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Contact
            </a>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                AI
              </span>
              <span>by{' '}
                <a
                  href="https://github.com/danvufs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                >
                  DHA
                </a>
              </span>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 py-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-gray-300 hover:text-white transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#about" 
                className="text-gray-300 hover:text-white transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="mailto:vudanmax@gmail.com"
                className="text-gray-300 hover:text-white transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2 border-t border-gray-700/50">
                <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  AI
                </span>
                <span>Developed by{' '}
                  <a
                    href="https://github.com/danvufs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                  >
                    DHA
                  </a>
                </span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;