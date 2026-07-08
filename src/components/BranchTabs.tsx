import { Link, useNavigate } from "react-router-dom";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
import stadiumRoad31 from "@/assets/stadium-road-31.jpg";

interface BranchTabsProps {
  selectedBranch?: string;
  onBranchSelect?: (branch: string) => void;
}

export function BranchTabs({ selectedBranch, onBranchSelect }: BranchTabsProps) {
  const navigate = useNavigate();
  
  const branches = [
    {
      id: "evergreen",
      name: "Evergreen",
      location: "Evergreen, Port Harcourt",
      image: "/images/room_image_placeholder/Evergreen.png",
      description: "Tranquil setting with premium amenities and personalized service"
    },
    {
      id: "garden-city",
      name: "Garden City",
      location: "Garden City, Port Harcourt",
      image: "/images/garden city images/standard room.webp",
      description: "Luxury accommodation in the heart of Garden City"
    },
    {
      id: "stadium-31",
      name: "Stadium Road 31",
      location: "Stadium Road 31, Port Harcourt",
      image: "/images/room_image_placeholder/standium rd 31.png",
      description: "Modern hotel with excellent facilities"
    }
  ];

  return (
    <section className="py-16 relative bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
            Choose Your Golden Tulip Experience
          </h2>
          <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg">
            Three premium locations across Rivers State, each offering unique luxury experiences
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {branches.map((branch) => {
              return (
                <Link 
                  to={`/branches/${branch.id}`}
                  key={branch.id}
                  className={`block transition-all duration-300 ${selectedBranch === branch.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onBranchSelect?.(branch.id);
                    navigate(`/branches/${branch.id}`);
                  }}
                >
                  <div className="luxury-branch-card group">
                    <div className="relative overflow-hidden rounded-xl h-56 md:h-64">
                      <img 
                    src={branch.image} 
                    alt={branch.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="backdrop-blur-sm bg-black/40 p-4 rounded-b-xl">
                      <h3 className="text-base font-serif font-bold text-white mb-1">
                        {branch.name}
                      </h3>
                      <p className="text-white/90 text-sm">{branch.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};