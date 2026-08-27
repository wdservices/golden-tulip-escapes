import { Branch } from "@/types/branch";
import { Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useBranchRooms } from "@/hooks/useBranchRooms";
const luxurySuite = "/images/luxury-suite.jpg";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
  branchId?: string;
}

function formatTypeName(type: string): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const BranchRooms = ({ roomTypes = [], branchId }: BranchRoomsProps) => {
  const { rooms: dbRooms, isLoading, formatPrice } = useBranchRooms(branchId);

  const staticByName = new Map<string, Branch["roomTypes"][0]>();
  roomTypes.forEach((sr) => {
    const key = sr.name?.toLowerCase().trim() || "";
    staticByName.set(key, sr);
    staticByName.set(key.replace(/\s+/g, "-"), sr);
  });

  const roomsToDisplay = dbRooms
    .filter((r) => r.pricePerNight > 0)
    .map((dbRoom) => {
      const dbType = dbRoom.type.toLowerCase().trim();
      const lookup = [
        dbType,
        dbType.replace(/-/g, " "),
        dbType.replace(/\s+/g, "-"),
      ];

      let staticMeta: Branch["roomTypes"][0] | undefined;
      for (const key of lookup) {
        if (staticByName.has(key)) {
          staticMeta = staticByName.get(key);
          break;
        }
      }

      const displayName = staticMeta?.name || formatTypeName(dbRoom.type);

      return {
        name: displayName,
        pricePerNight: dbRoom.pricePerNight,
        description: staticMeta?.description || "",
        capacity: staticMeta?.capacity || 2,
        features: staticMeta?.features || [],
        image: staticMeta?.image,
        type: dbRoom.type,
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
        ) : roomsToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No rooms available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roomsToDisplay.map((room, index) => (
              <div
                key={room.type || index}
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
                    {formatPrice(room.pricePerNight)}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{room.name}</h3>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{room.description}</p>
                  )}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {room.features.slice(0, 4).map((feature, idx) => (
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
                    <Link to={`/branch/${branchId}/room/${room.type}`}>
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
