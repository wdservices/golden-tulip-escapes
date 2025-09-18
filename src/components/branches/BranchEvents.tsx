import { Branch } from "@/types/branch";
import { Calendar, Users, DollarSign, CheckCircle } from "lucide-react";

interface BranchEventsProps {
  events?: Branch["events"];
}

export const BranchEvents = ({ events }: BranchEventsProps) => {
  if (!events || events.length === 0) return null;

  return (
    <section className="py-16 bg-white" id="events">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Events & Conferences
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Perfect venues for your corporate events and special occasions
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-amber-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{event.type}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-amber-700 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-gray-800">{event.capacity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-amber-700 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Price Range</p>
                      <p className="text-gray-800">{event.priceRange}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {event.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};