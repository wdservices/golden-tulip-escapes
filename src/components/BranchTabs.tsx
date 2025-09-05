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
    if (branchId === 'main') {
      navigate('/');
    }
  };
  const branches = [
    { 
      id: "main", 
      name: "GRA", 
      fullName: "Head Branch", 
      location: "Government Reserved Area",
      image: hotelExterior,
      description: "Our flagship location"
    },
    { 
      id: "waterlines", 
      name: "Waterlines", 
      fullName: "Waterlines Branch", 
      location: "Port Harcourt",
      image: hotelLobby,
      description: "Waterfront luxury experience"
    },
    { 
      id: "airforce", 
      name: "Airforce", 
      fullName: "Airforce Base", 
      location: "Port Harcourt",
      image: luxurySuite,
      description: "Premium business hotel"
    },
    { 
      id: "oyigbo", 
      name: "Oyigbo", 
      fullName: "Oyigbo Branch", 
      location: "Rivers State",
      image: restaurant,
      description: "Serene getaway destination"
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
                className="group block"
                onClick={() => handleBranchClick(branch.id)}
              >
                {branch.id !== 'main' ? (
                  <Link 
                    to={`/branches/${branch.id}`}
                    className="block"
                    onClick={(e) => e.stopPropagation()}
                  >
                <div 
                  className={`luxury-branch-card group ${
                    activeTab === branch.id 
                      ? "luxury-branch-card-active" 
                      : "luxury-branch-card-inactive"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl h-48">
                    <img 
                      src={branch.image} 
                      alt={branch.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="backdrop-blur-sm bg-black/30 p-4 rounded-b-xl">
                        <h3 className="text-xl font-serif font-bold text-white mb-1 text-gradient-gold-light">
                          {branch.name}
                        </h3>
                        <p className="text-white/90 text-sm mb-1">{branch.location}</p>
                        <p className="text-white/80 text-xs">{branch.description}</p>
                      </div>
                    </div>
                  </div>
                  </div>
                  </Link>
                ) : (
                  <div className="cursor-pointer">
                    <div className="luxury-branch-card group">
                      <div className="relative overflow-hidden rounded-xl h-48">
                        <img 
                          src={branch.image} 
                          alt={branch.fullName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0">
                          <div className="backdrop-blur-sm bg-black/30 p-4 rounded-b-xl">
                            <h3 className="text-xl font-serif font-bold text-white mb-1 text-gradient-gold-light">
                              {branch.name}
                            </h3>
                            <p className="text-white/90 text-sm mb-1">{branch.location}</p>
                            <p className="text-white/80 text-xs">{branch.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};