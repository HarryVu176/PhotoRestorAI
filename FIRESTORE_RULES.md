# Firebase Firestore Rules Configuration

## Current Issue
The app is getting "Missing or insufficient permissions" error when trying to access Firestore.

## Solution
You need to update your Firestore security rules in Firebase Console.

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `photorestorer-pro`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read global stats
    match /globalStats/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // For updating global stats
    }
  }
}
```

5. Click **Publish** to save the rules

### What these rules do:
- **userStats collection**: Users can only read/write their own statistics document
- **globalStats collection**: All authenticated users can read and write global statistics
- **Security**: Only authenticated users can access any data

### Testing:
After updating the rules, the app should work without permission errors. Users will be able to:
- ✅ Create their own stats when first signing in
- ✅ Update their stats when using AI features  
- ✅ View their personal statistics in profile
- ✅ View global statistics
- ✅ Admin user can view all user statistics

### Admin Access:
The admin user `maxdevfs@gmail.com` will have additional privileges to view all user statistics through the app interface.
