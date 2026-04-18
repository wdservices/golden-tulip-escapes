import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getProxiedUrl } from '../utils/imageUtils';

export const fetchActiveAds = (callback) => {
  const adsRef = collection(db, 'ads');
  const q = query(adsRef);

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter for active ads with images, matching website logic
      const activeAds = adsData.filter(ad => ad.isActive && ad.imageUrl);
      
      console.log(`AdsService: Found ${activeAds.length} active ads out of ${adsData.length} total`);

      if (activeAds.length > 0) {
        // Map to expected format
        const formattedAds = activeAds.map(ad => ({
          id: ad.id,
          title: ad.title || 'Special Offer',
          description: ad.text || ad.description || '', // Map 'text' from website to 'description'
          imageUrl: getProxiedUrl(ad.imageUrl),
          link: ad.link || null
        }));
        
        callback(formattedAds);
      } else {
        callback([]);
      }
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error fetching ads:', error);
    callback([]);
  });
};