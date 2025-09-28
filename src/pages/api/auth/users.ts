import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user's ID token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token and check if the user is an admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (!decodedToken.role || decodedToken.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admins can access user data' });
    }

    // Fetch all users from Firebase Auth
    const auth = getAuth();
    const listUsersResult = await auth.listUsers(1000); // Limit to 1000 users

    // Transform the user data to match our interface
    const authUsers = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      phoneNumber: userRecord.phoneNumber || '',
      photoURL: userRecord.photoURL || '',
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        lastRefreshTime: userRecord.metadata.lastRefreshTime
      },
      customClaims: userRecord.customClaims || {},
      providerData: userRecord.providerData
    }));

    return res.status(200).json({ 
      users: authUsers,
      totalUsers: listUsersResult.users.length,
      pageToken: listUsersResult.pageToken 
    });

  } catch (error) {
    console.error('Error fetching Firebase Auth users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}