import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Utensils, Waves, Calendar, Wifi, Car, Dumbbell, Shield } from "lucide-react";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
import spa from "@/assets/spa.jpg";

export const InfoSections = () => {
  const roomTypes = [
    {
      name: "Standard Room",
      price: "₦45,000",
      features: ["Queen-size bed", "City view", "Free Wi-Fi", "Air conditioning"],
      image: luxurySuite
    },
    {
      name: "Deluxe Room",
      price: "₦65,000",
      features: ["King-size bed", "Premium view", "Mini bar", "Work desk"],
      image: luxurySuite
    },
    {
      name: "Executive Suite",
      price: "₦95,000",
      features: ["Separate living area", "Premium amenities", "Concierge service", "Executive lounge access"],
      image: luxurySuite
    },
    {
      name: "Presidential Suite",
      price: "₦150,000",
      features: ["Luxury living space", "Personal butler", "Premium dining", "Private balcony"],
      image: luxurySuite
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
    { icon: Wifi, name: "Free High-Speed Wi-Fi", description: "Throughout the property" },
    { icon: Car, name: "Valet Parking", description: "Complimentary parking service" },
    { icon: Dumbbell, name: "Fitness Center", description: "24/7 access with modern equipment" },
    { icon: Shield, name: "24/7 Security", description: "Professional security services" },
    { icon: Waves, name: "Swimming Pool", description: "Outdoor pool with poolside service" },
    { icon: Calendar, name: "Event Spaces", description: "Conference rooms and banquet halls" }
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((room, index) => (
              <Card key={index} className="card-luxury group hover:shadow-glow transition-all duration-500">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                    {room.price}/night
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <Bed className="h-5 w-5 mr-2 text-primary" />
                    {room.name}
                  </h3>
                  <ul className="space-y-2 mb-4">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="btn-outline-luxury w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                
                <div className="mt-8 p-6 glass-card text-center">
                  <h4 className="text-lg font-semibold text-gradient-gold mb-3">
                    Complete Wellness Journey
                  </h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Combine multiple treatments for the ultimate relaxation experience
                  </p>
                  <Button className="btn-luxury">
                    Design Your Package
                  </Button>
                </div>
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Host memorable events in our elegant venues with professional event planning services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-luxury text-center">
              <CardContent className="p-8">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Corporate Events</h3>
                <p className="text-muted-foreground mb-4">Professional meeting rooms and conference facilities</p>
                <Button className="btn-outline-luxury">Learn More</Button>
              </CardContent>
            </Card>
            <Card className="card-luxury text-center">
              <CardContent className="p-8">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Weddings</h3>
                <p className="text-muted-foreground mb-4">Create magical moments in our beautiful venues</p>
                <Button className="btn-outline-luxury">Learn More</Button>
              </CardContent>
            </Card>
            <Card className="card-luxury text-center">
              <CardContent className="p-8">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Special Occasions</h3>
                <p className="text-muted-foreground mb-4">Celebrate life's special moments with us</p>
                <Button className="btn-outline-luxury">Learn More</Button>
              </CardContent>
            </Card>
          </div>
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
        </div>
      </section>
    </div>
  );
};