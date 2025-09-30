import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Utensils, Waves, Calendar, Globe, Car, Dumbbell, Shield, Coffee, Tv, ShowerHead, Refrigerator, Clock } from "lucide-react";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
import spa from "@/assets/spa.jpg";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";
import { roomTypes } from '@/data/rooms';

// Event data
const eventTypes = [
  {
    id: "corporate",
    title: "Corporate Events",
    description: "The Golden Tulip Port Harcourt Hotel is a perfect location to organize private business meetings, trainings, lectures, seminars, interviews, product launches, or for family gatherings and dinners.",
    threeSixtyImages: [
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg"
    ],
    venues: [
      {
        name: "Anioma Hall",
        capacity: "100 - 200 guests",
        priceRange: "From ₦1,000,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "Abuja Hall",
        capacity: "80 - 150 guests",
        priceRange: "From ₦750,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "Lagos Hall",
        capacity: "30 - 40 guests",
        priceRange: "From ₦400,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "Rivers Hall - Boardroom",
        capacity: "18 - 25 guests",
        priceRange: "From ₦400,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "Kano Hall",
        capacity: "18 - 25 guests",
        priceRange: "From ₦300,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "The Marquee",
        capacity: "40 - 100 guests",
        priceRange: "From ₦500,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      },
      {
        name: "The Pavilion/ Event Centre",
        capacity: "100 - 300 guests",
        priceRange: "From ₦3,000,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts"
        ]
      }
    ],
    features: [
      "Professional meeting rooms",
      "Conference facilities",
      "Catering services",
      "Audio/Visual equipment"
    ],
    capacity: "18 - 300 guests",
    includes: [
      "Dedicated event coordinator",
      "High-speed Wi-Fi",
      "Projector & screen",
      "Microphone & sound system",
      "Whiteboard & flip charts"
    ],
    priceRange: "From ₦300,000 per day"
  },
  {
    id: "weddings",
    title: "Weddings",
    description: "Create magical moments in our beautiful venues, with expert wedding planners to bring your dream wedding to life.",
    threeSixtyImages: [
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg"
    ],
    features: [
      "Elegant ballrooms",
      "Outdoor ceremony spaces",
      "Bridal suite",
      "Custom catering menus"
    ],
    capacity: "50 - 300 guests",
    includes: [
      "Wedding planning services",
      "Decor and setup",
      "Cake and catering",
      "Accommodation packages",
      "Day-of coordination"
    ],
    priceRange: "Custom packages available"
  },
  {
    id: "special-occasions",
    title: "Special Occasions",
    description: "Celebrate life's special moments with us, from birthdays to anniversaries and everything in between.",
    threeSixtyImages: [
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg",
      "/images/hotel-360-preview.jpg"
    ],
    features: [
      "Custom decoration",
      "Themed events",
      "Entertainment options",
      "Custom menu planning"
    ],
    capacity: "10 - 200 guests",
    includes: [
      "Room setup and cleanup",
      "Audiovisual equipment",
      "Dedicated service staff",
      "Cake and dessert options"
    ],
    priceRange: "Custom packages available"
  }
];

