/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PlusIcon, MinusIcon, UserIcon, CogIcon, CheckIcon, XMarkIcon } from './icons';

interface UserQuota {
  userId: string;
  email: string;
  remainingQuota: number;
  totalQuota: number;
  lastResetDate: string;
  isActive: boolean;
  createdAt: string;
}

interface UserQuotaManagerProps {
  currentUser: User | null;
  onClose: () => void;
}

export const UserQuotaManager: React.FC<UserQuotaManagerProps> = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState<UserQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newQuotaInput, setNewQuotaInput] = useState<{ [key: string]: number }>({});

  const ADMIN_EMAILS = ['harry@moonivia.com']; // Admin email list

  useEffect(() => {
    checkAdminStatus();
    if (currentUser && isAdmin) {
      loadUsers();
    }
  }, [currentUser, isAdmin]);

  const checkAdminStatus = async () => {
    if (currentUser?.email && ADMIN_EMAILS.includes(currentUser.email)) {
      setIsAdmin(true);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'userStats');
      const snapshot = await getDocs(usersRef);
      const usersList: UserQuota[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert userStats to UserQuota format
        usersList.push({
          userId: doc.id,
          email: data.email || '',
          remainingQuota: data.remainingQuota || 10, // Default quota if not set
          totalQuota: data.totalQuota || 10,
          lastResetDate: data.lastResetDate || new Date().toISOString(),
          isActive: data.isActive !== false, // Default to true if not set
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      setUsers(usersList.sort((a, b) => a.email.localeCompare(b.email)));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const updateUserQuota = async (userId: string, newQuota: number) => {
    try {
      const userRef = doc(db, 'userStats', userId);
      await updateDoc(userRef, {
        totalQuota: newQuota,
        remainingQuota: newQuota
      });
      
      await loadUsers();
      setNewQuotaInput({ ...newQuotaInput, [userId]: 0 });
    } catch (error) {
      console.error('Error updating quota:', error);
    }
  };

  const addQuota = async (userId: string, additionalQuota: number) => {
    try {
      const userRef = doc(db, 'userStats', userId);
      const user = users.find(u => u.userId === userId);
      
      if (user) {
        // Only update remainingQuota, keep totalQuota unchanged
        await updateDoc(userRef, {
          remainingQuota: user.remainingQuota + additionalQuota
        });
        
        await loadUsers();
        setNewQuotaInput({ ...newQuotaInput, [userId]: 0 });
      }
    } catch (error) {
      console.error('Error adding quota:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const userRef = doc(db, 'userStats', userId);
      await updateDoc(userRef, { isActive });
      console.log(`🔄 User status changed for ${userId}: isActive = ${isActive}`);
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const resetQuota = async (userId: string) => {
    try {
      const userRef = doc(db, 'userStats', userId);
      const user = users.find(u => u.userId === userId);
      
      if (user) {
        // Reset remainingQuota to totalQuota and update lastResetDate
        await updateDoc(userRef, {
          remainingQuota: user.totalQuota,
          lastResetDate: new Date().toISOString()
        });
        
        await loadUsers();
        console.log(`Reset quota for user ${user.email}: ${user.totalQuota}`);
      }
    } catch (error) {
      console.error('Error resetting quota:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
          <div className="text-center">
            <XMarkIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
            <p className="text-slate-400 mb-6">You don't have permission to access user management.</p>
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <CogIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">User Management & Quota</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users found in the system.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.userId}
                  className={`bg-slate-800/50 rounded-xl p-4 border ${
                    user.isActive ? 'border-slate-600' : 'border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-xs text-slate-400">ID: {user.userId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                      
                      <button
                        onClick={() => toggleUserStatus(user.userId, !user.isActive)}
                        className={`p-1 rounded ${
                          user.isActive 
                            ? 'text-red-400 hover:bg-red-500/20' 
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                        title={user.isActive ? 'Disable' : 'Enable'}
                      >
                        {user.isActive ? <XMarkIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Quota Info */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Current Quota</p>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <p className="text-xs text-slate-400">Remaining</p>
                          <span className="text-lg font-bold text-blue-400">
                            {user.remainingQuota}
                          </span>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <p className="text-xs text-slate-400">Total Limit</p>
                          <span className="text-lg font-bold text-slate-300">
                            {user.totalQuota}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            user.remainingQuota > user.totalQuota * 0.5
                              ? 'bg-green-500'
                              : user.remainingQuota > user.totalQuota * 0.2
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.max(0, (user.remainingQuota / user.totalQuota) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Set New Quota */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Set New Quota Limit</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={newQuotaInput[user.userId] || ''}
                          onChange={(e) => setNewQuotaInput({
                            ...newQuotaInput,
                            [user.userId]: parseInt(e.target.value) || 0
                          })}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
                          placeholder="New total limit"
                          title="This sets both total and remaining quota to the new value"
                        />
                        <button
                          onClick={() => updateUserQuota(user.userId, newQuotaInput[user.userId] || 0)}
                          disabled={!newQuotaInput[user.userId]}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          title="Set new quota limit"
                        >
                          Set
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">Sets both total limit and remaining quota</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Quick Actions</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => addQuota(user.userId, 10)}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                          title="Add 10 to remaining quota (keeps total limit unchanged)"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Add +10 Credits
                        </button>
                        <button
                          onClick={() => resetQuota(user.userId)}
                          className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          title="Reset remaining quota to total limit"
                        >
                          Reset to Max
                        </button>
                        <button
                          onClick={() => loadUsers()}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          title="Refresh data from database"
                        >
                          🔄 Refresh
                        </button>
                      </div>
                    </div>
                  </div>

                  {user.lastResetDate && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last reset: {new Date(user.lastResetDate).toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
