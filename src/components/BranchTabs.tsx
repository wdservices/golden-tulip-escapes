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
    navigate(`/branches/${branchId}`);
  };
  const branches = [
    { 
      id: "port-harcourt", 
      name: "Golden Tulip Port Harcourt Hotel", 
      location: "1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State",
      image: hotelExterior
    },
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
      name: "Golden Tulip Port Harcourt, Evergreen", 
      location: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
      image: restaurant
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
            Four premium locations across Rivers State, each offering unique luxury experiences
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {branches.map((branch) => (
              <div 
                key={branch.id}
                className="group block cursor-pointer"
                onClick={() => handleBranchClick(branch.id)}
              >
                <div 
                  className={`luxury-branch-card group ${
                    activeTab === branch.id 
                      ? "luxury-branch-card-active" 
                      : "luxury-branch-card-inactive"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl h-64">
                    <img 
                      src={branch.image} 
                      alt={branch.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="backdrop-blur-sm bg-black/60 p-4 rounded-b-xl">
                        <h3 className="text-lg font-serif font-bold text-white mb-1">
                          {branch.name}
                        </h3>
                        <p className="text-white/90 text-sm">{branch.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};