/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { apiManager } from '../services/apiManager';
import { XMarkIcon, CheckIcon, XCircleIcon } from './icons';

interface APIStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APIStatusModal: React.FC<APIStatusModalProps> = ({ isOpen, onClose }) => {
  const [providers, setProviders] = useState<Array<{
    name: string, 
    isActive: boolean, 
    usedToday: number, 
    dailyLimit?: number, 
    totalKeys: number, 
    currentKeyIndex: number
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      const status = apiManager.getProviderStatus();
      setProviders(status);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleResetProvider = (providerName: string) => {
    apiManager.resetProvider(providerName);
    const status = apiManager.getProviderStatus();
    setProviders(status);
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed height with prominent close button */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 flex-shrink-0 bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">API</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">API Provider Status</h2>
          </div>
          
          {/* Primary Close Button - Always visible and prominent */}
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-3 hover:bg-slate-700 rounded-lg bg-slate-800 border border-slate-600 hover:border-slate-500 min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0 ml-4 shadow-lg"
            title="Close API Status Modal"
            aria-label="Close API Status Modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Secondary Close Button Bar - Desktop friendly */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-700/50 bg-slate-800/20 flex justify-between items-center">
          <span className="text-slate-400 text-sm">API Provider Management</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors px-4 py-2 hover:bg-slate-700 rounded-lg bg-slate-800 border border-slate-600 hover:border-slate-500 text-sm font-medium flex items-center gap-2"
            title="Close modal"
          >
            <XMarkIcon className="w-4 h-4" />
            Close
          </button>
        </div>

        {/* Content - Scrollable with better height management */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="p-4 sm:p-6">
            {providers.length === 0 ? (
              <div className="text-center py-8">
                <XCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No API providers configured.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Please add API keys to your .env file
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.name}
                    className={`bg-slate-800/50 rounded-xl p-4 border ${
                      provider.isActive ? 'border-green-500/30' : 'border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          provider.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                          {provider.totalKeys > 1 && (
                            <p className="text-xs text-slate-400">
                              Key {provider.currentKeyIndex + 1}/{provider.totalKeys} • {provider.totalKeys} keys available
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {provider.isActive ? 'Available' : 'Unavailable'}
                        </span>
                        
                        {!provider.isActive && (
                          <button
                            onClick={() => handleResetProvider(provider.name)}
                            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-xs"
                            title="Reset provider"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Used today:</span>
                        <span className="text-white font-medium">
                          {provider.usedToday}
                          {provider.dailyLimit && ` / ${provider.dailyLimit}`}
                        </span>
                      </div>
                      
                      {provider.dailyLimit && (
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              provider.usedToday / provider.dailyLimit > 0.8
                                ? 'bg-red-500'
                                : provider.usedToday / provider.dailyLimit > 0.6
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (provider.usedToday / provider.dailyLimit) * 100)}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">API Fallback & Multiple Keys</h4>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  The system automatically switches between API providers when one runs out of quota or encounters errors.
                </p>
                <p>
                  <strong>Multiple Keys Support:</strong> You can configure multiple API keys for each provider using comma-separated format:
                </p>
                <code className="block bg-slate-800 p-2 rounded text-xs text-green-400 mt-2">
                  VITE_OPENROUTER_API_KEY=key1,key2,key3
                </code>
                <p className="text-xs text-slate-400">
                  The system will rotate between keys automatically when one reaches its quota limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with close button - Always visible */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors border border-slate-600 hover:border-slate-500 flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};