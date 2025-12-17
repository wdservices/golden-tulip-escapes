import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useDatabase } from './DatabaseContext';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    // Real-time listener
    const q = query(collection(db, "ads"));
    
    console.log("AdProvider: Setting up real-time listener...");
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdData));
      // console.log("AdProvider: Real-time ads update:", adsData);
      
      const activeAds = adsData.filter(ad => ad.isActive && ad.imageUrl);
      console.log("AdProvider: Active ads found:", activeAds.length);
      
      if (activeAds.length > 0) {
        setAds((prevAds) => {
          // If we previously had no ads, and now we do, show the main ad
          if (prevAds.length === 0) {
            setShowMainAd(true);
          }
          return activeAds;
        });
      } else {
        console.log("AdProvider: No active ads found, disabling ads");
        setAds([]);
        setShowMainAd(false);
        setShowMiniAd(false);
      }
    }, (error) => {
      console.error("AdProvider: Error in real-time listener:", error);
      setAds([]);
      setShowMainAd(false);
      setShowMiniAd(false);
    });

    return () => unsubscribe();
  }, []);

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