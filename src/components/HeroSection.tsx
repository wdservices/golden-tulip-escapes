import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Simple 360° viewer implementation
const use360Viewer = (imageUrl: string) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameCount = 36; // Number of frames in the 360° sequence
  const frameWidth = 100; // Width of each frame in pixels

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const rotationChange = (deltaX / 5) % 360;
    setRotation(rotationChange);
    
    // Calculate frame based on rotation
    const frame = Math.floor((((rotationChange % 360) + 360) % 360) / (360 / frameCount));
    setCurrentRotation(frame);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  // Auto-rotate when not dragging
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.5) % 360);
        const frame = Math.floor((rotation % 360) / (360 / frameCount));
        setCurrentRotation(frame);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isDragging, rotation]);

  return {
    rotation,
    currentRotation,
    handleMouseDown,
    isDragging,
    containerRef,
    frameCount,
    frameWidth
  };
};

interface HeroSectionProps {
  activeBranch: string;
  onBookNowClick: () => void;
}

export const HeroSection = ({ activeBranch, onBookNowClick }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info('Please log in to book a stay');
      navigate('/auth', { 
        state: { 
          from: '/booking',
          message: 'Please log in to book your stay' 
        } 
      });
    } else if (onBookNowClick) {
      onBookNowClick();
    } else {
      navigate('/booking');
    }
  };
  
  // Fallback images in case 360 viewer fails
  const fallbackImages = [
    { src: "/images/hotel-exterior.jpg", alt: "Golden Tulip Hotel Exterior", title: "Welcome to Luxury" },
    { src: "/images/hotel-lobby.jpg", alt: "Elegant Hotel Lobby", title: "Sophisticated Elegance" },
    { src: "/images/luxury-suite.jpg", alt: "Luxury Suite", title: "Premium Comfort" }
  ];
  
  const [show360Viewer, setShow360Viewer] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const branchInfo = {
    main: {
      title: "Golden Tulip GRA",
      subtitle: "Head Branch • Government Reserved Area",
      description: "Experience unparalleled luxury at our flagship location in the heart of Port Harcourt's prestigious GRA district."
    },
    waterlines: {
      title: "Golden Tulip Waterlines",
      subtitle: "Waterfront Luxury • Port Harcourt",
      description: "Waterfront elegance meets modern luxury with stunning river views and premium amenities."
    },
    airforce: {
      title: "Golden Tulip Airforce",
      subtitle: "Strategic Location • Port Harcourt",
      description: "Conveniently located near the airforce base with easy access to business and leisure destinations."
    },
    oyigbo: {
      title: "Golden Tulip Oyigbo",
      subtitle: "Serene Retreat • Rivers State",
      description: "A peaceful sanctuary offering luxury accommodations in the tranquil Oyigbo area."
    }
  };

  const currentBranch = branchInfo[activeBranch as keyof typeof branchInfo] || branchInfo.main;

  // Initialize 360° viewer
  const {
    rotation,
    currentRotation,
    handleMouseDown,
    isDragging,
    containerRef,
    frameCount,
    frameWidth
  } = use360Viewer("");

  // Auto-rotate through fallback images when 360 viewer is not active
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fallbackImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fallbackImages.length]);

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* 360° Iframe Viewer */}
      <div className="absolute inset-0 w-full h-full">
        <iframe 
          id="evrFrame" 
          width="100%" 
          height="100%" 
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none', 
            maxWidth: '100%' 
          }}  
          // @ts-ignore - allowvr is a valid attribute for iframes
          allowvr="yes" 
          allow="xr-spatial-tracking; vr; gyroscope; accelerometer; fullscreen" 
          scrolling="no" 
          allowFullScreen
          frameBorder="0" 
          src="https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&"
          title="360° Virtual Tour of Golden Tulip Hotel"
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>


      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="text-gradient-gold">{currentBranch.title}</span>
            </h1>

            <p className="text-xl md:text-2xl mb-4 font-light text-primary-glow">
              {currentBranch.subtitle}
            </p>

            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              {currentBranch.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleBookNowClick}
                className="btn-luxury text-lg px-8 py-4 min-w-[200px]"
                size="lg"
              >
                Book Your Stay
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/75 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};