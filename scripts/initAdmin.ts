require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

async function initializeAdmin() {
  console.log('🚀 Starting admin initialization...');
  
  try {
    // Import required modules dynamically
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { initializeDefaultAdminEmails } = await import('../src/services/adminEmailService');

    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔄 Running initializeDefaultAdminEmails...');
    await initializeDefaultAdminEmails();
    
    console.log('✅ Admin initialization completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdmin().catch(error => {
  console.error('Unhandled error in initializeAdmin:', error);
  process.exit(1);
});
