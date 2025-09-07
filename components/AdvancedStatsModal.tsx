/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTopUsers, getDailyStats, getTimeRangeStats, isAdmin, TopUser, DailyStats, TimeRangeStats } from '../services/statsService';
import { XMarkIcon, ChartBarIcon, TrophyIcon, CalendarIcon } from './icons';

interface AdvancedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any; // Optional user prop, will use useAuth if not provided
}

const AdvancedStatsModal: React.FC<AdvancedStatsModalProps> = ({ isOpen, onClose, user: propUser }) => {
  const { user: authUser } = useAuth();
  const user = propUser || authUser; // Use prop user if provided, otherwise use auth user
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'charts' | 'ranking' | 'timeline'>('charts');
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [timeRangeStats, setTimeRangeStats] = useState<TimeRangeStats>({ daily: [], weekly: [], monthly: [] });
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && user && isAdmin(user.email || '')) {
      loadAdvancedStats();
    }
  }, [isOpen, user]);

  const loadAdvancedStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📊 Loading advanced stats...');
      
      // Load all advanced stats in parallel
      const [topUsersData, dailyStatsData, timeRangeData] = await Promise.all([
        getTopUsers(user.email || '', 10),
        getDailyStats(user.email || '', 30),
        getTimeRangeStats(user.email || '')
      ]);
      
      setTopUsers(topUsersData);
      setDailyStats(dailyStatsData);
      setTimeRangeStats(timeRangeData);
      
    } catch (error) {
      console.error('❌ Error loading advanced stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user || !isAdmin(user.email || '')) return null;

  const renderChart = () => {
    const data = chartPeriod === 'daily' ? timeRangeStats.daily : 
                 chartPeriod === 'weekly' ? timeRangeStats.weekly : 
                 timeRangeStats.monthly;

    if (!data || data.length === 0) return <div className="text-gray-400">No data available</div>;

    const maxValue = Math.max(...data.map(d => 'totalImages' in d ? d.totalImages : 0));

    return (
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { key: 'daily', label: 'Daily (30d)' },
            { key: 'weekly', label: 'Weekly (8w)' },
            { key: 'monthly', label: 'Monthly (6m)' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChartPeriod(key as any)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                chartPeriod === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            {chartPeriod === 'daily' ? 'Daily' : chartPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Image Generation
          </h4>
          
          <div className="space-y-3">
            {data.slice(-10).map((item, index) => {
              const value = 'totalImages' in item ? item.totalImages : 0;
              const label = 'date' in item ? item.date : 
                           'week' in item ? item.week : 
                           'month' in item ? item.month : '';
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-400 font-mono">{label}</div>
                  <div className="flex-1 bg-slate-700 rounded-full h-6 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        {chartPeriod === 'daily' && dailyStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Magic', value: dailyStats.slice(-7).reduce((sum, d) => sum + d.magicRestorations, 0), color: 'purple' },
              { label: 'Filters', value: dailyStats.slice(-7).reduce((sum, d) => sum + d.filterApplications, 0), color: 'blue' },
              { label: 'Adjustments', value: dailyStats.slice(-7).reduce((sum, d) => sum + d.adjustments, 0), color: 'green' },
              { label: 'Crops', value: dailyStats.slice(-7).reduce((sum, d) => sum + d.crops, 0), color: 'orange' }
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br from-${color}-600/20 to-${color}-500/10 border border-${color}-500/30 rounded-lg p-3 text-center`}>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400">{label} (7d)</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRanking = () => {
    if (topUsers.length === 0) return <div className="text-gray-400">No users found</div>;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-400" />
            Top Users Leaderboard
          </h4>
          
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.email} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {user.rank}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.displayName}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{user.totalImages}</div>
                  <div className="text-gray-400 text-sm">images</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: '🥇 Most Active', user: topUsers[0]?.displayName || 'N/A', value: topUsers[0]?.totalImages || 0 },
            { title: '📈 Rising Star', user: topUsers[1]?.displayName || 'N/A', value: topUsers[1]?.totalImages || 0 },
            { title: '🎯 Consistent', user: topUsers[2]?.displayName || 'N/A', value: topUsers[2]?.totalImages || 0 }
          ].map(({ title, user, value }) => (
            <div key={title} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50 text-center">
              <div className="text-lg font-bold text-white mb-1">{title}</div>
              <div className="text-blue-400 font-medium">{user}</div>
              <div className="text-gray-400 text-sm">{value} images</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const recentDays = dailyStats.slice(-7);
    if (recentDays.length === 0) return <div className="text-gray-400">No timeline data available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Activity Timeline (Last 7 Days)
          </h4>
          
          <div className="space-y-4">
            {recentDays.reverse().map((day) => (
              <div key={day.date} className="border-l-4 border-blue-500 pl-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="text-blue-400 font-bold">{day.totalImages} images</div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  <div className="text-gray-400">✨ Magic: <span className="text-purple-400">{day.magicRestorations}</span></div>
                  <div className="text-gray-400">🎨 Filters: <span className="text-blue-400">{day.filterApplications}</span></div>
                  <div className="text-gray-400">🔧 Adjustments: <span className="text-green-400">{day.adjustments}</span></div>
                  <div className="text-gray-400">✂️ Crops: <span className="text-orange-400">{day.crops}</span></div>
                  <div className="text-gray-400">🖼️ Retouches: <span className="text-red-400">{day.retouches}</span></div>
                  <div className="text-gray-400">👥 Users: <span className="text-cyan-400">{day.activeUsers}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
          <h5 className="text-lg font-semibold text-white mb-3">📊 7-Day Summary</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{recentDays.reduce((sum, d) => sum + d.totalImages, 0)}</div>
              <div className="text-gray-400 text-sm">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.max(...recentDays.map(d => d.totalImages))}</div>
              <div className="text-gray-400 text-sm">Peak Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(recentDays.reduce((sum, d) => sum + d.totalImages, 0) / recentDays.length)}</div>
              <div className="text-gray-400 text-sm">Daily Avg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{Math.max(...recentDays.map(d => d.activeUsers))}</div>
              <div className="text-gray-400 text-sm">Peak Users</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-600 rounded-xl w-full max-w-6xl my-8 overflow-hidden relative shadow-2xl animate-modal-fade-in"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-600 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white pr-4">📊 Advanced Analytics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-slate-700 rounded-lg flex-shrink-0 -mr-3"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-3 sm:p-4 border-b border-slate-600 bg-slate-900 sticky top-[73px] sm:top-[89px] z-10">
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
            {[
              { key: 'charts', label: '📈 Charts', icon: ChartBarIcon },
              { key: 'ranking', label: '🏆 Ranking', icon: TrophyIcon },
              { key: 'timeline', label: '📅 Timeline', icon: CalendarIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-900" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Loading advanced analytics...</span>
            </div>
          ) : (
            <>
              {activeTab === 'charts' && renderChart()}
              {activeTab === 'ranking' && renderRanking()}
              {activeTab === 'timeline' && renderTimeline()}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AdvancedStatsModal;
