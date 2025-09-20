import { Branch } from "@/types/branch";
import { Calendar, Users, DollarSign, CheckCircle, Star } from "lucide-react";

interface BranchEventsProps {
  events?: Branch["events"];
}

export const BranchEvents = ({ events }: BranchEventsProps) => {
  if (!events || events.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/10" id="events">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
              Events & Conferences
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Perfect venues for your corporate events and special occasions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {events.map((event, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-glow transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{event.type}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center bg-muted p-2 rounded-lg">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Capacity</p>
                      <p className="text-foreground font-medium">{event.capacity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-muted p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Price Range</p>
                      <p className="text-foreground font-medium">{event.priceRange}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-xl">
                  <h4 className="text-lg font-medium mb-4">Venue Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
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