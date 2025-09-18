import { Branch } from "@/types/branch";
import { Bed, Users, DollarSign, Check } from "lucide-react";

interface BranchRoomsProps {
  roomTypes?: Branch["roomTypes"];
}

export const BranchRooms = ({ roomTypes }: BranchRoomsProps) => {
  if (!roomTypes || roomTypes.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20" id="rooms">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
            Rooms & Suites
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Luxurious accommodations designed for your comfort
          </p>
        </div>

        <div className="space-y-12">
          {roomTypes.map((room, index) => (
            <div 
              key={index}
              className="card-luxury border-l-4 border-l-amber-500 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-glow transition-all duration-300"
            >
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl font-serif font-semibold mb-2 text-gradient-gold">{room.name}</h3>
                    <p className="text-muted-foreground">{room.description}</p>
                  </div>
                  <div className="bg-amber-500/10 text-amber-600 font-semibold px-5 py-2.5 rounded-full">
                    {room.priceRange}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Capacity</p>
                      <p className="text-foreground font-medium">{room.capacity} {room.capacity === 1 ? 'adult' : 'adults'}</p>
                    </div>
                  </div>
                </div>

                {room.features && room.features.length > 0 && (
                  <div className="mt-8 bg-gradient-to-br from-amber-50/30 to-amber-100/20 p-6 rounded-2xl">
                    <h4 className="text-lg font-serif font-semibold text-gradient-gold mb-4">Room Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start group">
                          <Check className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-amber-600 transition-colors" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
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