import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, Users, Ruler, ArrowLeft, MapPin, Clock, Calendar, User, Phone, Mail, Tv, Coffee, Refrigerator, ShieldCheck, Wifi, Wind } from 'lucide-react';
import { roomTypes } from '../../data/rooms';
import type { RoomType } from '../../types/room';
import { ThreeSixtyViewer } from '@/components/ThreeSixtyViewer';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Amenity icon mapping
const amenityIcons: Record<string, JSX.Element> = {
  'Wifi': <Wifi className="h-5 w-5" />,
  'Air conditioning': <Wind className="h-5 w-5" />,
  'TV': <Tv className="h-5 w-5" />,
  'Minibar': <Refrigerator className="h-5 w-5" />,
  'Safe': <ShieldCheck className="h-5 w-5" />,
  'Coffee maker': <Coffee className="h-5 w-5" />
};

export default function RoomPage() {
  const { branchId, id } = useParams<{ branchId: string; id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchRoomData = async () => {
      let selectedRoom = roomTypes.find(r => r.id === id) || null;
      
      if (selectedRoom && branchId) {
        try {
          // Map URL id to DB type with multiple variations
          const roomIdVariations = [
            id,
            id?.replace(/-/g, ' '),
            id?.replace(/-/g, ''),
            id?.split('-')[0]
          ];
          
          let dbType = id;
          
          // Handle specific room type mappings
          if (id === 'deluxe-room' || id === 'deluxe') {
            dbType = 'deluxe';
          } else if (id === 'standard-room' || id === 'standard') {
            dbType = 'standard-room';
          } else if (id === 'superior-room' || id === 'superior') {
            dbType = 'superior-room';
          } else if (id === 'junior-suite' || id === 'junior') {
            dbType = 'junior-suite';
          } else if (id === 'executive-suite' || id === 'executive') {
            dbType = 'executive-suite';
          }

          const roomsRef = collection(db, "branches", branchId, "rooms");
          
          // Try to find the room using different variations
          let querySnapshot = null;
          
          // First try the direct mapping
          const q = query(roomsRef, where("type", "==", dbType));
          querySnapshot = await getDocs(q);
          
          // If not found, try other variations
          if (querySnapshot.empty) {
            for (const variation of roomIdVariations) {
              const qVar = query(roomsRef, where("type", "==", variation));
              const varSnapshot = await getDocs(qVar);
              if (!varSnapshot.empty) {
                querySnapshot = varSnapshot;
                console.log("RoomPage: Found room using variation:", variation);
                break;
              }
            }
          }

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            if (docData.pricePerNight) {
              selectedRoom = {
                ...selectedRoom,
                price: Number(docData.pricePerNight)
              };
              console.log("RoomPage: Updated room price:", selectedRoom.name, "->", `₦${Number(docData.pricePerNight).toLocaleString()}`);
            }
          } else {
            console.log("RoomPage: No room found in Firestore for type:", dbType, "or variations:", roomIdVariations);
          }
        } catch (error) {
          console.error("Error fetching room price:", error);
        }
      }

      setRoom(selectedRoom);
      setIsLoading(false);
    };

    fetchRoomData();
  }, [id, branchId]);

  // Device motion script for Panoee VR/AR functionality
  useEffect(() => {
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const iframe = document.getElementById("tour-embeded") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: "devicemotion",
          deviceMotionEvent: {
            acceleration: {
              x: e.acceleration?.x,
              y: e.acceleration?.y,
              z: e.acceleration?.z
            },
            accelerationIncludingGravity: {
              x: e.accelerationIncludingGravity?.x,
              y: e.accelerationIncludingGravity?.y,
              z: e.accelerationIncludingGravity?.z
            },
            rotationRate: {
              alpha: e.rotationRate?.alpha,
              beta: e.rotationRate?.beta,
              gamma: e.rotationRate?.gamma
            },
            interval: e.interval,
            timeStamp: e.timeStamp
          }
        }, "*");
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, []);

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
          <Button onClick={() => navigate('/book')} className="bg-gradient-to-r from-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-dark))] hover:from-[hsl(var(--royal-blue-dark))] hover:to-[hsl(var(--royal-blue))] text-white px-6 transition-all duration-300">
            Book Now
          </Button>
        </div>
      </nav>

      {/* 360° VR Room View */}
      <div className="relative w-full py-16 px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 2xl:px-40 bg-background">
        <div className="max-w-[100rem] mx-auto relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-[hsl(var(--royal-blue)/0.2)] via-[hsl(var(--royal-blue-light)/0.15)] to-[hsl(var(--royal-blue)/0.2)] rounded-3xl blur-3xl -z-10 group-hover:opacity-100 opacity-50 transition-all duration-700"></div>
          <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--royal-blue)/0.1)] via-[hsl(var(--royal-blue-light)/0.08)] to-[hsl(var(--royal-blue)/0.1)] rounded-3xl blur-xl -z-20 group-hover:opacity-100 opacity-30 transition-all duration-1000"></div>
          {/* Main container */}
          <div className="relative bg-[var(--gradient-card)] rounded-2xl p-2 shadow-2xl group border border-border/20">
            {/* Inner bezel */}
            <div className="relative overflow-hidden rounded-xl" style={{ paddingTop: '80vh', minHeight: '400px' }}>
              <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-xs text-primary/80 bg-black/40 px-2 py-1 rounded-full">Swipe to rotate view</div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 z-10 pointer-events-none" />
              {/* Frame */}
              <div className="absolute inset-0.5 rounded-xl border border-primary/30 shadow-inner pointer-events-none" />
              {/* Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60 rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60 rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60 rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60 rounded-br-lg z-10" />
              
              <iframe 
                width="100%" 
                height="640" 
                frameBorder="0" 
                allow="xr-spatial-tracking; gyroscope; accelerometer" 
                allowFullScreen 
                scrolling="no" 
                src={
                  room.id === 'standard-room' 
                    ? "https://kuula.co/share/collection/7Hmy2?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'superior-room'
                    ? "https://kuula.co/share/collection/7Hmyy?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'premium-standard-room'
                    ? "https://kuula.co/share/collection/7HmyS?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'premium-superior-room'
                    ? "https://kuula.co/share/collection/7HmyB?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'deluxe-room'
                    ? "https://kuula.co/share/collection/7Hmyt?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'premium-diplomatic-suite'
                    ? "https://kuula.co/share/collection/7Hmz7?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'ambassadorial-suite'
                    ? "https://kuula.co/share/collection/7Hmzh?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.id === 'presidential-suite'
                    ? "https://kuula.co/share/collection/7HmvD?logo=0&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                    : room.vrTourUrl || "https://kuula.co/share/collection/7HmvD?logo=0&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
                }
                className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary font-serif">
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
              <h2 className="text-3xl font-bold text-[hsl(var(--royal-blue))] mb-6 text-center">Description</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {room.longDescription || room.description}
              </p>
            </div>
            
            {/* Amenities */}
            <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-sm hover:shadow-glow transition-all duration-300">
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-background/30 rounded-xl border border-border/10 hover:border-primary/20 transition-all duration-300 group">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                      {amenityIcons[amenity] || <ShieldCheck className="h-5 w-5" />}
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
                <div className="text-4xl font-bold text-primary mb-1">₦{room.price?.toLocaleString()}</div>
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
              
              <Button onClick={() => navigate('/book')} className="w-full bg-gradient-to-r from-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-dark))] hover:from-[hsl(var(--royal-blue-dark))] hover:to-[hsl(var(--royal-blue))] text-white py-6 text-lg font-medium rounded-xl transition-all duration-500 hover:shadow-lg">
                Book Now
              </Button>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                You won't be charged yet
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/20">
                <h3 className="font-semibold text-xl text-foreground mb-6 text-center">Contact Information</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-background/50 rounded-xl border border-border/10 hover:border-[hsl(var(--royal-blue)/0.2)] transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-[hsl(var(--royal-blue)/0.1)] rounded-lg text-[hsl(var(--royal-blue))] flex-shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground mb-2">Phone</div>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">+234 905 777 7780</div>
                          <div className="font-medium text-sm">+234 905 777 7782</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-background/50 rounded-xl border border-border/10 hover:border-[hsl(var(--royal-blue)/0.2)] transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-[hsl(var(--royal-blue)/0.1)] rounded-lg text-[hsl(var(--royal-blue))] flex-shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground mb-2">Email</div>
                        <div className="font-medium text-sm break-all">reservations@goldentulipportharcourt.com</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-background/50 rounded-xl border border-border/10 hover:border-[hsl(var(--royal-blue)/0.2)] transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-[hsl(var(--royal-blue)/0.1)] rounded-lg text-[hsl(var(--royal-blue))] flex-shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground mb-2">Support</div>
                        <div className="font-medium text-sm">24/7 Customer Support</div>
                      </div>
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
