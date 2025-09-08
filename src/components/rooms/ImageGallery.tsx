import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    setDirection(direction === 'next' ? 1 : -1);
    
    if (direction === 'next') {
      setSelectedImage((prev) => (prev === images.length - 1 ? 0 : (prev as number) + 1));
    } else {
      setSelectedImage((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      } else if (e.key === 'ArrowLeft') {
        navigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setSelectedImage(null);
  };

  const goToPrev = () => {
    if (selectedImage === null) return;
    setDirection(-1);
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
  };

  const goToNext = () => {
    if (selectedImage === null) return;
    setDirection(1);
    setSelectedImage((prev) => ((prev as number) + 1) % images.length);
  };

  // If no images are provided, return null
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleImageClick(index)}
          >
            <img
              src={image}
              alt={`Room view ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-lg font-medium">+{images.length - 4} more</span>
              </div>
            )}
          </motion.div>
        )).slice(0, 4)}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              aria-label="Close gallery"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center">
              <button
                className="absolute left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="w-full h-full overflow-hidden">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={`Room view ${selectedImage + 1}`}
                  className="w-full h-full max-h-[80vh] object-contain"
                  initial={{ x: direction > 0 ? 500 : -500, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction < 0 ? 500 : -500, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />
              </div>

              <button
                className="absolute right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                      setDirection(index > (selectedImage || 0) ? 1 : -1);
                    }}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === selectedImage ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
