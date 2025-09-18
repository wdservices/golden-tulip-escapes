import { Branch } from "@/types/branch";
import { Utensils, Clock, List } from "lucide-react";

interface BranchDiningProps {
  diningOptions?: Branch["diningOptions"];
}

export const BranchDining = ({ diningOptions }: BranchDiningProps) => {
  if (!diningOptions || diningOptions.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50" id="dining">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dining Options
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience exceptional culinary delights at our restaurants and bars
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diningOptions.map((option, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <Utensils className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{option.name}</h3>
                    <p className="text-gray-600 text-sm">{option.type}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-amber-700 mr-2" />
                    <span className="text-gray-700 text-sm">{option.hours}</span>
                  </div>
                  <div className="flex items-center">
                    <List className="h-4 w-4 text-amber-700 mr-2" />
                    <span className="text-gray-700 text-sm">{option.cuisine}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
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