import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, Users, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';

const corporateHalls = [
  {
    id: "anioma-hall",
    name: "Anioma Hall",
    capacity: "100 - 200 guests",
    priceRange: "From ₦1,000,000 per day",
    description: "A spacious hall perfect for large corporate gatherings and conferences.",
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
    id: "abuja-hall",
    name: "Abuja Hall",
    capacity: "80 - 150 guests",
    priceRange: "From ₦750,000 per day",
    description: "Ideal for medium-sized seminars and workshops, offering a comfortable and productive environment.",
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
    id: "lagos-hall",
    name: "Lagos Hall",
    capacity: "30 - 40 guests",
    priceRange: "From ₦400,000 per day",
    description: "A versatile space suitable for intimate business meetings and training sessions.",
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
    id: "rivers-hall-boardroom",
    name: "Rivers Hall - Boardroom",
    capacity: "18 - 25 guests",
    priceRange: "From ₦400,000 per day",
    description: "An executive boardroom designed for high-level discussions and strategic planning.",
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
    id: "kano-hall",
    name: "Kano Hall",
    capacity: "18 - 25 guests",
    priceRange: "From ₦300,000 per day",
    description: "A compact yet functional hall for smaller meetings and presentations.",
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
    id: "the-marquee",
    name: "The Marquee",
    capacity: "40 - 100 guests",
    priceRange: "From ₦500,000 per day",
    description: "A flexible outdoor/indoor space, perfect for corporate receptions and product launches.",
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
    id: "the-pavilion-event-centre",
    name: "The Pavilion/ Event Centre",
    capacity: "100 - 300 guests",
    priceRange: "From ₦3,000,000 per day",
    description: "Our largest venue, suitable for grand corporate events, exhibitions, and large-scale conferences.",
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
];

const CorporateHallsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="" onTabChange={() => {}} />
      
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
                Corporate Event Halls
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover our premium venues designed for corporate excellence. From intimate board meetings to grand conferences, 
                we provide the perfect setting for your business events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {corporateHalls.map((hall, index) => (
                <Card 
                  key={index} 
                  className="card-luxury group hover:shadow-glow transition-all duration-300 h-full flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-2xl font-serif font-bold text-gradient-gold mb-3">
                        {hall.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-primary font-semibold">Capacity:</span>
                          <span className="ml-2 text-muted-foreground">{hall.capacity}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-primary font-semibold">Price:</span>
                          <span className="ml-2 text-muted-foreground">{hall.priceRange}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4 flex-grow">
                      <h4 className="font-semibold text-gradient-gold mb-3">Features</h4>
                      <ul className="space-y-2">
                        {hall.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center">
                            <Check className="h-3 w-3 mr-2 text-primary" />
                            {feature}
                          </li>
                        ))}
                        {hall.features.length > 4 && (
                          <li className="text-sm text-muted-foreground/70 italic">
                            +{hall.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button 
                      className="w-full btn-luxury mt-auto"
                    >
                      Book This Venue
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CorporateHallsPage;