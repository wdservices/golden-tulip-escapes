import { Link, useNavigate } from "react-router-dom";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";

interface BranchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BranchTabs = ({ activeTab, onTabChange }: BranchTabsProps) => {
  const navigate = useNavigate();
  
  const handleBranchClick = (branchId: string) => {
    onTabChange(branchId);
  };
  const branches = [
    { 
      id: "stadium-31", 
      name: "Golden Tulip Port Harcourt, 31 Stadium Rd.", 
      location: "31 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
      image: hotelLobby
    },
    { 
      id: "garden-city", 
      name: "Golden Tulip Port Harcourt, Garden City", 
      location: "63 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
      image: luxurySuite
    },
    { 
      id: "evergreen", 
      name: "Golden Tulip Hotel Evergreen", 
      location: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
      image: restaurant,
      description: "A serene getaway destination with beautiful landscapes and premium comfort."
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
                  className={`block transition-all duration-300 ${activeTab === branch.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleBranchClick(branch.id);
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="backdrop-blur-sm bg-black/60 p-4 rounded-b-xl">
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