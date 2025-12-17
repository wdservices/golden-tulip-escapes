import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDatabase } from './DatabaseContext';

interface AdData {
  id?: string;
  title: string;
  imageUrl: string;
  text: string;
  isActive: boolean;
}

interface AdContextType {
  ads: AdData[];
  currentAdIndex: number;
  showMainAd: boolean;
  showMiniAd: boolean;
  setShowMainAd: (show: boolean) => void;
  setShowMiniAd: (show: boolean) => void;
  nextAd: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { queryDocuments } = useDatabase();
  const [ads, setAds] = useState<AdData[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showMainAd, setShowMainAd] = useState(false);
  const [showMiniAd, setShowMiniAd] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log("AdProvider: Fetching ads...");
        const adsData = await queryDocuments<AdData>("ads");
        console.log("AdProvider: Raw ads data:", adsData);
        const activeAds = adsData.filter(ad => ad.isActive && ad.imageUrl);
        console.log("AdProvider: Active ads found:", activeAds);
        
        if (activeAds.length > 0) {
          setAds(activeAds);
          // Show main ad immediately when ads are loaded
          setShowMainAd(true);
          console.log("AdProvider: Main ad shown");
        } else {
          console.log("AdProvider: No active ads found, using test ad");
          // Fallback test ad for development
          const testAd = {
            title: "Welcome to Golden Tulip!",
            imageUrl: "https://via.placeholder.com/1200x800/FFD700/000000?text=Golden+Tulip",
            text: "Experience luxury hospitality in Port Harcourt",
            isActive: true
          };
          setAds([testAd]);
          setShowMainAd(true);
        }
      } catch (error) {
        console.error("AdProvider: Error fetching ads:", error);
        // Fallback on error
         const testAd = {
           title: "Welcome to Golden Tulip!",
           imageUrl: "https://via.placeholder.com/1200x800/FFD700/000000?text=Golden+Tulip",
           text: "Experience luxury hospitality in Port Harcourt",
           isActive: true
         };
        setAds([testAd]);
        setShowMainAd(true);
      }
    };

    fetchAds();
  }, [queryDocuments]);

  // Handle ad rotation
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  // Handle main ad timer
  useEffect(() => {
    if (showMainAd) {
      // Calculate duration based on number of ads, but cap it to avoid being too annoying
      // Minimum 10 seconds, or 5 seconds per ad, max 20 seconds
      const duration = Math.min(Math.max(10000, ads.length * 5000), 20000);
      
      const timer = setTimeout(() => {
        setShowMainAd(false);
        // Show mini ad after main ad hides
        setTimeout(() => {
          setShowMiniAd(true);
        }, 500); // Small delay for smooth transition
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [showMainAd, ads.length]);

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <AdContext.Provider value={{
      ads,
      currentAdIndex,
      showMainAd,
      showMiniAd,
      setShowMainAd,
      setShowMiniAd,
      nextAd
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};