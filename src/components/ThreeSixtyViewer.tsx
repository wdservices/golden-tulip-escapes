import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThreeSixtyViewerProps {
  images: string[];
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export const ThreeSixtyViewer = ({
  images,
  className,
  autoRotate = true,
  rotationSpeed = 0.3
}: ThreeSixtyViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Load all images
  useEffect(() => {
    let loadedCount = 0;
    
    const loadImages = async () => {
      setIsLoading(true);
      const promises = images.map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            imageRefs.current[index] = img;
            loadedCount++;
            if (loadedCount === images.length) {
              setIsLoading(false);
            }
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            loadedCount++;
            if (loadedCount === images.length) {
              setIsLoading(false);
            }
            resolve();
          };
        });
      });

      await Promise.all(promises);
    };

    loadImages();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [images]);

  // Handle rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading || imageRefs.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Auto-rotate if enabled
      if (autoRotate && !isDragging) {
        setRotation(prev => (prev + rotationSpeed * (deltaTime / 16)) % 360);
      }

      // Calculate frame based on rotation
      const frameCount = imageRefs.current.length;
      const frameIndex = Math.floor((rotation / 360) * frameCount) % frameCount;
      setCurrentFrame(frameIndex);

      // Draw current frame
      const img = imageRefs.current[frameIndex];
      if (img) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Maintain aspect ratio
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas relative to height
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than canvas relative to width
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // Set canvas dimensions
    const updateCanvasSize = () => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    updateCanvasSize();
    animationRef.current = requestAnimationFrame(render);

    // Event listeners for window resize
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, isDragging, isLoading, rotationSpeed]);

  // Mouse/touch event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    setStartX(e.clientX);
    
    // Update rotation based on mouse movement
    setRotation(prev => {
      const newRotation = prev + (deltaX * 0.5);
      return (newRotation + 360) % 360; // Keep rotation between 0-360
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - startX;
    setStartX(e.touches[0].clientX);
    
    // Update rotation based on touch movement
    setRotation(prev => {
      const newRotation = prev + (deltaX * 0.5);
      return (newRotation + 360) % 360; // Keep rotation between 0-360
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={cn(
        'relative w-full h-full overflow-hidden bg-black/20',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="animate-pulse text-white">Loading 360° viewer...</div>
        </div>
      ) : (
        <>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            ← Drag to rotate →
          </div>
        </>
      )}
    </div>
  );
};
