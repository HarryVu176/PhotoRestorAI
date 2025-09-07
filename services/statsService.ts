/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface UserStats {
  email: string;
  displayName?: string;
  photoURL?: string;
  totalImages: number;
  magicRestorations: number;
  retouchEdits: number;
  memorialPortraits: number;
  freeEdits: number;
  compositeImages: number;
  filterApplications: number;
  adjustments: number;
  crops: number;
  lastActivity: Date;
  joinedDate: Date;
}

export interface GlobalStats {
  totalImages: number;
  totalUsers: number;
  lastUpdated: Date;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalImages: number;
  magicRestorations: number;
  retouchEdits: number;
  memorialPortraits: number;
  freeEdits: number;
  compositeImages: number;
  filterApplications: number;
  adjustments: number;
  crops: number;
  activeUsers: number;
}

export interface TopUser {
  email: string;
  displayName: string;
  totalImages: number;
  rank: number;
  photoURL?: string;
}

export interface TimeRangeStats {
  daily: DailyStats[];
  weekly: {
    week: string; // YYYY-WW format
    totalImages: number;
    activeUsers: number;
  }[];
  monthly: {
    month: string; // YYYY-MM format
    totalImages: number;
    activeUsers: number;
  }[];
}

const ADMIN_EMAIL = 'harry@moonivia.com';

/**
 * Initialize user stats when they first sign up
 */
export const initializeUserStats = async (user: any): Promise<void> => {
  try {
    const userStatsRef = doc(db, 'userStats', user.uid);
    const userStatsSnap = await getDoc(userStatsRef);
    
    if (!userStatsSnap.exists()) {
      const initialStats: UserStats = {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        totalImages: 0,
        magicRestorations: 0,
        retouchEdits: 0,
        memorialPortraits: 0,
        freeEdits: 0,
        compositeImages: 0,
        filterApplications: 0,
        adjustments: 0,
        crops: 0,
        lastActivity: new Date(),
        joinedDate: new Date()
      };
      
      await setDoc(userStatsRef, initialStats);
      console.log('✅ User stats initialized for:', user.email);
      
      // Update global stats (don't throw if this fails)
      try {
        await updateGlobalStats();
      } catch (globalError) {
        console.warn('⚠️ Failed to update global stats:', globalError);
      }
    }
  } catch (error: any) {
    // Don't throw error if it's just permissions - log it instead
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Permission denied for user stats. Please check Firestore rules:', error);
    } else {
      console.error('❌ Error initializing user stats:', error);
    }
  }
};

/**
 * Increment image generation count for a user
 */
export const incrementUserImageCount = async (
  userId: string, 
  operationType: 'magic' | 'retouch' | 'memorial' | 'freeEdit' | 'composite' | 'filter' | 'adjustment' | 'crop'
): Promise<void> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    
    const updateData: any = {
      totalImages: increment(1),
      lastActivity: new Date()
    };
    
    // Increment specific operation counter
    switch (operationType) {
      case 'magic':
        updateData.magicRestorations = increment(1);
        break;
      case 'retouch':
        updateData.retouchEdits = increment(1);
        break;
      case 'memorial':
        updateData.memorialPortraits = increment(1);
        break;
      case 'freeEdit':
        updateData.freeEdits = increment(1);
        break;
      case 'composite':
        updateData.compositeImages = increment(1);
        break;
      case 'filter':
        updateData.filterApplications = increment(1);
        break;
      case 'adjustment':
        updateData.adjustments = increment(1);
        break;
      case 'crop':
        updateData.crops = increment(1);
        break;
    }
    
    await updateDoc(userStatsRef, updateData);
    
    // Update global stats (don't throw if this fails)
    try {
      await updateGlobalStats();
    } catch (globalError) {
      console.warn('⚠️ Failed to update global stats:', globalError);
    }
    
    console.log(`✅ Incremented ${operationType} count for user:`, userId);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Permission denied for incrementing user stats. Please check Firestore rules:', error);
    } else {
      console.error('❌ Error incrementing user image count:', error);
    }
  }
};

/**
 * Get user stats
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsSnap = await getDoc(userStatsRef);
    
    if (userStatsSnap.exists()) {
      const data = userStatsSnap.data();
      return {
        ...data,
        lastActivity: data.lastActivity?.toDate() || new Date(),
        joinedDate: data.joinedDate?.toDate() || new Date()
      } as UserStats;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    return null;
  }
};

/**
 * Get all user stats (admin only)
 */
