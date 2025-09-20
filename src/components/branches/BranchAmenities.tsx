import { CheckCircle, Star } from "lucide-react";
import { Branch } from "@/types/branch";

interface BranchAmenitiesProps {
  amenities: string[];
}

export const BranchAmenities = ({ amenities }: BranchAmenitiesProps) => {
  if (!amenities || amenities.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/10" id="amenities">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
              Amenities & Services
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Exceptional facilities designed for your comfort and convenience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="flex items-start p-6 bg-card rounded-xl shadow-lg hover:shadow-glow transition-all duration-300"
            >
              <CheckCircle className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-muted-foreground bg-muted px-3 py-1 rounded-lg">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
