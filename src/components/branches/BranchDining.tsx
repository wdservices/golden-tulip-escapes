import { Branch } from "@/types/branch";
import { Utensils, Clock, List, Star } from "lucide-react";

interface BranchDiningProps {
  diningOptions?: Branch["diningOptions"];
}

export const BranchDining = ({ diningOptions }: BranchDiningProps) => {
  if (!diningOptions || diningOptions.length === 0) return null;

  return (
    <section className="py-20 bg-muted/10" id="dining">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-4xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Dining Options
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience exceptional culinary delights at our restaurants and bars
          </p>
        </div>

        <div className={`grid gap-8 max-w-6xl mx-auto ${
          diningOptions.length === 1 
            ? 'grid-cols-1 max-w-md' 
            : diningOptions.length === 2 
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {diningOptions.map((option, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl p-6 md:p-8 shadow-lg flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Header with icon and name */}
                <div className="flex items-center mb-4">
                  <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0"> {/* Prevents text overflow */}
                    <h3 className="text-xl font-semibold truncate">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">{option.type}</p>
                  </div>
                </div>
                
                {/* Info section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center bg-muted p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{option.hours}</span>
                  </div>
                  <div className="flex items-center bg-muted p-2 rounded-lg">
                    <List className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{option.cuisine}</span>
                  </div>
                </div>
                
                {/* Highlights section */}
                <div className="bg-muted/50 p-4 rounded-xl mt-auto">
                  <h4 className="text-md font-medium mb-3">Highlights</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">•</span>
                        <span className="truncate">{feature}</span>
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