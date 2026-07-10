import { motion, AnimatePresence } from "framer-motion";
import { useAd } from "@/contexts/AdContext";
import { getProxiedUrl } from "@/utils/imageUtils";
import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

export const AdMiniOverlay = () => {
  const { ads, currentAdIndex, showMiniAd, setShowMiniAd } = useAd();
  const [showFullAd, setShowFullAd] = useState(false);

  const ad = ads[currentAdIndex];

  const handleMiniAdClick = () => {
    setShowFullAd(true);
    setShowMiniAd(false);
  };

  const handleCloseFullAd = () => {
    setShowFullAd(false);
    setShowMiniAd(true);
  };

  if (!ad || (!showMiniAd && !showFullAd)) return null;

  return (
    <>
      {/* Mini floating ad */}
      <AnimatePresence>
        {showMiniAd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              y: [0, -8, 0] // Floating effect
            }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              x: { duration: 0.3 },
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="fixed bottom-4 left-4 z-[99] cursor-pointer group sm:bottom-6 sm:left-6"
            onClick={handleMiniAdClick}
          >
            {/* Pulse/Glow Effect Background */}
            <motion.div
              className="absolute -inset-3 rounded-2xl bg-yellow-500 opacity-20 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.2, 0.5, 0.2] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />

            <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-black rounded-xl overflow-hidden border-2 border-yellow-400 shadow-2xl transition-transform transform group-hover:scale-105">
              <img
                src={getProxiedUrl(ad.imageUrl)}
                alt={ad.title || "Ad"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("AdMiniOverlay: Image failed to load:", ad.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/96x96/1a1a1a/gold?text=Ad";
                }}
              />
              
              {/* Shimmer/Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                animate={{ x: ['-150%', '150%'] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  ease: "linear"
                }}
              />

              <div className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 backdrop-blur-sm hover:bg-yellow-500 hover:text-black transition-colors sm:p-1.5">
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              
              {/* Badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-black text-[8px] sm:text-[10px] font-extrabold text-center py-0.5 sm:py-1 uppercase tracking-widest shadow-sm">
                View Offer
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full size ad when mini is clicked */}
      <AnimatePresence>
        {showFullAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
            onClick={handleCloseFullAd}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border-2 border-yellow-400 flex flex-col-reverse md:flex-row max-h-[90vh] sm:max-h-[80vh] md:h-[60vh] overflow-y-auto md:overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseFullAd();
                }}
                className="absolute top-2 right-2 z-[60] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Close Ad"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              {/* Left Side: Content */}
              <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-start md:justify-center bg-gradient-to-br from-white to-gray-50 overflow-visible md:overflow-y-auto">
                {ad.title && (
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 drop-shadow-sm text-left">
                    {ad.title}
                  </h2>
                )}
                
                {ad.text && (
                  <div className="text-base md:text-lg text-gray-700 leading-relaxed text-left">
                    <p>{ad.text}</p>
                  </div>
                )}
              </div>

              {/* Right Side: Image with Blur Background */}
              <div className="w-full md:w-[45%] relative h-[40vh] md:h-full flex items-center justify-center overflow-hidden bg-gray-900 shrink-0">
                {/* Blurred Background Layer */}
                <div 
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${getProxiedUrl(ad.imageUrl)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(20px) brightness(0.5)',
                    transform: 'scale(1.1)' // Prevent blur edges
                  }}
                />
                
                {/* Main Image Layer */}
                <img
                  src={getProxiedUrl(ad.imageUrl)}
                  alt={ad.title || "Special Offer"}
                  className="relative z-10 w-full h-full object-contain p-2 md:p-4"
                  onError={(e) => {
                    console.error("AdMiniOverlay Full: Image failed to load:", ad.imageUrl);
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("placehold.co")) {
                      target.src = "https://placehold.co/1200x800/1a1a1a/gold?text=Golden+Tulip+Special+Offer";
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
