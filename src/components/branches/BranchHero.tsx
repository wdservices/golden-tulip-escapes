import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Branch } from "@/types/branch";
import { useState } from "react";

interface BranchHeroProps {
  branch: Branch;
}

export const BranchHero = ({ branch }: BranchHeroProps) => {
  const [show360, setShow360] = useState(true);
  
  // Determine which iframe source to use based on branch ID
  const getIframeSrc = () => {
    if (branch.id === 'stadium-31') {
      return "https://kuula.co/share/collection/7HphP?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1";
    }
    if (branch.id === 'evergreen') {
      return "https://kuula.co/share/collection/7HpL4?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1";
    }
    // Default iframe for other branches
    return "https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&";
  };
  
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* 360° Iframe Viewer */}
      <div className="absolute inset-0 w-full h-full">
        {show360 ? (
          <iframe 
            width="100%" 
            height="640" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none', 
              maxWidth: '100%' 
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
