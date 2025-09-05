import { Bed, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Branch } from "@/types/branch";

interface BranchRoomsProps {
  branch: Branch;
}

export const BranchRooms = ({ branch }: BranchRoomsProps) => {
  if (!branch.roomTypes || branch.roomTypes.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50" id="rooms">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Rooms & Suites
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Experience comfort and luxury in our thoughtfully designed accommodations
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branch.roomTypes.map((room, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {/* You can add room images here if available */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                  <Bed className="h-16 w-16 text-amber-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Up to {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}</span>
                  <span className="mx-2">•</span>
                  <span>{room.priceRange}/night</span>
                </div>
                
                <Button asChild className="w-full" variant="outline">
                  <Link to="/booking">
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
