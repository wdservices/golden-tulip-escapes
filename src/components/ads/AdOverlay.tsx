import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAd } from "@/contexts/AdContext";
import { getProxiedUrl } from "@/utils/imageUtils";

export const AdOverlay = () => {
  const { ads, showMainAd, setShowMainAd, setShowMiniAd, currentAdIndex } = useAd();
  
  console.log("AdOverlay: Rendering with ads:", ads, "showMainAd:", showMainAd);
  
  const currentAd = ads[currentAdIndex];

  const handleClose = () => {
    setShowMainAd(false);
    // Ensure mini overlay shows up when manually closed
    setTimeout(() => setShowMiniAd(true), 500);
  };
  
  // Calculate duration in seconds (min 10s, max 20s, 5s per ad)
  const duration = Math.min(Math.max(10, ads.length * 5), 20);

  if (!showMainAd || !currentAd) {
    console.log("AdOverlay: Not rendering (showMainAd:", showMainAd, "currentAd:", currentAd, ")");
    return null;
  }

  return (
    <AnimatePresence>
      {showMainAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border-2 border-yellow-400 max-h-[90vh] sm:max-h-[80vh] md:h-[60vh] overflow-y-auto md:overflow-hidden"
            style={{
              boxShadow: "0 0 20px 5px rgba(234, 179, 8, 0.6), 0 0 40px 10px rgba(234, 179, 8, 0.3)" // Glowing border effect
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAd.id || currentAdIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col-reverse md:flex-row w-full md:h-full"
            >
              {/* Left Side: Content */}
              <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-start md:justify-center bg-gradient-to-br from-white to-gray-50 overflow-visible md:overflow-y-auto">
                {currentAd.title && (
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 drop-shadow-sm text-left">
                      {currentAd.title}
                    </h2>
                  )}
                  
                  {currentAd.text && (
                    <div className="text-base md:text-lg text-gray-700 leading-relaxed text-left">
                      <p>{currentAd.text}</p>
                    </div>
                  )}
              </div>

              {/* Right Side: Image with Blur Background */}
              <div className="w-full md:w-[45%] relative h-[40vh] md:h-full flex items-center justify-center overflow-hidden bg-gray-900 shrink-0">
                {/* Blurred Background Layer */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundImage: `url(${getProxiedUrl(currentAd.imageUrl)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(20px) brightness(0.5)',
                      transform: 'scale(1.1)' // Prevent blur edges
                    }}
                  />
                  
                  {/* Main Image Layer */}
                  <img 
                    src={getProxiedUrl(currentAd.imageUrl)} 
                    alt={currentAd.title || "Special Offer"} 
                    className="relative z-10 w-full h-full object-contain p-2 md:p-4"
                    onError={(e) => {
                      console.error("AdOverlay: Image failed to load:", currentAd.imageUrl);
                      // Fallback to a placeholder
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("placehold.co")) {
                        target.src = "https://placehold.co/1200x800/1a1a1a/gold?text=Golden+Tulip+Special+Offer";
                      }
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Progress bar for timer - Positioned at bottom of entire card */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 z-20"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
