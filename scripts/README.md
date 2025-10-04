# Branch Subcollections Migration

This directory contains scripts and documentation for migrating your Golden Tulip application from global collections to branch-based subcollections.

## Overview

The migration restructures your Firestore database to store branch-specific data (payments, bookings, reports) as subcollections under each branch document. This provides better data isolation, security, and scalability.

### Before Migration
```
/bookings/{bookingId}
/payments/{paymentId}
/reports/{reportId}
```

### After Migration
```
/branches/{branchId}/bookings/{bookingId}
/branches/{branchId}/payments/{paymentId}
/branches/{branchId}/reports/{reportId}
```

## Prerequisites

1. **Environment Variables**: Ensure you have the following environment variables set:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=your-service-account-private-key
   ```

2. **Firebase Admin SDK**: The script uses Firebase Admin SDK with service account credentials.

3. **Backup**: The script automatically creates backups, but ensure you have additional backups of your data.

## Running the Migration

### Step 1: Install Dependencies
```bash
npm install firebase-admin
```

### Step 2: Set Environment Variables
Create a `.env` file or set environment variables:
```bash
# Windows PowerShell
$env:FIREBASE_PROJECT_ID="your-project-id"
$env:FIREBASE_CLIENT_EMAIL="your-service-account-email"
$env:FIREBASE_PRIVATE_KEY="your-private-key-with-newlines"

# Or create a .env file
echo "FIREBASE_PROJECT_ID=your-project-id" > .env
echo "FIREBASE_CLIENT_EMAIL=your-service-account-email" >> .env
echo "FIREBASE_PRIVATE_KEY=your-private-key" >> .env
```

### Step 3: Run the Migration
```bash
node scripts/migrateToBranchSubcollections.js
```

## Migration Process

The script performs the following steps:

1. **Backup Creation**: Creates timestamped backup collections
2. **Data Migration**: Moves documents to branch subcollections
3. **Verification**: Counts documents in new locations
4. **Summary Report**: Shows migration results

### Migration Features

- **Batch Processing**: Processes documents in batches of 500 for efficiency
- **Error Handling**: Continues migration even if individual documents fail
- **Progress Tracking**: Shows progress every 100 documents
- **Automatic Backups**: Creates backup collections before migration
- **Verification**: Verifies document counts after migration

## Post-Migration Steps

### 1. Deploy Updated Security Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Test the Application
- Verify branch admins can access their data
- Test booking and payment creation
- Ensure data isolation between branches

### 3. Update Firestore Indexes (if needed)
The new structure may require different indexes. Check the Firebase Console for any index requirements.

### 4. Clean Up (Optional)
After verifying the migration, you can clean up original collections:

```javascript
// Uncomment the cleanup code in the migration script
// and run it again to delete original collections
```

## Troubleshooting

### Common Issues

1. **Missing Branch Documents**
   ```
   Error: Branch document not found
   ```
   **Solution**: Ensure all branches exist in the `/branches` collection before migration.

2. **Permission Errors**
   ```
   Error: Permission denied
   ```
   **Solution**: Verify your service account has the necessary permissions.

3. **Index Errors**
   ```
   Error: The query requires an index
   ```
   **Solution**: Create the required indexes in Firebase Console.

### Rollback Procedure

If you need to rollback:

1. **Stop the Application**: Prevent new data creation
2. **Restore from Backup**: Copy data from backup collections
3. **Revert Code Changes**: Deploy the previous version
4. **Update Security Rules**: Revert to previous rules

## Verification Queries

After migration, verify data integrity:

```javascript
// Count documents in original collections
db.collection('bookings').get().then(snap => console.log('Original bookings:', snap.size));
db.collection('payments').get().then(snap => console.log('Original payments:', snap.size));

// Count documents in new subcollections
db.collection('branches').get().then(branches => {
  branches.forEach(branch => {
    db.collection('branches').doc(branch.id).collection('bookings').get()
      .then(bookings => console.log(`${branch.id} bookings:`, bookings.size));
    db.collection('branches').doc(branch.id).collection('payments').get()
      .then(payments => console.log(`${branch.id} payments:`, payments.size));
  });
});
```

## Security Benefits

The new structure provides:

- **Data Isolation**: Branch admins can only access their branch data
- **Improved Security Rules**: More granular access control
- **Better Performance**: Smaller query scopes
- **Scalability**: Independent scaling per branch

## Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Verify your Firebase configuration
3. Ensure all prerequisites are met
4. Contact your development team for assistance

## Files Modified

The migration updates the following files:

- `src/hooks/useBookings.ts` - Updated to query branch subcollections
- `src/hooks/usePayments.ts` - Updated to query branch subcollections  
- `src/pages/api/verify-payment.ts` - Updated to save to branch subcollections
- `firestore.rules` - Added rules for branch subcollections
- `scripts/migrateToBranchSubcollections.js` - Migration script

## Next Steps

After successful migration:

1. Monitor application performance
2. Update any remaining queries to use subcollections
3. Consider implementing cross-branch reporting if needed
4. Update documentation and training materials