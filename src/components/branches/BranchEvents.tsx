import { Branch } from "@/types/branch";
import { Calendar, Users, DollarSign, CheckCircle } from "lucide-react";

interface BranchEventsProps {
  events?: Branch["events"];
}

export const BranchEvents = ({ events }: BranchEventsProps) => {
  if (!events || events.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20" id="events">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
            Events & Conferences
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Perfect venues for your corporate events and special occasions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <div 
              key={index}
              className="card-luxury bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-glow transition-all duration-300"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-600/20 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gradient-gold">{event.type}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Capacity</p>
                      <p className="text-foreground font-medium">{event.capacity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Price Range</p>
                      <p className="text-foreground font-medium">{event.priceRange}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/30 to-amber-100/20 p-6 rounded-2xl">
                  <h4 className="text-lg font-serif font-semibold text-gradient-gold mb-4">Venue Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start group">
                        <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-amber-600 transition-colors" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
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