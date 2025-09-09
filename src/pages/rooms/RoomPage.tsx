import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, Wifi, Users, Ruler, ArrowLeft, MapPin, Clock, Calendar, User, Phone, Mail } from 'lucide-react';
import { roomTypes } from '../../data/rooms';
import type { RoomType } from '../../types/room';

// Amenity icon mapping
const amenityIcons: Record<string, JSX.Element> = {
  'Wifi': <Wifi className="h-5 w-5" />,
  'Air conditioning': <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-4m-8 1.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
  </svg>,
  'TV': <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  'Minibar': <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>,
  'Safe': <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>,
  'Coffee maker': <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
};

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const selectedRoom = roomTypes.find(r => r.id === id) || null;
    setRoom(selectedRoom);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-48 bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Room not found</h2>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="text-white border-white hover:bg-white/10"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md py-4 sticky top-0 z-50 border-b border-primary/20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="text-foreground hover:bg-primary/10 flex items-center gap-2 group"
          >
            <ArrowLeft className="h-5 w-5 text-primary group-hover:translate-x-[-2px] transition-transform" />
            <span className="text-primary">Back to Rooms</span>
          </Button>
          <div className="text-primary font-serif text-xl">Golden Tulip</div>
          <Button className="bg-gradient-to-r from-primary to-amber-600 hover:from-amber-600 hover:to-primary text-white px-6 transition-all duration-300">
            Book Now
          </Button>
        </div>
      </nav>

      {/* 360° VR Room View */}
      <div className="relative w-full py-16 px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 2xl:px-40 bg-background">
        <div className="max-w-[100rem] mx-auto relative">
          {/* Gold glow effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-yellow-500/40 via-yellow-400/30 to-yellow-500/40 rounded-3xl blur-3xl -z-10 group-hover:opacity-100 opacity-70 transition-all duration-700"></div>
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-600/20 via-yellow-500/15 to-yellow-600/20 rounded-3xl blur-xl -z-20 group-hover:opacity-100 opacity-50 transition-all duration-1000"></div>
          {/* Main container */}
          <div className="relative bg-[var(--gradient-card)] rounded-2xl p-2 shadow-2xl group border border-border/20">
            {/* Inner bezel */}
            <div className="relative overflow-hidden rounded-xl" style={{ paddingTop: '80vh', minHeight: '400px' }}>
              <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-xs text-amber-300/80 bg-black/40 px-2 py-1 rounded-full">Swipe to rotate view</div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 z-10 pointer-events-none" />
              {/* Frame */}
              <div className="absolute inset-0.5 rounded-xl border border-amber-500/30 shadow-inner pointer-events-none" />
              {/* Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-500 rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-500 rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-500 rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-500 rounded-br-lg z-10" />
              
              <iframe 
                id="evrFrame"
                className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
                allow="xr-spatial-tracking; vr; gyroscope; accelerometer; fullscreen;"
                scrolling="no"
                allowFullScreen
                src={`https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=false&sm=false&sp=false&sfr=false&sl=false&sop=false&`}
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-gold font-serif">
              {room.name}
            </h1>
            <div className="flex flex-col items-center space-y-6 text-lg text-foreground">
              <div className="flex items-center space-x-6 text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>{room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</span>
                </div>
                <div className="w-px h-5 bg-primary/30"></div>
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-primary" />
                  <span>{room.bedType}</span>
                </div>
                <div className="w-px h-5 bg-primary/30"></div>
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-primary" />
                  <span>{room.size} m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-sm hover:shadow-glow transition-all duration-300">
              <h2 className="text-3xl font-bold text-gradient-gold mb-6 font-serif">Description</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {room.longDescription || room.description}
              </p>
            </div>
            
            {/* Amenities */}
            <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-sm hover:shadow-glow transition-all duration-300">
              <h2 className="text-3xl font-bold text-gradient-gold mb-8 font-serif">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-background/30 rounded-xl border border-border/10 hover:border-primary/20 transition-all duration-300 group">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                      {amenityIcons[amenity] || <Wifi className="h-5 w-5" />}
                    </div>
                    <span className="text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-all duration-500">
              <div className="mb-8 text-center">
                <div className="text-4xl font-bold text-gradient-gold mb-1">₦{room.price?.toLocaleString()}</div>
                <div className="text-muted-foreground">per night</div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/10">
                  <span className="text-muted-foreground">Check-in</span>
                  <div className="flex items-center text-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Add date</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/10">
                  <span className="text-muted-foreground">Check-out</span>
                  <div className="flex items-center text-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Add date</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/10">
                  <span className="text-muted-foreground">Guests</span>
                  <div className="flex items-center text-foreground">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">{room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-primary to-amber-600 hover:from-amber-600 hover:to-primary text-white py-6 text-lg font-medium rounded-xl transition-all duration-500 hover:shadow-glow">
                Book Now
              </Button>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                You won't be charged yet
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/20">
                <h3 className="font-semibold text-xl text-foreground mb-6 text-center">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-background/50 rounded-lg border border-border/10 hover:border-primary/20 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mr-4">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">+234 123 456 7890</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-background/50 rounded-lg border border-border/10 hover:border-primary/20 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mr-4">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">info@goldentulip.com</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-background/50 rounded-lg border border-border/10 hover:border-primary/20 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mr-4">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Support</div>
                      <div className="font-medium">24/7 Customer Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
