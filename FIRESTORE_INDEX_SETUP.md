# Firestore Index Setup Guide

## Missing Index Error Fix

The dashboard is currently showing a "failed-precondition" error because a required Firestore index is missing. Since the automatic deployment failed due to permissions, you'll need to create the index manually.

## Steps to Fix:

### Option 1: Use the Firebase Console Link (Recommended)
1. When you see the error in the console, look for a message like:
   ```
   The query requires an index. You can create it here: [FIREBASE_CONSOLE_LINK]
   ```
2. Click on the provided link to automatically create the required index
3. Wait for the index to build (usually takes a few minutes)

### Option 2: Manual Creation via Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `golden-tulip-34749`
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Set up the index with these parameters:
   - **Collection ID**: `bookings`
   - **Fields**:
     - `checkInDate` (Descending)
     - `__name__` (Descending)
   - **Query scope**: Collection

### Option 3: Deploy with Proper Permissions
If you have the necessary Firebase permissions:
```bash
firebase login
firebase deploy --only firestore:indexes
```

## Current Index Configuration
The `firestore.indexes.json` file has been updated with the correct index configuration. Once you have the proper permissions, you can deploy it automatically.

## Verification
After creating the index:
1. Refresh the dashboard page
2. The "Loading dashboard data" error should disappear
3. Booking data should load successfully

## Note
The index creation is a one-time setup. Once created, it will persist and the dashboard will work normally.