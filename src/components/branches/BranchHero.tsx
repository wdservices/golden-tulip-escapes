import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Branch } from "@/types/branch";
import { useEffect, useMemo, useState } from "react";

interface BranchHeroProps {
  branch: Branch;
}

export const BranchHero = ({ branch }: BranchHeroProps) => {
  const [show360, setShow360] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const branchCarousels: Record<string, string[]> = useMemo(() => ({
    "garden-city": [
      "/images/garden city images/carousel image/IMG20251204143022.jpg",
      "/images/garden city images/carousel image/IMG20251204143029.jpg",
      "/images/garden city images/carousel image/IMG20251204143100.jpg",
      "/images/garden city images/carousel image/IMG20251204143123.jpg",
    ],
    "stadium-31": [
      "/images/stadium road 31 images/carousel image/IMG20251204133623.jpg",
      "/images/stadium road 31 images/carousel image/IMG20251204133738.jpg",
      "/images/stadium road 31 images/carousel image/IMG20251204133813.jpg",
      "/images/stadium road 31 images/carousel image/IMG20251204133857.jpg",
    ],
    "evergreen": [
      "/images/evergreen images/deluxe room.webp",
      "/images/evergreen images/executive room.webp",
      "/images/evergreen images/standard room.webp",
      "/images/evergreen images/superior room.webp",
    ],
  }), []);

  const carouselImages = branchCarousels[branch.id] || [];
  const useCarousel = carouselImages.length > 0;

  useEffect(() => {
    if (!useCarousel) return;
    setCurrentSlide(0);
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [useCarousel, carouselImages.length]);

  // Determine which iframe source to use based on branch ID
  const getIframeSrc = () => {
    if (branch.id === 'garden-city') {
      return "https://kuula.co/share/collection/7HGxY?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1";
    }
    if (branch.id === 'stadium-31') {
      return "https://kuula.co/share/collection/7HphP?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1";
    }
    if (branch.id === 'evergreen') {
      return "https://kuula.co/share/collection/7HpLw?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1";
    }
    // Default iframe for other branches
    return "https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&";
  };
  
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Hero Visual */}
      <div className="absolute inset-0 w-full h-full">
        {useCarousel ? (
          <div className="absolute inset-0 w-full h-full relative group">
            {carouselImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`${branch.name} showcase ${index + 1}`}
                className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? carouselImages.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg"
              aria-label="Previous slide"
            >
              <span className="sr-only">Previous slide</span>
              ‹
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === carouselImages.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg"
              aria-label="Next slide"
            >
              <span className="sr-only">Next slide</span>
              ›
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {show360 ? (
              <iframe
                width="100%"
                height="640"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  maxWidth: "100%",
                }}
                allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
                loading="lazy"
                frameBorder="0"
                src={getIframeSrc()}
                title="360° Virtual Tour of Golden Tulip Hotel"
                className="absolute inset-0 w-full h-full"
                onError={() => setShow360(false)}
              />
            ) : (
              <img
                src={branch.image}
                alt={`${branch.name} Branch`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 hero-gradient" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 text-white">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {branch.fullName}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
            {branch.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-lg px-10 py-7 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link to="/book">
                <Calendar className="mr-3 h-5 w-5" />
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
