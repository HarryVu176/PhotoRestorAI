/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface UserQuota {
  userId: string;
  email: string;
  remainingQuota: number;
  totalQuota: number;
  lastResetDate: string;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_QUOTA = 10; // Default quota for new users

/**
 * Initialize quota for new users
 */
export const initializeUserQuota = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'userStats', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const now = new Date().toISOString();
      const newUserQuota = {
        email: user.email || '',
        displayName: user.displayName || '',
        remainingQuota: DEFAULT_QUOTA,
        totalQuota: DEFAULT_QUOTA,
        lastResetDate: now,
        isActive: true,
        createdAt: now,
        totalImages: 0,
        magicImages: 0,
        filterImages: 0,
        adjustmentImages: 0,
        freeEditImages: 0,
        memorialImages: 0,
        compositeImages: 0,
        retouchImages: 0
      };
      
      await setDoc(userRef, newUserQuota);
      console.log('Initialized quota for new user:', user.email);
    } else {
      // Update existing user with quota fields if they don't exist
      const data = userDoc.data();
      if (!data.remainingQuota && !data.totalQuota) {
        await updateDoc(userRef, {
          remainingQuota: DEFAULT_QUOTA,
          totalQuota: DEFAULT_QUOTA,
          lastResetDate: new Date().toISOString(),
          isActive: true
        });
      }
    }
  } catch (error) {
    console.error('Error initializing user quota:', error);
    throw error;
  }
};

/**
 * Get user quota information
 */
export const getUserQuota = async (userId: string): Promise<UserQuota | null> => {
  try {
    const userRef = doc(db, 'userStats', userId);
    const userDoc = await getDoc(userRef);
    
    console.log('🔍 Getting quota for user:', userId);
    console.log('📄 Document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('📊 Raw data from Firestore:', data);
      
      const quotaData = {
        userId,
        email: data.email || '',
        remainingQuota: data.remainingQuota || DEFAULT_QUOTA,
        totalQuota: data.totalQuota || DEFAULT_QUOTA,
        lastResetDate: data.lastResetDate || new Date().toISOString(),
        isActive: data.isActive !== false,
        createdAt: data.createdAt || new Date().toISOString()
      };
      
      console.log('📋 Processed quota data:', quotaData);
      return quotaData;
    }
    
    console.log('❌ User document not found');
    return null;
  } catch (error) {
    console.error('Error getting user quota:', error);
    throw error;
  }
};

/**
 * Check if user can perform action
 */
export const canPerformAction = async (userId: string): Promise<boolean> => {
  try {
    const quota = await getUserQuota(userId);
    
    console.log('🔍 Checking quota for user:', userId);
    console.log('📊 Quota data:', quota);
    
    if (!quota) {
      console.log('❌ No quota found for user');
      return false;
    }
    
    const canPerform = quota.isActive && quota.remainingQuota > 0;
    console.log('✅ Can perform action:', canPerform, {
      isActive: quota.isActive,
      remainingQuota: quota.remainingQuota,
      totalQuota: quota.totalQuota
    });
    
    return canPerform;
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
};

/**
 * Consume quota when user performs action
 */
export const consumeQuota = async (userId: string): Promise<boolean> => {
  try {
    const canPerform = await canPerformAction(userId);
    
    if (!canPerform) {
      return false;
    }
    
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, {
      remainingQuota: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error consuming quota:', error);
    return false;
  }
};

/**
 * Add quota for user (admin only) - only increases remaining quota
 */
export const addQuota = async (userId: string, amount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, {
      remainingQuota: increment(amount)
      // Note: totalQuota stays unchanged - it represents the user's quota limit
    });
  } catch (error) {
    console.error('Error adding quota:', error);
    throw error;
  }
};

/**
 * Increase quota limit for user (admin only) - increases both total and remaining quota
 */
export const increaseQuotaLimit = async (userId: string, amount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, {
      remainingQuota: increment(amount),
      totalQuota: increment(amount)
    });
  } catch (error) {
    console.error('Error increasing quota limit:', error);
    throw error;
  }
};

/**
 * Reset quota to maximum value (admin only)
 */
export const resetQuota = async (userId: string): Promise<void> => {
  try {
    const quota = await getUserQuota(userId);
    
    if (!quota) {
      throw new Error('User not found');
    }
    
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, {
      remainingQuota: quota.totalQuota,
      lastResetDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting quota:', error);
    throw error;
  }
};

/**
 * Check if email is admin
 */
export const isAdminUser = (email: string | null): boolean => {
  const ADMIN_EMAILS = ['harry@moonivia.com'];
  return email ? ADMIN_EMAILS.includes(email) : false;
};

/**
 * Update user active status (admin only)
 */
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, { isActive });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Set new quota for user (admin only)
 */
export const setUserQuota = async (userId: string, newQuota: number): Promise<void> => {
  try {
    const userRef = doc(db, 'userStats', userId);
    await updateDoc(userRef, {
      totalQuota: newQuota,
      remainingQuota: newQuota
    });
  } catch (error) {
    console.error('Error setting user quota:', error);
    throw error;
  }
};
