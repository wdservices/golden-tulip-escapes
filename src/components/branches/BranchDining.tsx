import { Branch } from "@/types/branch";
import { Utensils, Clock, List } from "lucide-react";

interface BranchDiningProps {
  diningOptions?: Branch["diningOptions"];
}

export const BranchDining = ({ diningOptions }: BranchDiningProps) => {
  if (!diningOptions || diningOptions.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/10 to-background" id="dining">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
            Dining Options
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience exceptional culinary delights at our restaurants and bars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diningOptions.map((option, index) => (
            <div 
              key={index}
              className="card-luxury bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-glow transition-all duration-300"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-500/10 p-3 rounded-full mr-4">
                    <Utensils className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-gradient-gold">{option.name}</h3>
                    <p className="text-muted-foreground">{option.type}</p>
                  </div>
                </div>
                
                <div className="mb-6 space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-3" />
                    <span className="text-muted-foreground">{option.hours}</span>
                  </div>
                  <div className="flex items-center">
                    <List className="h-5 w-5 text-amber-500 mr-3" />
                    <span className="text-muted-foreground">{option.cuisine}</span>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-br from-amber-50/30 to-amber-100/20 p-4 rounded-2xl">
                  <h4 className="text-md font-serif font-semibold text-gradient-gold mb-3">Highlights</h4>
                  <ul className="space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="text-muted-foreground flex items-start group">
                        <span className="text-amber-500 mr-2 group-hover:text-amber-600 transition-colors">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};