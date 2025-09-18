import { CheckCircle } from "lucide-react";
import { Branch } from "@/types/branch";

interface BranchAmenitiesProps {
  amenities: string[];
}

export const BranchAmenities = ({ amenities }: BranchAmenitiesProps) => {
  if (!amenities || amenities.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background" id="amenities">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
            Amenities & Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Exceptional facilities designed for your comfort and convenience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="flex items-start p-6 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-xl hover:shadow-glow transition-all duration-300 group"
            >
              <CheckCircle className="h-6 w-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-amber-600 transition-colors" />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
