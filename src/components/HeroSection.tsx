import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";

interface HeroSectionProps {
  activeBranch: string;
  onBookNowClick: () => void;
}

export const HeroSection = ({ activeBranch, onBookNowClick }: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* 360 VR Iframe */}
      <div className="absolute inset-0">
        <iframe
          id="evrFrame"
          className="w-full h-full object-cover border-0"
          allow="xr-spatial-tracking;vr;gyroscope;accelerometer;fullscreen"
          allowFullScreen
          scrolling="no"
          src="https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&"
          title="360° Virtual Tour of Golden Tulip"
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
                onClick={onBookNowClick}
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