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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, role, branchId } = req.body;

    if (!userId || !role || !branchId) {
      return res.status(400).json({ error: 'Missing required parameters: userId, role, branchId' });
    }

    if (!['branch-admin', 'hq-admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be branch-admin or hq-admin' });
    }

    // Get the current user's ID token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token and check if the user is an admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Only HQ admins can set branch admin claims
    if (!decodedToken.role || decodedToken.role !== 'hq-admin') {
      return res.status(403).json({ error: 'Forbidden: Only HQ admins can set branch admin claims' });
    }

    // Set custom claims for the target user
    const claims = {
      role: role,
      branchIds: role === 'hq-admin' ? ['all'] : [branchId]
    };

    await getAuth().setCustomUserClaims(userId, claims);

    return res.status(200).json({ 
      message: 'Branch admin claims set successfully',
      role: role,
      branchId: branchId
    });
  } catch (error) {
    console.error('Error setting branch admin claims:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}