export const getAllUserStats = async (currentUserEmail: string): Promise<UserStats[]> => {
  console.log('🔍 getAllUserStats called with email:', currentUserEmail);
  
  if (currentUserEmail !== ADMIN_EMAIL) {
    console.log('❌ Access denied - not admin');
    throw new Error('Access denied. Admin privileges required.');
  }
  
  try {
    console.log('📊 Fetching all user stats from Firestore...');
    const userStatsRef = collection(db, 'userStats');
    const q = query(userStatsRef, orderBy('totalImages', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Found', querySnapshot.size, 'documents');
    
    const allStats: UserStats[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Processing document:', doc.id, data);
      allStats.push({
        ...data,
        lastActivity: data.lastActivity?.toDate() || new Date(),
        joinedDate: data.joinedDate?.toDate() || new Date()
      } as UserStats);
    });
    
    console.log('✅ Processed all user stats:', allStats);
    return allStats;
  } catch (error) {
    console.error('❌ Error getting all user stats:', error);
    return [];
  }
};

/**
 * Update global stats
 */
export const updateGlobalStats = async (): Promise<void> => {
  try {
    const userStatsRef = collection(db, 'userStats');
    const querySnapshot = await getDocs(userStatsRef);
    
    let totalImages = 0;
    let totalUsers = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalImages += data.totalImages || 0;
      totalUsers += 1;
    });
    
    const globalStatsRef = doc(db, 'globalStats', 'main');
    const globalStats: GlobalStats = {
      totalImages,
      totalUsers,
      lastUpdated: new Date()
    };
    
    await setDoc(globalStatsRef, globalStats);
    console.log('✅ Global stats updated:', globalStats);
  } catch (error) {
    console.error('❌ Error updating global stats:', error);
  }
};

/**
 * Get global stats
 */
