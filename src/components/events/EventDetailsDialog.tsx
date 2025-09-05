import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EventType = {
  id: string;
  title: string;
  description: string;
  features: string[];
  capacity: string;
  includes: string[];
  priceRange: string;
  image?: string;
};

interface EventDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventType | null;
}

export const EventDetailsDialog = ({ isOpen, onClose, event }: EventDetailsDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-white rounded-full hover:bg-white shadow-md hover:shadow-lg transition-shadow"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-700" />
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-full bg-gradient-to-br from-amber-50 to-amber-100 p-6 flex flex-col justify-center">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-amber-900 mb-4">
                  {event.title}
                </DialogTitle>
              </DialogHeader>
              
              <p className="text-gray-700 mb-6">{event.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Capacity</h4>
                  <p className="text-gray-700">{event.capacity}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Price Range</h4>
                  <p className="text-gray-700">{event.priceRange}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Includes</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {event.includes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button className="mt-6 bg-amber-700 hover:bg-amber-800 w-full md:w-auto md:px-8">
                Inquire Now
              </Button>
            </div>
            
            <div className="h-64 md:h-auto bg-gray-100 flex items-center justify-center">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center p-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p>Event Space</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
