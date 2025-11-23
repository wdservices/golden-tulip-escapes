import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
      navigate('/book');
    }
  };
  
  // Hero images for carousel
  const heroImages = [
    { src: "/images/hero section image/image (1).jpg", alt: "Luxury Hotel Room", title: "Elegant Accommodations" },
    { src: "/images/hero section image/image (2).jpg", alt: "Hotel Exterior View", title: "Stunning Architecture" },
    { src: "/images/hero section image/image (3).jpg", alt: "Luxury Suite", title: "Premium Comfort" },
    { src: "/images/hero section image/image (4).jpg", alt: "Hotel Lobby", title: "Sophisticated Elegance" },
    { src: "/images/hero section image/image (5).jpg", alt: "Dining Area", title: "Exquisite Cuisine" },
    { src: "/images/hero section image/image (6).jpg", alt: "Relaxation Area", title: "Ultimate Relaxation" }
  ];

  const branchInfo = {
    main: {
      title: "Golden Tulip EVO Road",
      subtitle: "Head Quarters • Government Reserved Area",
      description: "A premium 4-star hotel in the heart of Port Harcourt, offering modern rooms, fine dining, meeting halls, gym, spa services, and world class hospitality for business and leisure travelers."
    },
    waterlines: {
      title: "GOLDEN TULIP WATERLINES",
      subtitle: "Waterfront Luxury • Port Harcourt",
      description: "Waterfront elegance meets modern luxury with stunning river views and premium amenities."
    },
    airforce: {
      title: "GOLDEN TULIP AIRFORCE",
      subtitle: "Strategic Location • Port Harcourt",
      description: "Conveniently located near the airforce base with easy access to business and leisure destinations."
    },
    oyigbo: {
      title: "GOLDEN TULIP OYIGBO",
      subtitle: "Serene Retreat • Rivers State",
      description: "A peaceful sanctuary offering luxury accommodations in the tranquil Oyigbo area."
    }
  };

  const currentBranch = branchInfo[activeBranch as keyof typeof branchInfo] || branchInfo.main;

  return (
    <section id="home" className="relative h-screen overflow-hidden flex items-center justify-center pt-20">
      {/* Image Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
          }),
        ]}
        className="absolute inset-0 w-full h-full"
      >
        <CarouselContent className="h-full ml-0">
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              <div className="relative h-full w-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 h-12 w-12 bg-background/20 backdrop-blur-sm border-primary/30 hover:bg-primary/90 hover:border-primary text-white" />
        <CarouselNext className="right-4 h-10 w-10 md:h-12 md:w-12 bg-background/20 backdrop-blur-sm border-primary/30 hover:bg-primary/90 hover:border-primary text-white" />
      </Carousel>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-serif font-bold mb-4 leading-tight">
              <span className="golden-yellow drop-shadow-lg">{currentBranch.title}</span>
            </h1>

            <p className="text-xl mb-3 font-light text-white/90">
              {currentBranch.subtitle}
            </p>

            <p className="text-base sm:text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed text-white/80">
              {currentBranch.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleBookNowClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 min-w-[220px] sm:min-w-[250px] font-bold shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <Calendar className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Book Your Stay
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-golden-yellow/70 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-golden-yellow rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};