export const getGlobalStats = async (): Promise<GlobalStats | null> => {
  try {
    console.log('🌍 Fetching global stats from Firestore...');
    const globalStatsRef = doc(db, 'globalStats', 'main');
    const globalStatsSnap = await getDoc(globalStatsRef);
    
    if (globalStatsSnap.exists()) {
      const data = globalStatsSnap.data();
      console.log('✅ Global stats found:', data);
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as GlobalStats;
    }
    
    console.log('⚠️ Global stats document does not exist');
    return null;
  } catch (error) {
    console.error('❌ Error getting global stats:', error);
    return null;
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (userEmail: string): boolean => {
  return userEmail === ADMIN_EMAIL;
};

/**
 * Get top users ranking (admin only)
 */
export const getTopUsers = async (currentUserEmail: string, limit: number = 10): Promise<TopUser[]> => {
  if (currentUserEmail !== ADMIN_EMAIL) {
    throw new Error('Access denied. Admin privileges required.');
  }
  
  try {
    console.log('🏆 Fetching top users...');
    const userStatsRef = collection(db, 'userStats');
    const q = query(userStatsRef, orderBy('totalImages', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const topUsers: TopUser[] = [];
    let rank = 1;
    
    querySnapshot.forEach((doc) => {
      if (rank <= limit) {
        const data = doc.data();
        topUsers.push({
          email: data.email,
          displayName: data.displayName || 'Anonymous',
          totalImages: data.totalImages || 0,
          rank: rank,
          photoURL: data.photoURL
        });
        rank++;
      }
    });
    
    console.log('✅ Top users fetched:', topUsers);
    return topUsers;
  } catch (error) {
    console.error('❌ Error getting top users:', error);
    return [];
  }
};

/**
 * Get daily stats for the last N days (admin only)
 */
export const getDailyStats = async (currentUserEmail: string, days: number = 30): Promise<DailyStats[]> => {
  if (currentUserEmail !== ADMIN_EMAIL) {
    throw new Error('Access denied. Admin privileges required.');
  }
  
  try {
    console.log(`📊 Fetching daily stats for last ${days} days...`);
    
    // Generate date range
    const dailyStats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // For now, generate sample data - in real app, you'd query actual daily data
      const dayData: DailyStats = {
        date: dateString,
        totalImages: Math.floor(Math.random() * 20) + 1,
        magicRestorations: Math.floor(Math.random() * 10) + 1,
        retouchEdits: Math.floor(Math.random() * 8) + 1,
        memorialPortraits: Math.floor(Math.random() * 3) + 1,
        freeEdits: Math.floor(Math.random() * 6) + 1,
        compositeImages: Math.floor(Math.random() * 4) + 1,
        filterApplications: Math.floor(Math.random() * 5) + 1,
        adjustments: Math.floor(Math.random() * 4) + 1,
        crops: Math.floor(Math.random() * 2),
        activeUsers: Math.floor(Math.random() * 5) + 1
      };
      
      dailyStats.push(dayData);
    }
    
    console.log('✅ Daily stats generated:', dailyStats);
    return dailyStats;
  } catch (error) {
    console.error('❌ Error getting daily stats:', error);
    return [];
  }
};

/**
 * Get time range stats (daily, weekly, monthly) - admin only
 */
export const getTimeRangeStats = async (currentUserEmail: string): Promise<TimeRangeStats> => {
  if (currentUserEmail !== ADMIN_EMAIL) {
    throw new Error('Access denied. Admin privileges required.');
  }
  
  try {
    console.log('📅 Fetching time range stats...');
    
    // Get daily stats for last 30 days
    const daily = await getDailyStats(currentUserEmail, 30);
    
    // Generate weekly stats (last 8 weeks)
    const weekly = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const year = weekDate.getFullYear();
      const weekNum = Math.ceil((weekDate.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      weekly.push({
        week: `${year}-W${weekNum.toString().padStart(2, '0')}`,
        totalImages: Math.floor(Math.random() * 100) + 20,
        activeUsers: Math.floor(Math.random() * 15) + 5
      });
    }
    
    // Generate monthly stats (last 6 months)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthString = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      monthly.push({
        month: monthString,
        totalImages: Math.floor(Math.random() * 300) + 50,
        activeUsers: Math.floor(Math.random() * 25) + 8
      });
    }
    
    const timeRangeStats: TimeRangeStats = {
      daily,
      weekly,
      monthly
    };
    
    console.log('✅ Time range stats generated:', timeRangeStats);
    return timeRangeStats;
  } catch (error) {
    console.error('❌ Error getting time range stats:', error);
    return { daily: [], weekly: [], monthly: [] };
  }
};

/**
 * Create user stats for existing users (admin only)
 */
export const createUserStatsForExistingUsers = async (currentUserEmail: string): Promise<void> => {
  if (currentUserEmail !== ADMIN_EMAIL) {
    throw new Error('Access denied. Admin privileges required.');
  }
  
  try {
    console.log('🔧 Creating user stats for existing users...');
    
    // Create stats for the admin user
    const adminStats: UserStats = {
      email: 'harry@moonivia.com',
      displayName: 'Admin User',
      photoURL: null,
      totalImages: 25,
      magicRestorations: 10,
      retouchEdits: 5,
      memorialPortraits: 3,
      freeEdits: 4,
      compositeImages: 2,
      filterApplications: 3,
      adjustments: 2,
      crops: 1,
      lastActivity: new Date(),
      joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    // Create stats for another user
    const user2Stats: UserStats = {
      email: 'user2@example.com',
      displayName: 'Test User 2',
      photoURL: null,
      totalImages: 15,
      magicRestorations: 8,
      retouchEdits: 3,
      memorialPortraits: 1,
      freeEdits: 2,
      compositeImages: 1,
      filterApplications: 2,
      adjustments: 1,
      crops: 1,
      lastActivity: new Date(),
      joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    };
    
    // Save to Firestore with proper user IDs
    const adminStatsRef = doc(db, 'userStats', 'admin-uid-123');
    const user2StatsRef = doc(db, 'userStats', 'user2-uid-456');
    
    await setDoc(adminStatsRef, adminStats);
    await setDoc(user2StatsRef, user2Stats);
    
    console.log('✅ Created user stats for existing users');
    
    // Update global stats to reflect real data
    await updateGlobalStats();
    
  } catch (error) {
    console.error('❌ Error creating user stats for existing users:', error);
    throw error;
  }
};

/**
 * Reset all statistics to zero (admin only)
 */
export const resetAllStats = async (adminEmail: string): Promise<void> => {
  if (adminEmail !== ADMIN_EMAIL) {
    throw new Error('Only admin can reset all statistics');
  }

  try {
    console.log('🔄 Resetting all statistics to zero...');
    
    // Reset global stats to zero
    const globalStatsRef = doc(db, 'globalStats', 'main');
    const resetGlobalStats: GlobalStats = {
      totalImages: 0,
      totalUsers: 0,
      lastUpdated: new Date()
    };
    
    await setDoc(globalStatsRef, resetGlobalStats);
    console.log('✅ Global stats reset to zero');
    
    // Get all user stats documents and reset them
    const userStatsRef = collection(db, 'userStats');
    const querySnapshot = await getDocs(userStatsRef);
    
    const resetPromises: Promise<void>[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const resetUserStats: UserStats = {
        email: data.email,
        displayName: data.displayName || 'Anonymous',
        photoURL: data.photoURL || null,
        totalImages: 0,
        magicRestorations: 0,
        retouchEdits: 0,
        memorialPortraits: 0,
        freeEdits: 0,
        compositeImages: 0,
        filterApplications: 0,
        adjustments: 0,
        crops: 0,
        lastActivity: new Date(),
        joinedDate: data.joinedDate?.toDate() || new Date() // Keep original join date
      };
      
      resetPromises.push(setDoc(doc.ref, resetUserStats));
    });
    
    await Promise.all(resetPromises);
    console.log(`✅ Reset ${querySnapshot.size} user statistics to zero`);
    
    console.log('🎉 All statistics have been reset to zero successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting statistics:', error);
    throw error;
  }
};

/**
 * Initialize sample data for testing (admin only)
 */
export const initializeSampleData = async (adminEmail: string): Promise<void> => {
  if (adminEmail !== ADMIN_EMAIL) {
    throw new Error('Only admin can initialize sample data');
  }

  try {
    console.log('🔧 Initializing sample data...');
    
    // Create sample global stats
    const globalStatsRef = doc(db, 'globalStats', 'main');
    const sampleGlobalStats: GlobalStats = {
      totalImages: 150,
      totalUsers: 5,
      lastUpdated: new Date()
    };
    
    await setDoc(globalStatsRef, sampleGlobalStats);
    console.log('✅ Sample global stats created');
    
    // Create sample user stats for admin
    const adminStatsRef = doc(db, 'userStats', 'admin-uid-123');
    const sampleAdminStats: UserStats = {
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      photoURL: null,
      totalImages: 50,
      magicRestorations: 20,
      retouchEdits: 10,
      memorialPortraits: 5,
      freeEdits: 8,
      compositeImages: 3,
      filterApplications: 6,
      adjustments: 4,
      crops: 2,
      lastActivity: new Date(),
      joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    await setDoc(adminStatsRef, sampleAdminStats);
    console.log('✅ Sample admin stats created');
    
    // Create sample stats for other users
    const sampleUsers = [
      { email: 'user1@example.com', name: 'John Doe', images: 25 },
      { email: 'user2@example.com', name: 'Jane Smith', images: 35 },
      { email: 'user3@example.com', name: 'Bob Johnson', images: 40 }
    ];
    
    for (const [index, sampleUser] of sampleUsers.entries()) {
      const userStatsRef = doc(db, 'userStats', `user-${index + 1}`);
      const userStats: UserStats = {
        email: sampleUser.email,
        displayName: sampleUser.name,
        photoURL: null,
        totalImages: sampleUser.images,
        magicRestorations: Math.floor(sampleUser.images * 0.4),
        retouchEdits: Math.floor(sampleUser.images * 0.2),
        memorialPortraits: Math.floor(sampleUser.images * 0.1),
        freeEdits: Math.floor(sampleUser.images * 0.15),
        compositeImages: Math.floor(sampleUser.images * 0.05),
        filterApplications: Math.floor(sampleUser.images * 0.1),
        adjustments: Math.floor(sampleUser.images * 0.08),
        crops: Math.floor(sampleUser.images * 0.02),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        joinedDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random within last 60 days
      };
      
      await setDoc(userStatsRef, userStats);
    }
    
    console.log('✅ Sample user data created');
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    throw error;
  }
};

/**
 * Wrapper functions to track AI operations usage
 */

// Track Magic Restoration usage
export const trackMagicRestoration = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'magic');
};

// Track Retouch Edit usage
export const trackRetouchEdit = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'retouch');
};

// Track Memorial Portrait usage
export const trackMemorialPortrait = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'memorial');
};

// Track Free Edit usage
export const trackFreeEdit = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'freeEdit');
};

// Track Composite Image usage
export const trackCompositeImage = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'composite');
};

// Track Filter Application usage
export const trackFilterApplication = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'filter');
};

// Track Adjustment usage
export const trackAdjustment = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'adjustment');
};

// Track Crop usage
export const trackCrop = async (userId: string): Promise<void> => {
  await incrementUserImageCount(userId, 'crop');
};
