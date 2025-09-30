import { Branch } from "@/types/branch";
import { roomTypes as updatedRoomTypes } from "@/data/rooms";
import { Bed, Users, DollarSign, Check, Star, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import luxurySuite from "@/assets/luxury-suite.jpg";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
  branchId?: string;
}

export const BranchRooms = ({ roomTypes = [], branchId }: BranchRoomsProps) => {
  // Use updated room data instead of branch-specific room types
  const roomsToDisplay = updatedRoomTypes;

  return (
    <section className="py-16" id="rooms">
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Rooms & Suites
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Luxurious accommodations designed for your comfort
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roomsToDisplay.map((room, index) => (
            <div 
              key={room.id}
              className="bg-card rounded-xl shadow-lg h-full flex flex-col"
            >
              {/* Room Image */}
              <div className="relative overflow-hidden rounded-t-xl flex-grow">
                <img 
                  src={luxurySuite} 
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-2xl font-bold text-primary mb-2">₦{room.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/night</span></div>
                <h3 className="text-xl font-semibold mb-3">
                  {room.name}
                </h3>
                {/* Description removed as requested */}
                <ul className="space-y-2 mb-6 flex-grow">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center mt-auto">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">{room.capacity} {room.capacity === 1 ? 'adult' : 'adults'}</span>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link to={`/branch/${branchId}/room/${room.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
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