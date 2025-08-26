import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";

interface HeroSectionProps {
  activeBranch: string;
  onBookNowClick: () => void;
}

export const HeroSection = ({ activeBranch, onBookNowClick }: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVirtualTourActive, setIsVirtualTourActive] = useState(false);

  const images = [
    { src: hotelExterior, alt: "Golden Tulip Hotel Exterior", title: "Welcome to Luxury" },
    { src: hotelLobby, alt: "Elegant Hotel Lobby", title: "Sophisticated Elegance" },
    { src: luxurySuite, alt: "Luxury Suite", title: "Premium Comfort" }
  ];

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

  useEffect(() => {
    if (!isVirtualTourActive) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isVirtualTourActive, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const startVirtualTour = () => {
    setIsVirtualTourActive(true);
    // Simulate 360° tour by cycling through images faster
    let tourIndex = 0;
    const tourInterval = setInterval(() => {
      setCurrentImageIndex(tourIndex % images.length);
      tourIndex++;
      if (tourIndex >= images.length * 2) {
        clearInterval(tourInterval);
        setIsVirtualTourActive(false);
      }
    }, 1000);
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-gradient" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
        disabled={isVirtualTourActive}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
        disabled={isVirtualTourActive}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? "bg-primary shadow-glow"
                : "bg-white/50 hover:bg-white/75"
            }`}
            disabled={isVirtualTourActive}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Virtual Tour Status */}
            {isVirtualTourActive && (
              <div className="mb-6 inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full">
                <Play className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">360° Virtual Tour Active</span>
              </div>
            )}

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
                onClick={onBookNowClick}
                className="btn-luxury text-lg px-8 py-4 min-w-[200px]"
                size="lg"
              >
                Book Your Stay
              </Button>

              <Button
                onClick={startVirtualTour}
                variant="outline"
                className="btn-outline-luxury text-lg px-8 py-4 min-w-[200px] border-white text-white hover:bg-white hover:text-secondary"
                size="lg"
                disabled={isVirtualTourActive}
              >
                <Play className="mr-2 h-5 w-5" />
                {isVirtualTourActive ? "Tour in Progress..." : "360° Virtual Tour"}
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