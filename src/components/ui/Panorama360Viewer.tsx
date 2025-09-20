import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Panorama360ViewerProps {
  imageUrl: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export const Panorama360Viewer = ({
  imageUrl,
  autoRotate = true,
  rotationSpeed = 0.2
}: Panorama360ViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // Reset loading state when image URL changes
    setIsLoading(true);
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      console.error('Failed to load panorama image');
      setIsLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);
  
  useEffect(() => {
    if (autoRotate && !isDragging) {
      const interval = setInterval(() => {
        setPosition(prev => ({
          ...prev,
          x: (prev.x + rotationSpeed) % 360
        }));
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [autoRotate, isDragging, rotationSpeed]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - startPosition.x;
      const newY = Math.max(-45, Math.min(45, e.clientY - startPosition.y));
      
      setPosition({
        x: newX % 360,
        y: newY
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const newX = e.touches[0].clientX - startPosition.x;
      const newY = Math.max(-45, Math.min(45, e.touches[0].clientY - startPosition.y));
      
      setPosition({
        x: newX % 360,
        y: newY
      });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <span className="sr-only">Loading panorama...</span>
        </div>
      ) : (
        <div 
          className="absolute inset-0 bg-center bg-cover transition-transform duration-100"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: `perspective(1000px) rotateY(${position.x}deg) rotateX(${position.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        />
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
        Drag to explore 360° view
      </div>
    </div>
  );
};

export default Panorama360Viewer;