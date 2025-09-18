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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);

    // Set admin role claim
    await getAuth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    return res.status(200).json({ message: 'Admin role assigned successfully' });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}