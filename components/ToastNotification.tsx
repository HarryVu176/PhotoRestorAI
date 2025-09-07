/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { CheckIcon, DownloadIcon } from './icons';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  isVisible: boolean;
  duration?: number;
  onClose?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'success',
  isVisible,
  duration = 3000,
  onClose
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(() => onClose?.(), 300); // Wait for exit animation
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-400';
      case 'info':
        return 'bg-blue-500 border-blue-400';
      case 'warning':
        return 'bg-yellow-500 border-yellow-400';
      case 'error':
        return 'bg-red-500 border-red-400';
      default:
        return 'bg-green-500 border-green-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5" />;
      case 'info':
        return <DownloadIcon className="w-5 h-5" />;
      default:
        return <CheckIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg border-2 text-white font-medium
          transition-all duration-300 ease-in-out transform
          ${show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
          ${getTypeStyles()}
        `}
      >
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-semibold">{message}</p>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && show && (
          <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-white animate-pulse"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      {/* Custom keyframe animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
