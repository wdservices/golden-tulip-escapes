import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Utensils, Waves, Calendar, Globe, Car, Dumbbell, Shield, Coffee, Tv, ShowerHead, Refrigerator } from "lucide-react";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
import spa from "@/assets/spa.jpg";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";

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
  // Import room types from the rooms data file
  const roomTypes = [
    {
      id: 'standard-room',
      name: 'Standard Room',
      price: '₦108,450',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Affordable comfort with modern amenities perfect for business and leisure travelers in Port Harcourt.',
      longDescription: 'Our Standard Rooms offer a perfect blend of comfort and style. Featuring a king-size bed, modern furnishings, and city views, these rooms are designed for your ultimate relaxation. The en-suite bathroom includes premium toiletries and a rain shower.'
    },
    {
      id: 'superior-room',
      name: 'Superior Room',
      price: '₦121,860',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Spacious design with upgraded features, blending elegance and convenience for a relaxing stay.',
      longDescription: 'The Superior Room offers a spacious design with upgraded features, perfect for both work and relaxation. Enjoy city views, a king-size bed with premium linens, and a luxurious bathroom with a rain shower. The room also features a work desk and a comfortable seating area.'
    },
    {
      id: 'premium-standard-room',
      name: 'Premium Standard Room',
      price: '₦122,940',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value.',
      longDescription: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value. Our Premium Standard Rooms feature a king-size bed, city views, and modern amenities to ensure a comfortable and productive stay.'
    },
    {
      id: 'premium-superior-room',
      name: 'Premium Superior Room',
      price: '₦139,230',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays.',
      longDescription: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays. Our Premium Superior Rooms offer a king-size bed, city views, and premium amenities to ensure a comfortable and enjoyable stay.'
    },
    {
      id: 'deluxe-room',
      name: 'Deluxe',
      price: '₦177,480',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class.',
      longDescription: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class. Our Deluxe Rooms feature a king-size bed, city views, and premium amenities to ensure a luxurious and comfortable stay.'
    },
    {
      id: 'premium-diplomatic-suite',
      name: 'Premium Diplomatic Suite',
      price: '₦245,070',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests.',
      longDescription: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests. Our Premium Diplomatic Suite features a king-size bed, city views, separate living room area, and office space to ensure a productive and comfortable stay.'
    },
    {
      id: 'ambassadorial-suite',
      name: 'Ambassadorial Suite',
      price: '₦354,150',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers.',
      longDescription: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers. Our Ambassadorial Suite features a king-size bed, city views, separate living area, and office space to ensure a luxurious and comfortable stay.'
    },
    {
      id: 'presidential-suite',
      name: 'Presidential Suite',
      price: '₦520,650',
      features: ['King-size bed', 'City view', 'Free Wi-Fi', 'Concierge services'],
      image: luxurySuite,
      description: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays.',
      longDescription: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays. Our Presidential Suite features a king-size bed, city views, luxury living space, and office space to ensure an unforgettable and comfortable stay.'
    }
  ];

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
      name: "Relaxation Massage",
      duration: "60 minutes",
      price: "₦25,000"
    },
    {
      name: "Deep Tissue Massage",
      duration: "90 minutes",
      price: "₦35,000"
    },
    {
      name: "Couples Spa Package",
      duration: "120 minutes",
      price: "₦60,000"
    },
    {
      name: "Full Day Wellness",
      duration: "6 hours",
      price: "₦85,000"
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
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Rooms & Suites
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully designed accommodations that blend comfort with luxury
            </p>
          </div>

          <div>
            {/* Room cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roomTypes.map((room, index) => (
                <Link to={`/rooms/${room.id}`} key={index} className="block h-full">
                  <Card className="card-luxury group hover:shadow-glow transition-all duration-500 h-full flex flex-col">
                    <div className="relative overflow-hidden rounded-t-2xl flex-grow">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-2xl font-bold text-primary mb-2">{room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></div>
                      <h3 className="text-xl font-semibold mb-3">
                        {room.name}
                      </h3>
                      <ul className="space-y-2 mb-6 flex-grow">
                        {room.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4">
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

      {/* Dining Section */}
      <section id="dining" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-gradient-gold">
              Culinary Artistry
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Embark on an extraordinary gastronomic journey crafted by world-renowned chefs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {diningOptions.map((option, index) => (
              <div key={index} className="dining-experience-card group">
                <div className="relative overflow-hidden rounded-2xl h-64 mb-6">
                  <img
                    src={restaurant}
                    alt={option.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="glass-badge">
                      <Utensils className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-serif font-bold text-gradient-gold-light mb-2">
                      {option.name}
                    </h3>
                    <p className="text-primary/90 font-medium text-sm mb-1">{option.type}</p>
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-muted-foreground mb-3 text-sm">{option.cuisine}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/70">{option.hours}</span>
                    <Button size="sm" className="btn-luxury-sm">
                      Explore Menu
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-4 bg-black/30 backdrop-blur-lg border border-primary/20 rounded-full px-8 py-4">
              <span className="text-gradient-gold font-semibold">Reserve Your Table</span>
              <Button className="btn-luxury">
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Spa & Wellness Section */}
      <section id="spa" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-gradient-gold">
              Sanctuary of Serenity
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              </div>

              {/* Spa Services Section */}
              <div className="space-y-4">
                {spaServices.map((service, index) => (
                  <div key={index} className="spa-service-card group">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="glass-badge mr-3">
                            <Waves className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-xl font-serif font-semibold text-gradient-gold-light">
                            {service.name}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{service.duration}</p>
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-primary">{service.price}</div>
                          <Button size="sm" className="btn-luxury-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Reserve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Events & Conferences
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The Golden Tulip Port Harcourt Hotel is a perfect location to organize private business meetings, trainings, lectures, seminars, interviews, product launches, or for family gatherings and dinners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(showAllEvents ? eventTypes : eventTypes.slice(0, 3)).map((event, index) => (
              <Card key={index} className="card-luxury group transition-all duration-500 h-full flex flex-col">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Calendar className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-gradient-gold mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">{event.description}</p>
                  <Button onClick={() => handleOpenDialog(event)} className="btn-luxury w-full">
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
                className="btn-luxury"
              >
                View All Events
              </Button>
            </div>
          )}
          
          {showAllEvents && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => setShowAllEvents(false)} 
                className="btn-outline-luxury"
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
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Hotel Amenities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enjoy world-class facilities and services designed for your comfort
            </p>
          </div>

          {!showAllAmenities ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenities.map((amenity, index) => (
                  <Card key={index} className="card-luxury group hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <amenity.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-lg font-semibold mb-2">{amenity.name}</h3>
                      <p className="text-muted-foreground text-sm">{amenity.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button 
                  onClick={() => setShowAllAmenities(true)} 
                  className="btn-luxury"
                >
                  View All Amenities
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAmenities.map((amenity, index) => (
                  <Card key={index} className="card-luxury group hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 flex items-center justify-center mx-auto mb-4">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      </div>
                      <p className="text-center">{amenity}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button 
                  onClick={() => setShowAllAmenities(false)} 
                  className="btn-luxury"
                >
                  Show Less
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};