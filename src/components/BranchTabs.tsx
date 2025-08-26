import { Button } from "@/components/ui/button";

interface BranchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BranchTabs = ({ activeTab, onTabChange }: BranchTabsProps) => {
  const branches = [
    { id: "main", name: "GRA", fullName: "Head Branch", location: "Government Reserved Area" },
    { id: "waterlines", name: "Waterlines", fullName: "Waterlines Branch", location: "Port Harcourt" },
    { id: "airforce", name: "Airforce", fullName: "Airforce Base", location: "Port Harcourt" },
    { id: "oyigbo", name: "Oyigbo", fullName: "Oyigbo Branch", location: "Rivers State" }
  ];

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold mb-4 text-gradient-gold">
            Choose Your Golden Tulip Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four premium locations across Rivers State, each offering unique luxury experiences
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="glass-tabs-container p-2 rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {branches.map((branch) => (
                <Button
                  key={branch.id}
                  variant="ghost"
                  onClick={() => onTabChange(branch.id)}
                  className={`glass-tab ${
                    activeTab === branch.id 
                      ? "glass-tab-active" 
                      : "glass-tab-inactive"
                  }`}
                >
                  <div className="text-center p-2">
                    <div className="font-semibold text-sm mb-1">{branch.name}</div>
                    <div className="text-xs opacity-80">{branch.location}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};