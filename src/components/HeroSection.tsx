import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


interface HeroSectionProps {
  activeBranch: string;
  onBookNowClick: () => void;
}

export const HeroSection = ({ activeBranch, onBookNowClick }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <section id="home" className="relative h-screen overflow-hidden flex items-center justify-center pt-0">
      {/* Image Slider - Android style */}
      <div className="absolute inset-0 w-full h-full relative group">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg shadow-slate-300/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg shadow-slate-300/50"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

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






          </div>
        </div>
      </div>
    </section>
  );
};
