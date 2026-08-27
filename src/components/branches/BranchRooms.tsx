import { Branch } from "@/types/branch";
import { Bed, Users, DollarSign, Check, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useBranchRooms } from "@/hooks/useBranchRooms";
const luxurySuite = "/images/luxury-suite.jpg";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
  branchId?: string;
}

export const BranchRooms = ({ roomTypes = [], branchId }: BranchRoomsProps) => {
  const { rooms: dbRooms, isLoading, formatPrice } = useBranchRooms(branchId);

  const dbPriceByType = new Map<string, number>();
  dbRooms.forEach((r) => {
    if (r.pricePerNight > 0) {
      const key = r.type.toLowerCase().trim();
      if (!dbPriceByType.has(key)) {
        dbPriceByType.set(key, r.pricePerNight);
      }
    }
  });

  const roomsToDisplay = roomTypes.map((staticRoom) => {
    const staticName = staticRoom.name?.toLowerCase().trim() || "";
    const variations = [
      staticName,
      staticName.replace(/\s+/g, "-"),
      staticName.replace(/\s+/g, ""),
      staticName.split(" ")[0],
    ];

    let dbPrice: number | null = null;
    for (const v of variations) {
      if (dbPriceByType.has(v)) {
        dbPrice = dbPriceByType.get(v)!;
        break;
      }
    }

    return {
      ...staticRoom,
      dbPrice,
      hasDbPrice: dbPrice !== null,
    };
  });

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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roomsToDisplay.map((room, index) => (
              <div
                key={room.name || index}
                className="bg-card rounded-xl shadow-lg h-full flex flex-col"
              >
                <div className="relative overflow-hidden rounded-t-xl flex-grow">
                  <img
                    src={room.image || luxurySuite}
                    alt={room.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {room.hasDbPrice ? (
                      <>{formatPrice(room.dbPrice!)}<span className="text-sm font-normal text-muted-foreground">/night</span></>
                    ) : (
                      <span className="text-muted-foreground text-lg">Price updating soon</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {room.name}
                  </h3>
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
        )}
      </div>
    </section>
  );
};
