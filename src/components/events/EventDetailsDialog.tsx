import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThreeSixtyViewer } from "@/components/ThreeSixtyViewer";
import { useEffect, useMemo, useState } from "react";

export interface VenueType {
  name: string;
  capacity: string;
  priceRange: string;
  features: string[];
  kuulaEmbedUrl?: string;
};

export interface EventType {
  id: string;
  title: string;
  description: string;
  features: string[];
  capacity: string;
  includes: string[];
  priceRange: string;
  image?: string;
  venues?: VenueType[];
  kuulaEmbedUrl?: string;
  threeSixtyImages?: string[];
};

interface EventDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventType | null;
}

export const EventDetailsDialog = ({ isOpen, onClose, event }: EventDetailsDialogProps) => {
  if (!event) return null;

  const [selectedVenueIndex, setSelectedVenueIndex] = useState(0);

  useEffect(() => {
    if (!event.venues || event.venues.length === 0) {
      setSelectedVenueIndex(0);
      return;
    }

    const firstWithTourIndex = event.venues.findIndex(venue => !!venue.kuulaEmbedUrl);
    setSelectedVenueIndex(firstWithTourIndex >= 0 ? firstWithTourIndex : 0);
  }, [event.id, event.venues]);

  const activeVenue = useMemo(() => {
    if (!event.venues || event.venues.length === 0) return null;
    return event.venues[selectedVenueIndex] ?? event.venues[0];
  }, [event.venues, selectedVenueIndex]);

  const embedUrl = activeVenue?.kuulaEmbedUrl || event.kuulaEmbedUrl;
  const hasThreeSixtyImages = !embedUrl && !!event.threeSixtyImages?.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto p-0 bg-gradient-card border border-primary/20 shadow-2xl rounded-2xl">
        <div className="relative">
          <div className="p-6 md:p-10 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl lg:text-4xl font-serif font-bold text-center mb-4 text-gradient-gold">
                {event.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="order-2 md:order-1">
                <p className="text-muted-foreground mb-4 md:mb-6 leading-relaxed">{event.description}</p>
                
                {event.venues ? (
                  <div className="mt-8">
                    <h3 className="text-2xl font-serif font-bold text-gradient-gold mb-6">Available Venues</h3>
                    
                    <div className="space-y-6">
                      {event.venues.map((venue, idx) => (
                        <div
                          key={idx}
                          className={[
                            "card-luxury border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                            idx === selectedVenueIndex
                              ? "border-primary shadow-glow"
                              : "border-primary/20 hover:shadow-glow"
                          ].join(" ")}
                          onClick={() => setSelectedVenueIndex(idx)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedVenueIndex(idx);
                            }
                          }}
                        >
                          <div className="bg-primary/10 p-4 border-b border-primary/20">
                            <h4 className="text-xl font-serif font-semibold text-gradient-gold">{venue.name}</h4>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Capacity</p>
                                <p className="font-bold text-primary">{venue.capacity}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Price Range</p>
                                <p className="font-bold text-primary">{venue.priceRange}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold mb-3 text-gradient-gold">Features</h5>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {venue.features.map((feature, i) => (
                                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-gradient-gold mb-2">Capacity</h3>
                      <p className="text-muted-foreground">{event.capacity}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-serif font-bold text-gradient-gold mb-2">Price Range</h3>
                      <p className="text-muted-foreground">{event.priceRange}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-serif font-bold text-gradient-gold mb-4">Features</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {event.features.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-serif font-bold text-gradient-gold mb-4">Includes</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {event.includes.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 md:mt-10 flex justify-center">
                  <Button className="btn-luxury px-6 md:px-8 py-2 md:py-3">
                    Inquire Now
                  </Button>
                </div>
              </div>
              
              <div className="h-64 sm:h-80 md:h-auto order-1 md:order-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl overflow-hidden border border-primary/20">
                <div className="h-full relative">
                  {embedUrl ? (
                    <iframe
                      key={embedUrl}
                      width="100%"
                      height="100%"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        maxWidth: "100%"
                      }}
                      allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
                      loading="lazy"
                      scrolling="no"
                      frameBorder="0"
                      src={embedUrl}
                      title={`360° Virtual Tour of ${activeVenue?.name || event.title}`}
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : hasThreeSixtyImages ? (
                    <div className="absolute inset-0">
                      <ThreeSixtyViewer images={event.threeSixtyImages || []} className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-golden-yellow mb-2">360° Tour Unavailable</div>
                        <div className="text-sm text-muted-foreground">No virtual tour has been added for this selection yet.</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
