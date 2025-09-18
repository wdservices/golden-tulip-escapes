import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccount = require('./service-account.json');

  initializeApp({
    credential: cert(serviceAccount)
  });
}

app.post('/api/init-admin', async (req, res) => {
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
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});