export const InfoSections = () => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState<boolean>(false);
  const [showAllSpaServices, setShowAllSpaServices] = useState(false);
  
  const handleOpenDialog = (event: any) => {
    if (event.id === "corporate") {
      window.location.href = `/corporate-halls`;
    } else {
      setSelectedEvent(event.id);
    }
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };


  const diningOptions = [
    {
      name: "The Golden Terrace",
      type: "Fine Dining Restaurant",
      cuisine: "International & Nigerian Cuisine",
      hours: "6:00 AM - 11:00 PM"
    },
    {
      name: "Tulip Lounge",
      type: "Bar & Lounge",
      cuisine: "Cocktails & Light Bites",
      hours: "5:00 PM - 2:00 AM"
    },
    {
      name: "Room Service",
      type: "24/7 Service",
      cuisine: "Full Menu Available",
      hours: "24 Hours"
    }
  ];

  const spaServices = [
    {
      name: "Massage Therapy",
      duration: "Available on request",
      price: "Available on request"
    },
    {
      name: "Body Treatment",
      duration: "Available on request",
      price: "Available on request"
    },
    {
      name: "Facial Treatment",
      duration: "Available on request",
      price: "Available on request"
    },
    {
      name: "Body Wax",
      duration: "Available on request",
      price: "Available on request"
    }
  ];

  const amenities = [
    { icon: Globe, name: "Free High-Speed Wi-Fi", description: "Throughout the property" },
    { icon: Car, name: "Valet Parking", description: "Complimentary parking service" },
    { icon: Dumbbell, name: "Fitness Center", description: "24/7 access with modern equipment" },
    { icon: Shield, name: "24/7 Security", description: "Professional security services" },
    { icon: Waves, name: "Swimming Pool", description: "Outdoor pool with poolside service" },
    { icon: Calendar, name: "Event Spaces", description: "Conference rooms and banquet halls" }
  ];

  const allAmenities = [
    "Free High-Speed Wi-Fi (Throughout the property)",
    "Swimming Pool (Outdoor pool with poolside service)",
    "Fitness Center (24/7 access with modern equipment)",
    "Spa & Wellness Center (Massage, facials, and body treatments)",
    "Restaurant & Bar (International and local cuisine)",
    "Conference Rooms (Fully equipped for business meetings)",
    "Business Center (Printing, copying, and secretarial services)",
    "24/7 Front Desk",
    "Airport Shuttle (Available on request)",
    "Valet Parking (Complimentary parking service)",
    "Secure Parking",
    "Room Service (24-hour service)",
    "Laundry & Dry Cleaning (Same-day service available)",
    "24/7 Security (Professional security services)",
    "Concierge Service (Tour arrangements and local recommendations)",
    "Car Rental",
    "Safe-in room",
    "Awakening calls on request",
    "Installations for people with disabilities"
  ];
  
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  return (
    <div className="space-y-16">
      {/* Rooms & Suites Section */}
      <section id="rooms" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-golden-yellow drop-shadow-lg">
              Rooms & Suites
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Discover our carefully designed accommodations that blend comfort with luxury
            </p>
          </div>

          <div>
            {/* Room cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roomTypes.map((room, index) => (
                <Link to={`/rooms/${room.id}`} key={index} className="block h-full">
                  <Card className="brand-card group hover-golden transition-all duration-500 h-full flex flex-col">
                    <div className="relative overflow-hidden rounded-t-2xl flex-grow">
                      <img
                        src={luxurySuite}
                        alt={room.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-2xl font-bold text-golden-yellow mb-2">₦{room.price.toLocaleString()}<span className="text-sm font-normal text-foreground/60">/night</span></div>
                      <h3 className="text-xl font-semibold mb-3 text-foreground">
                        {room.name}
                      </h3>
                      <ul className="space-y-2 mb-6 flex-grow">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <li key={idx} className="text-sm text-foreground/70 flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-golden-yellow mt-2 mr-2 flex-shrink-0"></span>
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="brand-button w-full mt-4">
                        View Details
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Artistry Section */}
      <section id="dining" className="py-20 bg-gradient-to-b from-background to-royal-blue/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Dining Options
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Discover exceptional culinary experiences crafted by our award-winning chefs
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="brand-card rounded-2xl p-6 md:p-8 shadow-lg hover-golden transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Anioma Restaurant - Now smaller and integrated */}
                <div className="lg:col-span-2">
                  <div className="flex items-center mb-4">
                    <Utensils className="h-8 w-8 text-golden-yellow mr-3" />
                    <h3 className="text-2xl font-bold text-foreground">Anioma Restaurant</h3>
                  </div>
                  <p className="text-foreground/80 mb-4 leading-relaxed">
                    Experience authentic Nigerian cuisine with a modern twist. Our signature dishes celebrate local flavors while incorporating international culinary techniques.
                  </p>
                  <div className="flex items-center text-sm text-foreground/70 mb-4">
                    <Clock className="h-4 w-4 mr-2 text-golden-yellow" />
                    <span>Open: 6:00 AM - 11:00 PM daily</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-royal-blue">Breakfast:</span>
                      <p className="text-foreground/70">6:00 AM - 10:30 AM</p>
                    </div>
                    <div>
                      <span className="font-semibold text-royal-blue">Lunch:</span>
                      <p className="text-foreground/70">12:00 PM - 3:00 PM</p>
                    </div>
                    <div>
                      <span className="font-semibold text-royal-blue">Dinner:</span>
                      <p className="text-foreground/70">6:00 PM - 11:00 PM</p>
                    </div>
                    <div>
                      <span className="font-semibold text-royal-blue">Room Service:</span>
                      <p className="text-foreground/70">24/7 Available</p>
                    </div>
                  </div>
                </div>

                {/* Bubbles Bar & Room Service - Now integrated into the main card */}
                <div className="space-y-4">
                  {/* Bubbles Bar */}
                  <div className="brand-card hover-golden rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-golden-yellow/20 to-golden-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-serif font-bold text-golden-yellow mb-1">
                          Bubbles Bar
                        </h3>
                        <p className="text-xs font-semibold text-royal-blue mb-1">Bar & Lounge</p>
                        <p className="text-xs text-foreground/80 mb-1">
                          Cocktails, mocktails & finger foods in a cozy environment.
                        </p>
                        <p className="text-xs text-foreground/70">Hours: 24hrs</p>
                      </div>
                    </div>
                  </div>

                  {/* Room Service */}
                  <div className="brand-card hover-golden rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-golden-yellow/20 to-golden-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-serif font-bold text-golden-yellow mb-1">
                          Room Service
                        </h3>
                        <p className="text-xs text-foreground/80 mb-1">
                          À la carte menu available 24/7 for continental & African dishes.
                        </p>
                        <p className="text-xs text-foreground/70">Available: 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spa & Wellness Section */}
      <section id="spa" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-royal-blue/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Sanctuary of Serenity
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Discover inner harmony through our transformative wellness experiences
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Spa Image Section */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-3xl h-[500px]">
                  <img
                    src={spa}
                    alt="Luxury Spa Experience"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-serif font-bold text-gradient-gold-light mb-3">
                      Wellness Sanctuary
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Immerse yourself in tranquility where ancient healing traditions meet modern luxury
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-golden-yellow/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-royal-blue/10 rounded-full blur-2xl"></div>
              </div>

              {/* Spa Services Section */}
              <div className="space-y-4">
                {(showAllSpaServices ? spaServices : spaServices.slice(0, 2)).map((service, index) => (
                  <div key={index} className="brand-card hover-golden group">
                    <div className="flex items-start justify-between p-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-royal-blue/10 rounded-lg flex items-center justify-center mr-3">
                            <Waves className="h-4 w-4 text-golden-yellow" />
                          </div>
                          <h3 className="text-xl font-serif font-semibold text-golden-yellow">
                            {service.name}
                          </h3>
                        </div>
                        <p className="text-foreground/80 text-sm mb-3 leading-relaxed">
                          {service.name === "Massage Therapy" && "Indulge in a bespoke full-body massage that blends expert touch with the finest oils and techniques. Each session is a personalized escape designed to melt away tension, stimulate circulation, and restore inner harmony in a serene, upscale setting."}
                          {service.name === "Body Treatment" && "Elevate your wellness with our signature body treatment—a decadent experience that combines exfoliation, and nourishing hydration. Designed to detoxify, tone, and revitalize from head to toe in an ambiance of refined elegance."}
                          {service.name === "Facial Treatment" && "Immerse yourself in luxurious facials designed to address specific dermatological concerns, including acne, dehydration, and aging. Utilizing medical-grade products and advanced techniques, this treatment promotes optimal skin health and visible improvement."}
                          {service.name === "Body Wax" && "Experience silky-smooth skin with our premium waxing service, using the finest waxes and soothing care treatments. Delivered in a plush, private environment for ultimate comfort and confidence."}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-golden-yellow">{service.price}</div>
                          <Button size="sm" className="brand-button opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Reserve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!showAllSpaServices && spaServices.length > 2 && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={() => setShowAllSpaServices(true)} 
                      className="brand-button"
                    >
                      View More Services
                    </Button>
                  </div>
                )}
                
                {showAllSpaServices && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={() => setShowAllSpaServices(false)} 
                      className="brand-button-outline"
                    >
                      Show Less
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 bg-gradient-to-br from-royal-blue/5 to-royal-blue/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-golden-yellow drop-shadow-lg">
              Events & Conferences
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              The Golden Tulip Port Harcourt Hotel is a perfect location to organize private business meetings, trainings, lectures, seminars, interviews, product launches, or for family gatherings and dinners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(showAllEvents ? eventTypes : eventTypes.slice(0, 3)).map((event, index) => (
              <Card key={index} className="brand-card hover-golden transition-all duration-500 h-full flex flex-col">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Calendar className="h-16 w-16 text-golden-yellow mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-golden-yellow mb-2 drop-shadow-sm">{event.title}</h3>
                  <p className="text-foreground/80 text-sm mb-4 flex-grow">{event.description}</p>
                  <Button onClick={() => handleOpenDialog(event)} className="brand-button w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {!showAllEvents && eventTypes.length > 3 && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => setShowAllEvents(true)} 
                className="brand-button"
              >
                View All Events
              </Button>
            </div>
          )}
          
          {showAllEvents && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => setShowAllEvents(false)} 
                className="brand-button-outline"
              >
                Show Less
              </Button>
            </div>
          )}
          
          {/* Event Details Dialog */}
          <EventDetailsDialog 
            isOpen={!!selectedEvent}
            onClose={handleCloseDialog}
            event={eventTypes.find(e => e.id === selectedEvent) || null}
          />
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-golden-yellow drop-shadow-lg">
              Hotel Amenities
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Enjoy world-class facilities and services designed for your comfort
            </p>
          </div>

          {!showAllAmenities ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenities.map((amenity, index) => (
                  <Card key={index} className="brand-card hover-golden transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <amenity.icon className="h-12 w-12 text-golden-yellow mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{amenity.name}</h3>
                      <p className="text-foreground/70 text-sm">{amenity.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button 
                  onClick={() => setShowAllAmenities(true)} 
                  className="brand-button"
                >
                  View All Amenities
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAmenities.map((amenity, index) => (
                  <Card key={index} className="brand-card hover-golden transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 flex items-center justify-center mx-auto mb-4">
                        <div className="w-3 h-3 rounded-full bg-golden-yellow"></div>
                      </div>
                      <p className="text-center text-foreground/80">{amenity}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button 
                  onClick={() => setShowAllAmenities(false)} 
                  className="brand-button"
                >
                  Show Less
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Hotel Information Section */}
      <section id="info" className="py-20 bg-gradient-to-b from-royal-blue/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Essential Information
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know for a seamless stay
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Operating Hours */}
            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-golden-yellow/20 to-golden-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="h-10 w-10 text-golden-yellow drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-golden-yellow mb-3 drop-shadow-sm">Operating Hours</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-golden-yellow to-royal-blue mx-auto rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Check-in</span>
                    <span className="font-bold text-royal-blue text-lg">2:00 PM</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Check-out</span>
                    <span className="font-bold text-royal-blue text-lg">12:00 PM</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Front Desk</span>
                    <span className="font-bold text-royal-blue text-lg">24/7</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Restaurant</span>
                    <span className="font-bold text-royal-blue text-sm">6:00 AM - 10:00 PM</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Bar</span>
                    <span className="font-bold text-royal-blue text-lg">24 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-golden-yellow/20 to-golden-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="h-10 w-10 text-golden-yellow drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-golden-yellow mb-3 drop-shadow-sm">Payment Methods</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-golden-yellow to-royal-blue mx-auto rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-golden-yellow to-royal-blue rounded-full shadow-sm"></div>
                    <span className="text-foreground/80 font-medium">Cash (NGN, USD)</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-golden-yellow to-royal-blue rounded-full shadow-sm"></div>
                    <span className="text-foreground/80 font-medium">Credit/Debit Cards</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-golden-yellow to-royal-blue rounded-full shadow-sm"></div>
                    <span className="text-foreground/80 font-medium">Bank Transfer</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-golden-yellow/10 to-royal-blue/10 rounded-lg p-4 border border-golden-yellow/20 mt-6">
                  <div className="text-center">
                    <span className="font-bold text-royal-blue text-sm">Accepted Cards:</span>
                    <div className="mt-2 flex justify-center space-x-2 text-xs font-medium text-foreground/70">
                      <span className="bg-white/70 px-2 py-1 rounded">Visa</span>
                      <span className="bg-white/70 px-2 py-1 rounded">Mastercard</span>
                      <span className="bg-white/70 px-2 py-1 rounded">Verve</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-golden-yellow/20 to-golden-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="h-10 w-10 text-golden-yellow drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-golden-yellow mb-3 drop-shadow-sm">Policies</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-golden-yellow to-royal-blue mx-auto rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Cancellation</span>
                    <span className="font-bold text-royal-blue text-sm bg-royal-blue/10 px-3 py-1 rounded-full">24 hours prior</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Children</span>
                    <span className="font-bold text-royal-blue text-sm bg-royal-blue/10 px-3 py-1 rounded-full">Under 12 stay free</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Pets</span>
                    <span className="font-bold text-royal-blue text-sm bg-royal-blue/10 px-3 py-1 rounded-full">Not allowed</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">Smoking</span>
                    <span className="font-bold text-royal-blue text-sm bg-royal-blue/10 px-3 py-1 rounded-full">Designated areas</span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-4 border border-golden-yellow/10 hover:bg-golden-yellow/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 font-medium">ID Required</span>
                    <span className="font-bold text-royal-blue text-sm bg-royal-blue/10 px-3 py-1 rounded-full">Valid photo ID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};