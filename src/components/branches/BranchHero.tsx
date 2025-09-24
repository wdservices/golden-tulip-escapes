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
  
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* 360° Iframe Viewer */}
      <div className="absolute inset-0 w-full h-full">
        {show360 ? (
          <iframe 
            width="100%" 
            height="100%" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none', 
              maxWidth: '100%' 
            }}  
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            loading="lazy"
            frameBorder="0" 
            src="https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&"
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {branch.fullName}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl leading-relaxed">
            {branch.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-lg px-10 py-7 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link to="/booking">
                <Calendar className="mr-3 h-5 w-5" />
                Book Now
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl font-medium transition-all duration-300"
            >
              <Link to={`/branches/${branch.id}#rooms`}>
                View Rooms & Suites
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
