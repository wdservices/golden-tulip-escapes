import { Branch } from "@/types/branch";
import { Bed, Users, DollarSign, Check, Star, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import luxurySuite from "@/assets/luxury-suite.jpg";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
  branchId?: string;
}

export const BranchRooms = ({ roomTypes = [], branchId }: BranchRoomsProps) => {
  const [roomsToDisplay, setRoomsToDisplay] = useState(roomTypes);

  useEffect(() => {
    const fetchRoomPrices = async () => {
      if (!branchId || roomTypes.length === 0) return;

      // Map URL branch IDs to Firestore branch IDs
      const branchIdMapping: { [key: string]: string } = {
        "stadium-31": "UShvwSYpMNpuNaS32MxZ",
        "evo-road": "URcvGkmbfrOFInlOS4I9",
        "evergreen": "5vkOc2peS2tAoTyHcmQp",
        "garden-city": "RYoG3qsKFIiy9REDFRbq",
        // Add other branch mappings as needed
      };

      const firestoreBranchId = branchIdMapping[branchId] || branchId;
      
      console.log("BranchRooms: Fetching prices for branch:", branchId, "-> Firestore ID:", firestoreBranchId);

      try {
        const roomsRef = collection(db, "branches", firestoreBranchId, "rooms");
        const roomsSnap = await getDocs(roomsRef);
        
        if (!roomsSnap.empty) {
          const priceMap = new Map<string, number>();
          roomsSnap.forEach(doc => {
            const data = doc.data() as { type?: string; pricePerNight?: number | string };
            if (data.type && data.pricePerNight !== undefined) {
              const price = Number(data.pricePerNight);
              const existing = priceMap.get(data.type);
              if (Number.isFinite(price) && (existing === undefined || price > existing)) {
                priceMap.set(data.type, price);
              }
            }
          });
          
          console.log("BranchRooms: Found prices in DB:", Array.from(priceMap.entries()));

          const updatedRooms = roomTypes.map(staticRoom => {
            let dbPrice = priceMap.get(staticRoom.name?.toLowerCase());
            
            console.log("BranchRooms: Looking for price for room:", staticRoom.name, "-> Found:", dbPrice);
            
            // Handle ID mapping for different naming conventions
            if (dbPrice === undefined) {
              // Try different variations of the room name
              const roomNameVariations = [
                staticRoom.name?.toLowerCase(),
                staticRoom.name?.toLowerCase().replace(/\s+/g, '-'),
                staticRoom.name?.toLowerCase().replace(/\s+/g, ''),
                staticRoom.name?.toLowerCase().split(' ')[0]
              ];
              
              for (const variation of roomNameVariations) {
                if (priceMap.has(variation)) {
                  dbPrice = priceMap.get(variation);
                  console.log("BranchRooms: Found price using variation:", variation, "-> Price:", dbPrice);
                  break;
                }
              }
            }

            if (dbPrice !== undefined) {
              const updatedRoom = {
                ...staticRoom,
                priceRange: `₦${dbPrice.toLocaleString()}`,
              };
              console.log("BranchRooms: Updated room price:", staticRoom.name, "->", updatedRoom.priceRange);
              return updatedRoom;
            }
            return staticRoom;
          });
          
          setRoomsToDisplay(updatedRooms);
          console.log("BranchRooms: Final rooms to display:", updatedRooms.map(r => ({name: r.name, priceRange: r.priceRange})));
        } else {
          console.log("BranchRooms: No rooms found in Firestore for branch:", firestoreBranchId);
        }
      } catch (error) {
        console.error("Error fetching room prices for branch:", error);
      }
    };

    fetchRoomPrices();
  }, [branchId, roomTypes]);

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
              key={room.name || index}
              className="bg-card rounded-xl shadow-lg h-full flex flex-col"
            >
              {/* Room Image */}
              <div className="relative overflow-hidden rounded-t-xl flex-grow">
                <img 
                  src={room.image || luxurySuite} 
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-2xl font-bold text-primary mb-2">{room.priceRange}<span className="text-sm font-normal text-muted-foreground">/night</span></div>
                <h3 className="text-xl font-semibold mb-3">
                  {room.name}
                </h3>
                {/* Description removed as requested */}
                <ul className="space-y-2 mb-6 flex-grow">
                  {(room.features || []).slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                      <span>{feature}</span>
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
