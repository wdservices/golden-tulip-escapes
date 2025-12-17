import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account
const serviceAccountPath = resolve(process.cwd(), 'service-account.json');
console.log(`Reading service account from: ${serviceAccountPath}`);

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function createAdsCollection() {
  try {
    console.log('Initializing ads collection...');
    
    // Check if it already exists
    const docRef = db.collection('ads').doc('main');
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('Ads collection already exists (ads/main document found).');
      console.log('Current data:', doc.data());
    } else {
      const initialData = {
        imageUrl: "",
        text: "Welcome to Golden Tulip!",
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docRef.set(initialData);
      console.log('Successfully created ads/main document!');
    }
  } catch (error) {
    console.error('Error creating ads collection:', error);
    process.exit(1);
  }
}

createAdsCollection();
