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
    { src: "/images/evo road carousel image/GT-PH-1.jpg", alt: "Golden Tulip Evo Road Exterior", title: "Welcome to Golden Tulip" },
    { src: "/images/evo road carousel image/GT-PH-2.jpg", alt: "Evo Road lobby interior", title: "Grand Arrival" },
    { src: "/images/evo road carousel image/GT-PH-3.jpg", alt: "Premium suite interior", title: "Signature Suites" },
    { src: "/images/evo road carousel image/GT-PH-4.jpg", alt: "Luxury Amenities", title: "Experience Luxury" },
    { src: "/images/evo road carousel image/GT-PH-5.jpg", alt: "Modern Comfort", title: "Modern Comfort" }
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.55)_0%,_rgba(0,0,0,0.2)_70%,_transparent_100%)]" />

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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-wide">
            <span className="golden-yellow">{currentBranch.title}</span>
          </h1>

          <p className="text-xl sm:text-2xl mb-4 font-light text-white/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-widest uppercase">
            {currentBranch.subtitle}
          </p>

          <p className="text-base sm:text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/70 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {currentBranch.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleBookNowClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6 min-w-[250px] font-bold shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <Calendar className="mr-3 h-6 w-6" />
              Book Your Stay
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.goldentulip.mobile&hl=en"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/playstore-gtph.png"
                  alt="Get it on Google Play"
                  className="h-14 w-auto hover:scale-105 transition-transform duration-300"
                />
              </a>
              <button onClick={() => toast.info("iOS version coming soon!")} className="hover:scale-105 transition-transform duration-300 opacity-70 bg-white rounded-md overflow-hidden" style={{ height: '3.5rem' }}>
                <img
                  src="/appstore-gtph.png"
                  alt="Download on the App Store"
                  className="h-full w-auto"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
