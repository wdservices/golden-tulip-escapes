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

  // Fallback data - Source of Truth from CorporateHallDetailPage
  const fallbackHalls: CorporateHall[] = [
    {
      id: "anioma-hall",
      name: "Anioma Restaurant",
      capacity: 500,
      priceRange: "From ₦1,000,000 per day",
      description: "A grand restaurant perfect for large corporate events, conferences, and celebrations. Features state-of-the-art facilities and elegant décor. Can also be arranged to hall standard for various events.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage"],
      location: "Ground Floor, Main Building",
      size: "2,500 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7HvLS?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
    },
    {
      id: "abuja-hall",
      name: "Abuja Hall",
      capacity: 300,
      priceRange: "From ₦750,000 per day",
      description: "An elegant mid-sized hall ideal for corporate meetings, seminars, and private functions. Modern amenities with professional ambiance.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service"],
      location: "First Floor, East Wing",
      size: "1,800 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmv?logo=0&info=1&fs=1&vr=0&sd=1&autop=90&thumbs=1&autorotate=0.16"
    },
    {
      id: "lagos-hall",
      name: "Lagos Hall",
      capacity: 200,
      priceRange: "From ₦400,000 per day",
      description: "A sophisticated smaller hall perfect for intimate corporate gatherings, board meetings, and executive events.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector"],
      location: "Second Floor, West Wing",
      size: "1,200 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7HpmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
    },
    {
      id: "kano-hall",
      name: "Kano Hall",
      capacity: 150,
      priceRange: "From ₦300,000 per day",
      description: "A cozy and professional space designed for small to medium corporate events, training sessions, and workshops.",
      features: ["Air Conditioning", "Free WiFi", "Sound System", "Projector"],
      location: "First Floor, Central Wing",
      size: "900 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmq?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
    },
    {
      id: "rivers-hall-boardroom",
      name: "Rivers Hall - Boardroom",
      capacity: 25,
      priceRange: "From ₦400,000 per day",
      description: "An executive boardroom designed for high-level discussions and strategic planning with premium amenities.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service", "Executive Seating"],
      location: "Executive Floor, Premium Wing",
      size: "800 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpm9?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
    },
    {
      id: "the-pavilion-event-centre",
      name: "The Pavilion/ Event Centre",
      capacity: 300,
      priceRange: "From ₦3,000,000 per day",
      description: "Our largest venue, suitable for grand corporate events, exhibitions, and large-scale conferences with world-class facilities.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage", "VIP Lounge", "Exhibition Space", "Multiple Breakout Rooms"],
      location: "Ground Floor, Grand Wing",
      size: "5,000 sq ft",
      kuulaEmbedUrl: "https://kuula.co/share/collection/7HvmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
    },
    {
      id: "the-marquee",
      name: "The Marquee",
      capacity: 100,
      priceRange: "₦500,000 per day",
      description: "A flexible outdoor/indoor space, perfect for corporate receptions and product launches. Features elegant tent-style architecture with modern amenities.",
      features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Outdoor Access", "Garden View"],
      location: "Garden Terrace, West Wing",
      size: "3,000 sq ft",
      kuulaEmbedUrl: ""
    }
  ];

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
        } 
        
        // else {
        //   // Fallback to branch events data from branchService
        //   console.log('No halls collection found, checking branch events from branchService...');
          
        //   // Get all branches and their events data
        //   const branches = ['evo-road', 'garden-city', 'evergreen', 'stadium-31'];
          
        //   for (const branchSlug of branches) {
        //     try {
        //       const branchData = getBranchBySlug(branchSlug);
        //       if (branchData && branchData.events && Array.isArray(branchData.events)) {
        //         const branchHalls = branchData.events.map((event: any) => ({
        //           id: `${branchSlug}-${event.type.toLowerCase().replace(/\s+/g, '-')}`,
        //           name: event.type,
        //           capacity: event.capacity,
        //           priceRange: event.priceRange,
        //           description: `Professional ${event.type} venue with modern amenities and excellent service.`,
        //           features: event.features || [],
        //           type: event.type,
        //           location: `${branchData.name}, ${branchData.location}`,
        //           size: "Various sizes available"
        //         }));
        //         corporateHallsData.push(...branchHalls);
        //       }
        //     } catch (branchError) {
        //       console.warn(`Could not fetch events for branch ${branchSlug}:`, branchError);
        //     }
        //   }
        // }

        // If still no data, use hardcoded fallback
        if (corporateHallsData.length === 0) {
          console.log('No corporate halls data found in Firestore or branchService, using fallback data');
          corporateHallsData = fallbackHalls;
        }

        setHalls(corporateHallsData);
      } catch (err) {
        console.error('Error fetching corporate halls:', err);
        setError('Failed to load corporate halls. Please try again later.');
        
        // Fallback to hardcoded data on error
        setHalls(fallbackHalls);
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateHalls();
  }, []);

  return { halls, loading, error };
};