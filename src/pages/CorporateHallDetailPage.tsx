import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Mic, 
  Monitor, 
  Camera
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Corporate halls data
const corporateHalls = [
  {
    id: "anioma-hall",
    name: "Anioma Hall",
    capacity: 500,
    priceRange: "₦150,000 - ₦300,000",
    description: "A grand hall perfect for large corporate events, conferences, and celebrations. Features state-of-the-art facilities and elegant décor.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage"],
    location: "Ground Floor, Main Building",
    size: "2,500 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "abuja-hall",
    name: "Abuja Hall",
    capacity: 300,
    priceRange: "₦100,000 - ₦200,000",
    description: "An elegant mid-sized hall ideal for corporate meetings, seminars, and private functions. Modern amenities with professional ambiance.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service"],
    location: "First Floor, East Wing",
    size: "1,800 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmv?logo=0&info=1&fs=1&vr=0&sd=1&autop=90&thumbs=1&autorotate=0.16"
  },
  {
    id: "lagos-hall",
    name: "Lagos Hall",
    capacity: 200,
    priceRange: "₦80,000 - ₦150,000",
    description: "A sophisticated smaller hall perfect for intimate corporate gatherings, board meetings, and executive events.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector"],
    location: "Second Floor, West Wing",
    size: "1,200 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7HpmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
  },
  {
    id: "kano-hall",
    name: "Kano Hall",
    capacity: 150,
    priceRange: "₦60,000 - ₦120,000",
    description: "A cozy and professional space designed for small to medium corporate events, training sessions, and workshops.",
    features: ["Air Conditioning", "Free WiFi", "Sound System", "Projector"],
    location: "First Floor, Central Wing",
    size: "900 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmq?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
  },
  {
    id: "port-harcourt-hall",
    name: "Port Harcourt Hall",
    capacity: 400,
    priceRange: "₦120,000 - ₦250,000",
    description: "A versatile large hall suitable for conferences, product launches, and major corporate celebrations with premium facilities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage", "VIP Lounge"],
    location: "Ground Floor, South Wing",
    size: "2,200 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "kaduna-hall",
    name: "Kaduna Hall",
    capacity: 250,
    priceRange: "₦90,000 - ₦180,000",
    description: "A modern hall with flexible seating arrangements, perfect for corporate training, seminars, and medium-sized events.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service"],
    location: "Second Floor, North Wing",
    size: "1,500 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "rivers-hall-boardroom",
    name: "Rivers Hall - Boardroom",
    capacity: 25,
    priceRange: "₦400,000 per day",
    description: "An executive boardroom designed for high-level discussions and strategic planning with premium amenities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service", "Executive Seating"],
    location: "Executive Floor, Premium Wing",
    size: "800 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpm9?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
  },
  {
    id: "the-pavilion-event-centre",
    name: "The Pavilion/ Event Centre",
    capacity: 300,
    priceRange: "₦3,000,000 per day",
    description: "Our largest venue, suitable for grand corporate events, exhibitions, and large-scale conferences with world-class facilities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage", "VIP Lounge", "Exhibition Space", "Multiple Breakout Rooms"],
    location: "Ground Floor, Grand Wing",
    size: "5,000 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "rivers-hall-boardroom",
    name: "Rivers Hall - Boardroom",
    capacity: 25,
    priceRange: "₦400,000 per day",
    description: "An executive boardroom designed for high-level discussions and strategic planning. Features premium furnishings and advanced technology.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Executive Seating", "Conference Phone"],
    location: "Executive Floor, North Tower",
    size: "800 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "the-marquee",
    name: "The Marquee",
    capacity: 100,
    priceRange: "₦500,000 per day",
    description: "A flexible outdoor/indoor space, perfect for corporate receptions and product launches. Features elegant tent-style architecture with modern amenities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Outdoor Access", "Garden View"],
    location: "Garden Terrace, West Wing",
    size: "3,000 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.16"
  },
  {
    id: "the-pavilion-event-centre",
    name: "The Pavilion/ Event Centre",
    capacity: 300,
    priceRange: "₦3,000,000 per day",
    description: "Our largest venue, suitable for grand corporate events, exhibitions, and large-scale conferences. Features premium facilities and elegant design.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage", "VIP Lounge", "Exhibition Space", "Multiple Breakout Rooms"],
    location: "Main Event Complex, Central Building",
    size: "8,000 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7l5Kb?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1&chromeless=0&autorotate=0.53"
  }
];

const getFeatureIcon = (feature: string) => {
  switch (feature.toLowerCase()) {
    case 'free wifi':
    case 'wifi':
      return <Wifi className="h-4 w-4" />;
    case 'parking':
      return <Car className="h-4 w-4" />;
    case 'catering service':
      return <Utensils className="h-4 w-4" />;
    case 'sound system':
      return <Mic className="h-4 w-4" />;
    case 'projector':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Coffee className="h-4 w-4" />;
  }
};

export const CorporateHallDetailPage = () => {
  const { hallId } = useParams<{ hallId: string }>();
  const [activeTab, setActiveTab] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const hall = corporateHalls.find(h => h.id === hallId);
  
  if (!hall) {
    return <Navigate to="/corporate-halls" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Hero Section with 360° Tour */}
      <section className="relative h-[75vh] min-h-[600px] overflow-hidden bg-gray-900">
        <div className="relative w-full h-full">
          {/* Loading placeholder */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading 360° Virtual Tour...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={hall.kuulaEmbedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="vr,gyroscope,accelerometer,fullscreen"
            scrolling="no"
            className="w-full h-full"
            title={`${hall.name} 360° Virtual Tour`}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 text-white bg-gradient-to-t from-black/70 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{hall.name}</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
              {hall.description}
            </p>
          </div>
        </div>
      </section>

      {/* Hall Details */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Hall Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Capacity:</span>
                      <span className="font-semibold">{hall.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="font-semibold">{hall.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Size:</span>
                      <span className="font-semibold">{hall.size}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {hall.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hall.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 p-2">
                        {getFeatureIcon(feature)}
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Booking
                  </CardTitle>
                  <CardDescription>
                    Book this hall for your next event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {hall.priceRange}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Per event (pricing varies by duration and services)
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Capacity:</span>
                      <span className="font-semibold">{hall.capacity} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Size:</span>
                      <span className="font-semibold">{hall.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Location:</span>
                      <span className="font-semibold text-right">{hall.location}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Book This Hall
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    View 360° Tour
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};