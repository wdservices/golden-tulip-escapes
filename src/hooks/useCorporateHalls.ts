import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBranchBySlug } from '@/services/branchService';

export interface CorporateHall {
  id: string;
  name: string;
  capacity: string | number;
  priceRange: string;
  description: string;
  features: string[];
  location?: string;
  size?: string;
  kuulaEmbedUrl?: string;
  type?: string;
}

export const useCorporateHalls = () => {
  const [halls, setHalls] = useState<CorporateHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCorporateHalls = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from halls collection first
        const hallsRef = collection(db, 'halls');
        const hallsSnapshot = await getDocs(hallsRef);
        
        let corporateHallsData: CorporateHall[] = [];

        if (!hallsSnapshot.empty) {
          // If halls collection exists, use that data
          corporateHallsData = hallsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as CorporateHall));
        } else {
          // Fallback to branch events data from branchService
          console.log('No halls collection found, checking branch events from branchService...');
          
          // Get all branches and their events data
          const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
          
          for (const branchSlug of branches) {
            try {
              const branchData = getBranchBySlug(branchSlug);
              if (branchData && branchData.events && Array.isArray(branchData.events)) {
                const branchHalls = branchData.events.map((event: any) => ({
                  id: `${branchSlug}-${event.type.toLowerCase().replace(/\s+/g, '-')}`,
                  name: event.type,
                  capacity: event.capacity,
                  priceRange: event.priceRange,
                  description: `Professional ${event.type} venue with modern amenities and excellent service.`,
                  features: event.features || [],
                  type: event.type,
                  location: `${branchData.name}, ${branchData.location}`,
                  size: "Various sizes available"
                }));
                corporateHallsData.push(...branchHalls);
              }
            } catch (branchError) {
              console.warn(`Could not fetch events for branch ${branchSlug}:`, branchError);
            }
          }
        }

        // If still no data, use hardcoded fallback from the original pages
        if (corporateHallsData.length === 0) {
          console.log('No corporate halls data found in Firestore or branchService, using fallback data');
          corporateHallsData = [
            {
              id: "anioma-hall",
              name: "Anioma Restaurant",
              capacity: "100 - 200 guests",
              priceRange: "From ₦1,000,000 per day",
              description: "A grand restaurant perfect for large corporate events, conferences, and celebrations. Features state-of-the-art facilities and elegant décor.",
              features: [
                "Professional meeting rooms",
                "Conference facilities",
                "Catering services",
                "Audio/Visual equipment",
                "Dedicated event coordinator",
                "High-speed Wi-Fi",
                "Projector & screen",
                "Microphone & sound system",
                "Whiteboard & flip charts"
              ],
              location: "Ground Floor, Main Building",
              size: "2,500 sq ft",
              kuulaEmbedUrl: "https://kuula.co/share/collection/7HvLS?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
            },
            {
              id: "abuja-hall",
              name: "Abuja Hall",
              capacity: "80 - 150 guests",
              priceRange: "From ₦750,000 per day",
              description: "Ideal for medium-sized seminars and workshops, offering a comfortable and productive environment.",
              features: [
                "Professional meeting rooms",
                "Conference facilities",
                "Catering services",
                "Audio/Visual equipment",
                "Dedicated event coordinator",
                "High-speed Wi-Fi",
                "Projector & screen",
                "Microphone & sound system",
                "Whiteboard & flip charts"
              ],
              location: "First Floor, East Wing",
              size: "1,800 sq ft",
              kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmv?logo=0&info=1&fs=1&vr=0&sd=1&autop=90&thumbs=1&autorotate=0.16"
            },
            {
              id: "lagos-hall",
              name: "Lagos Hall",
              capacity: "30 - 40 guests",
              priceRange: "From ₦400,000 per day",
              description: "A versatile space suitable for intimate business meetings and training sessions.",
              features: [
                "Professional meeting rooms",
                "Conference facilities",
                "Catering services",
                "Audio/Visual equipment",
                "Dedicated event coordinator",
                "High-speed Wi-Fi",
                "Projector & screen",
                "Microphone & sound system",
                "Whiteboard & flip charts"
              ],
              location: "Second Floor, West Wing",
              size: "1,200 sq ft",
              kuulaEmbedUrl: "https://kuula.co/share/collection/7HpmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
            }
          ];
        }

        setHalls(corporateHallsData);
      } catch (err) {
        console.error('Error fetching corporate halls:', err);
        setError('Failed to load corporate halls. Please try again later.');
        
        // Fallback to hardcoded data on error
        const fallbackData: CorporateHall[] = [
          {
            id: "anioma-hall",
            name: "Anioma Restaurant",
            capacity: "100 - 200 guests",
            priceRange: "From ₦1,000,000 per day",
            description: "A grand restaurant perfect for large corporate events, conferences, and celebrations. Features state-of-the-art facilities and elegant décor.",
            features: [
              "Professional meeting rooms",
              "Conference facilities",
              "Catering services",
              "Audio/Visual equipment",
              "Dedicated event coordinator",
              "High-speed Wi-Fi",
              "Projector & screen",
              "Microphone & sound system",
              "Whiteboard & flip charts"
            ],
            location: "Ground Floor, Main Building",
            size: "2,500 sq ft",
            kuulaEmbedUrl: "https://kuula.co/share/collection/7HvLS?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
          },
          {
            id: "abuja-hall",
            name: "Abuja Hall",
            capacity: "80 - 150 guests",
            priceRange: "From ₦750,000 per day",
            description: "Ideal for medium-sized seminars and workshops, offering a comfortable and productive environment.",
            features: [
              "Professional meeting rooms",
              "Conference facilities",
              "Catering services",
              "Audio/Visual equipment",
              "Dedicated event coordinator",
              "High-speed Wi-Fi",
              "Projector & screen",
              "Microphone & sound system",
              "Whiteboard & flip charts"
            ],
            location: "First Floor, East Wing",
            size: "1,800 sq ft",
            kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmv?logo=0&info=1&fs=1&vr=0&sd=1&autop=90&thumbs=1&autorotate=0.16"
          }
        ];
        setHalls(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateHalls();
  }, []);

  return { halls, loading, error };
};