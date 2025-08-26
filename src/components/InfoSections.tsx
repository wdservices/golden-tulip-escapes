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
      <section id="dining" className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Dining Experiences
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Savor exceptional cuisine crafted by our world-class chefs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {diningOptions.map((option, index) => (
                <Card key={index} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          <Utensils className="h-5 w-5 mr-2 text-primary" />
                          {option.name}
                        </h3>
                        <p className="text-primary font-medium mb-1">{option.type}</p>
                        <p className="text-muted-foreground mb-2">{option.cuisine}</p>
                        <p className="text-sm text-muted-foreground">{option.hours}</p>
                      </div>
                      <Button variant="ghost" className="text-primary hover:text-primary">
                        View Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="relative">
              <img
                src={restaurant}
                alt="Restaurant"
                className="w-full h-96 object-cover rounded-2xl shadow-elegant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent rounded-2xl flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-semibold mb-2">Culinary Excellence</h3>
                  <p className="text-sm opacity-90">Experience world-class dining in elegant surroundings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spa & Wellness Section */}
      <section id="spa" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Spa & Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejuvenate your body and soul in our tranquil wellness sanctuary
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src={spa}
                alt="Spa"
                className="w-full h-96 object-cover rounded-2xl shadow-elegant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent rounded-2xl flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-semibold mb-2">Wellness Retreat</h3>
                  <p className="text-sm opacity-90">Find your perfect balance in our serene spa environment</p>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              {spaServices.map((service, index) => (
                <Card key={index} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 flex items-center">
                          <Waves className="h-5 w-5 mr-2 text-primary" />
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">{service.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{service.price}</div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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