/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserProfileModal from './UserProfileModal';
import { CogIcon } from './icons';
import { UserQuota, isAdminUser } from '../services/quotaService';

interface UserProfileProps {
  userQuota?: UserQuota | null;
  onOpenQuotaManager?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userQuota, onOpenQuotaManager }) => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleViewStats = () => {
    setShowStatsModal(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
      >
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName || 'User Avatar'}
          className="w-8 h-8 rounded-full border-2 border-purple-400/50 group-hover:border-purple-400 transition-colors"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=7c3aed&color=ffffff&size=128`;
          }}
        />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors">
            {user.displayName || 'User'}
          </div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {user.email}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in">
          {/* User Info */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User Avatar'}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=7c3aed&color=ffffff&size=128`;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.displayName || 'User'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user.email}
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  Pro Member
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">
              Account
            </div>
            
            {/* Quota Display */}
            {userQuota && (
              <div className="px-3 py-2 mb-2 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">AI Quota</span>
                  <span className={`text-sm font-semibold ${
                    userQuota.remainingQuota > userQuota.totalQuota * 0.5 
                      ? 'text-green-400' 
                      : userQuota.remainingQuota > userQuota.totalQuota * 0.2 
                      ? 'text-yellow-400' 
                      : 'text-red-400'
                  }`}>
                    {userQuota.remainingQuota}/{userQuota.totalQuota}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      userQuota.remainingQuota > userQuota.totalQuota * 0.5
                        ? 'bg-green-500'
                        : userQuota.remainingQuota > userQuota.totalQuota * 0.2
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.max(0, (userQuota.remainingQuota / userQuota.totalQuota) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleViewStats}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Statistics</span>
            </button>

            {/* Admin Management Button */}
            {isAdminUser(user?.email || '') && onOpenQuotaManager && (
              <button
                onClick={() => {
                  onOpenQuotaManager();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                <span>User Management</span>
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-700 text-center">
            <div className="text-xs text-gray-500">
              PhotoRestorAI v2.1
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      <UserProfileModal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
      />
    </div>
  );
};

export default UserProfile;
