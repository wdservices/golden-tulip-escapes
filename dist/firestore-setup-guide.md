# Firestore Database Setup Guide

## 1. Branches Collection

### Step 1: Create Branches Collection
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on "Firestore Database"
4. Click "Start collection"
5. Enter `branches` as the Collection ID
6. Click "Next"

### Step 2: Add Branch Document
1. For Document ID, click "Auto ID"
2. Add these fields:
   - `name` (string): e.g., "Golden Tulip Lagos"
   - `location` (string): e.g., "Lagos, Nigeria"
   - `address` (string): Full address
   - `phone` (string): Contact number
   - `email` (string): Contact email
   - `isActive` (boolean): true
3. Click "Save"

## 2. Rooms Subcollection

### Step 3: Create Rooms Subcollection
1. Click on the branch document you just created
2. Click "Start collection"
3. Name it `rooms`
4. Click "Next"

### Step 4: Add Room Document
1. Click "Auto ID" for Document ID
2. Add these fields:
   - `roomNumber` (string): e.g., "101"
   - `type` (string): e.g., "Deluxe"
   - `pricePerNight` (number): e.g., 30000
   - `maxOccupancy` (number): e.g., 2
   - `amenities` (array): ["AC", "TV", "WiFi"]
   - `isAvailable` (boolean): true
   - `images` (array): ["image1.jpg"]
3. Click "Save"

## 3. Bookings Collection

### Step 5: Create Bookings Collection
1. Go back to Firestore root
2. Click "Start collection"
3. Name it `bookings`
4. Click "Next"
5. Add a test booking document with these fields:
   - `userId` (string): "test-user"
   - `branchId` (string): [ID of your branch]
   - `status` (string): "confirmed"
   - `checkIn` (timestamp): Set a future date
   - `checkOut` (timestamp): Set a future date
   - `totalAmount` (number): e.g., 60000
   - `createdAt` (timestamp): Click clock icon → "now"

## 4. Payments Subcollection

### Step 6: Create Payments Subcollection
1. Click on the test booking document
2. Click "Start collection"
3. Name it `payments`
4. Click "Next"
5. Add a test payment document:
   - `amount` (number): e.g., 60000
   - `status` (string): "completed"
   - `method` (string): "card"
   - `date` (timestamp): Click clock icon → "now"

## 5. Admin Users Collection

### Step 7: Create Admin Users Collection
1. Go back to Firestore root
2. Click "Start collection"
3. Name it `adminUsers`
4. Click "Next"
5. Add an admin user document:
   - `email` (string): "admin@example.com"
   - `fullName` (string): "Admin User"
   - `branchId` (string): [ID of the branch this admin manages]
   - `role` (string): "admin" (or "super_admin" for full access)
   - `isActive` (boolean): true
   - `createdAt` (timestamp): Click clock icon → "now"
   - `lastLogin` (timestamp): Leave empty initially

## 6. Regular Users Collection

### Step 8: Create Regular Users Collection
1. Go back to Firestore root
2. Click "Start collection"
3. Name it `users`
4. Click "Next"
5. Add a test user document:
   - `email` (string): "test@example.com"
   - `fullName` (string): "Test User"
   - `phone` (string): "+1234567890"
   - `createdAt` (timestamp): Click clock icon → "now"

## Final Database Structure

```
Firestore Database
├── branches (collection)
│   └── {branchId} (document)
│       ├── name: string
│       ├── location: string
│       └── rooms (subcollection)
│           └── {roomId} (document)
│               ├── roomNumber: string
│               ├── type: string
│               └── pricePerNight: number
│
├── bookings (collection)
│   └── {bookingId} (document)
│       ├── userId: string
│       ├── branchId: string
│       └── payments (subcollection)
│           └── {paymentId} (document)
│               ├── amount: number
│               └── status: string
│
├── adminUsers (collection)
│   └── {adminId} (document)
│       ├── email: string
│       ├── branchId: string
│       └── role: "admin" | "super_admin"
│
└── users (collection)
    └── {userId} (document)
        ├── email: string
        └── fullName: string
```

## Important Notes:
1. Replace test data with real data in production
2. Set up proper security rules
3. Use the same structure for all branches
4. Keep document IDs consistent with your application logic
5. For admin users, use the same ID as their authentication UID for easier management
