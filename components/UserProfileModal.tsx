/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats, getAllUserStats, getGlobalStats, isAdmin, initializeSampleData, createUserStatsForExistingUsers, resetAllStats, UserStats, GlobalStats } from '../services/statsService';
import { XMarkIcon, ChartBarIcon, UserIcon, PhotoIcon, MagicWandIcon, AdjustIcon, FilterIcon, CropIcon, RetouchIcon, CommandIcon } from './icons';
import AdvancedStatsModal from './AdvancedStatsModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allUserStats, setAllUserStats] = useState<UserStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if AdvancedStatsModal is open
      if (showAdvancedStats) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close AdvancedStats first if it's open, then close main modal
        if (showAdvancedStats) {
          setShowAdvancedStats(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose, showAdvancedStats]);

  useEffect(() => {
    if (isOpen && user) {
      loadStats();
    }
  }, [isOpen, user]);

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // console.log('🔍 Loading stats for user:', user.email);
      // console.log('🔍 Is admin?', isAdmin(user.email || ''));
      
      // Load user's personal stats
      const personalStats = await getUserStats(user.uid);
      // console.log('📊 Personal stats:', personalStats);
      setUserStats(personalStats);

      // Load global stats
      const global = await getGlobalStats();
      // console.log('🌍 Global stats:', global);
      setGlobalStats(global);

      // Load all user stats if admin
      if (isAdmin(user.email || '')) {
        // console.log('👑 Loading admin stats...');
        const allStats = await getAllUserStats(user.email || '');
        // console.log('👥 All user stats:', allStats);
        
        // Deduplicate by email to prevent React key conflicts
        const uniqueStats = allStats.filter((stats, index, self) => 
          index === self.findIndex(s => s.email === stats.email)
        );
        // console.log('✨ Deduplicated stats:', uniqueStats);
        
        setAllUserStats(uniqueStats);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSampleData = async () => {
    if (!user || !isAdmin(user.email || '')) return;
    
    try {
      // console.log('🔧 Initializing sample data...');
      await initializeSampleData(user.email || '');
      // console.log('✅ Sample data initialized');
      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
    }
  };

  const handleCreateUserStats = async () => {
    if (!user || !isAdmin(user.email || '')) return;
    
    try {
      // console.log('🔧 Creating user stats for existing users...');
      await createUserStatsForExistingUsers(user.email || '');
      // console.log('✅ User stats created');
      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('❌ Error creating user stats:', error);
    }
  };

  const handleResetStats = async () => {
    if (!user || !isAdmin(user.email || '')) return;
    
    // Confirm before reset
    if (!confirm('🚨 Are you sure you want to reset ALL statistics to zero? This action cannot be undone!')) {
      return;
    }
    
    try {
      // console.log('🔄 Resetting all statistics...');
      await resetAllStats(user.email || '');
      // console.log('✅ All statistics reset to zero');
      // Reload stats
      await loadStats();
      alert('🎉 All statistics have been successfully reset to zero!');
    } catch (error) {
      console.error('❌ Error resetting statistics:', error);
      alert('❌ Error resetting statistics. Please try again.');
    }
  };

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const renderPersonalStats = () => {
    if (!userStats) return null;

    return (
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
          <img
            src={user?.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-blue-500"
          />
          <div>
            <h3 className="text-xl font-bold text-white">{userStats.displayName}</h3>
            <p className="text-gray-400">{userStats.email}</p>
            <p className="text-sm text-gray-500">Joined {formatDate(userStats.joinedDate)}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <PhotoIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.totalImages}</div>
            <div className="text-sm text-gray-400">Total Images</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <MagicWandIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.magicRestorations}</div>
            <div className="text-sm text-gray-400">Magic Restore</div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <RetouchIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.retouchEdits}</div>
            <div className="text-sm text-gray-400">Retouch</div>
          </div>
          <div className="bg-gradient-to-br from-rose-600/20 to-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-center">
            <UserIcon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.memorialPortraits}</div>
            <div className="text-sm text-gray-400">Memorial</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 text-center">
            <CommandIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.freeEdits}</div>
            <div className="text-sm text-gray-400">Free Edit</div>
          </div>
          <div className="bg-gradient-to-br from-teal-600/20 to-teal-500/10 border border-teal-500/30 rounded-lg p-4 text-center">
            <PhotoIcon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.compositeImages}</div>
            <div className="text-sm text-gray-400">Composite</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
            <FilterIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.filterApplications}</div>
            <div className="text-sm text-gray-400">Filters</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <AdjustIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.adjustments}</div>
            <div className="text-sm text-gray-400">Adjustments</div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
            <CropIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.crops}</div>
            <div className="text-sm text-gray-400">Crops</div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-600/50 p-4">
          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Activity
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Last Activity:</span>
              <span className="text-white">{formatDate(userStats.lastActivity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Free Edits:</span>
              <span className="text-white">{userStats.freeEdits}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGlobalStats = () => {
    const showAllUsers = isAdmin(user?.email || '');
    
    // console.log('🔍 renderGlobalStats debug:');
    // console.log('  - user email:', user?.email);
    // console.log('  - showAllUsers:', showAllUsers);
    // console.log('  - globalStats:', globalStats);
    // console.log('  - allUserStats length:', allUserStats.length);
    
    return (
      <div className="space-y-6">
        {/* Global Overview */}
        {globalStats && (
          <div className="space-y-4">
            {/* Advanced Analytics Button */}
            {showAllUsers && (
              <div className="text-center">
                <button
                  onClick={() => setShowAdvancedStats(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-px"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  📊 Advanced Analytics
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 text-center">
                <PhotoIcon className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{globalStats.totalImages.toLocaleString()}</div>
                <div className="text-gray-400">Total Images Generated</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center">
                <UserIcon className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{globalStats.totalUsers.toLocaleString()}</div>
                <div className="text-gray-400">Active Users</div>
              </div>
            </div>
          </div>
        )}

        {/* All Users Stats (Admin Only) */}
        {showAllUsers && allUserStats.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-600/50 p-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              All Users Stats (Admin View)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allUserStats.map((stats, index) => (
                <div key={`user-${index}-${stats.email}`} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{stats.displayName}</div>
                      <div className="text-gray-400 text-sm">{stats.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{stats.totalImages}</div>
                    <div className="text-gray-400 text-sm">images</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showAllUsers && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-600/50 p-6 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Global statistics are available for all users.</p>
            <p className="text-gray-500 text-sm mt-1">Detailed user statistics are only visible to administrators.</p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-600 rounded-xl w-full max-w-2xl my-8 overflow-hidden relative shadow-2xl animate-modal-fade-in"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Header with Close Button */}
        <div className="p-4 sm:p-6 border-b border-slate-600 flex items-center justify-between bg-slate-900 relative z-10 sticky top-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white pr-4">Profile & Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-slate-700 rounded-lg flex-shrink-0 -mr-3 relative z-20 shadow-lg border border-slate-600"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-3 sm:p-4 border-b border-slate-600 bg-slate-900 sticky top-[73px] sm:top-[89px] z-10">
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`${isAdmin(user?.email || '') ? 'flex-1' : 'w-full'} py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Personal Stats
            </button>
            {isAdmin(user?.email || '') && (
              <button
                onClick={() => setActiveTab('global')}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'global'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Global Stats
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-900" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Loading statistics...</span>
            </div>
          ) : (
            <>
              {activeTab === 'personal' && renderPersonalStats()}
              {activeTab === 'global' && isAdmin(user?.email || '') && renderGlobalStats()}
            </>
          )}
        </div>
      </div>

      {/* Advanced Stats Modal */}
      {showAdvancedStats && (
        <AdvancedStatsModal
          isOpen={showAdvancedStats}
          onClose={() => setShowAdvancedStats(false)}
          user={user}
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UserProfileModal;
