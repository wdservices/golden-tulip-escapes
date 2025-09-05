import { CheckCircle } from "lucide-react";
import { Branch } from "@/types/branch";

interface BranchAmenitiesProps {
  amenities: string[];
}

export const BranchAmenities = ({ amenities }: BranchAmenitiesProps) => {
  if (!amenities || amenities.length === 0) return null;

  return (
    <section className="py-16 bg-white" id="amenities">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Amenities & Services
          </h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="flex items-start p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <CheckCircle className="h-6 w-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-800">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
