import { Branch } from "@/types/branch";
import { Bed, Users, DollarSign, Check } from "lucide-react";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
}

export const BranchRooms = ({ roomTypes }: BranchRoomsProps) => {
  if (!roomTypes || roomTypes.length === 0) return null;

  return (
    <section className="py-16 bg-white" id="rooms">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Rooms & Suites
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Luxurious accommodations designed for your comfort
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        <div className="space-y-12">
          {roomTypes.map((room, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
                    <p className="text-gray-600">{room.description}</p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 font-semibold px-4 py-2 rounded-md">
                    {room.priceRange}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-amber-700 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-gray-800">{room.capacity} {room.capacity === 1 ? 'adult' : 'adults'}</p>
                    </div>
                  </div>
                </div>

                {room.features && room.features.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <Check className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};