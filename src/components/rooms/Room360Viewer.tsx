import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Room360ViewerProps {
  images: string[];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const Room360Viewer: React.FC<Room360ViewerProps> = ({
  images,
  autoRotate = true,
  rotationSpeed = 100
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMounted = useRef(true);

  // Handle auto-rotation
  useEffect(() => {
    if (!isAutoRotating || !isMounted.current) return;

    const rotate = () => {
      if (!isMounted.current) return;
      
      setCurrentIndex(prev => (prev + 1) % images.length);
      timeoutRef.current = setTimeout(rotate, rotationSpeed);
    };

    timeoutRef.current = setTimeout(rotate, rotationSpeed);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isMounted.current = false;
    };
  }, [isAutoRotating, images.length, rotationSpeed]);

  // Handle touch/mouse events for manual rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const containerWidth = containerRef.current?.offsetWidth || 0;
    
    if (Math.abs(deltaX) > containerWidth / 20) {
      const direction = deltaX > 0 ? -1 : 1;
      setCurrentIndex(prev => {
        const newIndex = prev + direction;
        if (newIndex < 0) return images.length - 1;
        if (newIndex >= images.length) return 0;
        return newIndex;
      });
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsAutoRotating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const containerWidth = containerRef.current?.offsetWidth || 0;
    
    if (Math.abs(deltaX) > containerWidth / 20) {
      const direction = deltaX > 0 ? -1 : 1;
      setCurrentIndex(prev => {
        const newIndex = prev + direction;
        if (newIndex < 0) return images.length - 1;
        if (newIndex >= images.length) return 0;
        return newIndex;
      });
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Navigation functions
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    setIsAutoRotating(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    setIsAutoRotating(false);
  }, [images.length]);

  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleAutoRotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Handle image loading
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`360 view - ${currentIndex + 1} of ${images.length}`}
            className="w-full h-full object-cover select-none"
            draggable={false}
            onLoad={handleImageLoad}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
        <button
          onClick={goToPrev}
          className="p-2 bg-black/50 text-white rounded-full pointer-events-auto hover:bg-black/70 transition-colors"
          aria-label="Previous view"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="p-2 bg-black/50 text-white rounded-full pointer-events-auto hover:bg-black/70 transition-colors"
          aria-label="Next view"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
        {/* Auto-rotation toggle */}
        <button
          onClick={toggleAutoRotate}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
          aria-label={isAutoRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
        >
          {isAutoRotating ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        {/* Reset view */}
        <button
          onClick={() => {
            setCurrentIndex(0);
            setIsAutoRotating(false);
          }}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors pointer-events-auto flex items-center"
          aria-label="Reset view"
        >
          <RotateCw className="h-5 w-5 mr-1" />
          <span className="text-sm">Reset</span>
        </button>

        {/* Image counter */}
        <div className="px-3 py-1 bg-black/50 text-white text-sm rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Help text */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Click and drag to rotate
      </div>
    </div>
  );
};

export default Room360Viewer;
