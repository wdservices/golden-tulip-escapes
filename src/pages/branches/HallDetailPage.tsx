import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, CheckCircle, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { getBranchById } from '@/services/branchService';
import { Panorama360Viewer } from '@/components/ui/Panorama360Viewer';

export const HallDetailPage: React.FC = () => {
  const { branchId, hallId } = useParams<{ branchId: string; hallId: string }>();
  
  const branch = branchId ? getBranchById(branchId) : null;
  const hall = branch?.events?.find(event => 
    event.type.toLowerCase().replace(/\s+/g, '-') === hallId
  );

  if (!branch || !hall) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeTab="" onTabChange={() => {}} />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Hall Not Found</h1>
            <p className="text-muted-foreground mb-8">The requested hall could not be found.</p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="" onTabChange={() => {}} />
      
      <main className="pt-20">
        {/* Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to={`/branch/${branchId}`} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {branch.name}
            </Link>
          </Button>
        </div>

        {/* Hero Section with 360 Viewer */}
        <section className="relative h-[75vh] min-h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <Panorama360Viewer 
              imageUrl="/images/360/hall-360.jpg"
              autoRotate={true}
              rotationSpeed={0.05}
            />
          </div>
          <div className="absolute inset-0 bg-black/30 flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                  {hall.type}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/90">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{hall.capacity}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>{hall.priceRange}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{branch.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hall Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Features */}
                <Card className="card-luxury">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-gradient-gold">
                      Hall Features & Amenities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hall.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* About the Venue */}
                <Card className="card-luxury">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-gradient-gold">
                      About {hall.type}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {hall.type === 'Lady Chinenye Hall' 
                        ? 'Our premier corporate event space, Lady Chinenye Hall offers an elegant and professional environment perfect for large-scale conferences, seminars, and corporate gatherings. With state-of-the-art facilities and exceptional service, this venue ensures your event will be memorable and successful.'
                        : 'Delta Hall provides an intimate setting ideal for smaller meetings, workshops, and presentations. This versatile space combines modern technology with comfortable amenities to create the perfect environment for productive business discussions and training sessions.'
                      }
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold mb-1">Capacity</h3>
                        <p className="text-sm text-muted-foreground">{hall.capacity}</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold mb-1">Starting Price</h3>
                        <p className="text-sm text-muted-foreground">{hall.priceRange}</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold mb-1">Availability</h3>
                        <p className="text-sm text-muted-foreground">7 Days a Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Card */}
                <Card className="card-luxury">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-4 text-gradient-gold">
                      Book This Hall
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Starting from</span>
                        <span className="text-2xl font-bold text-primary">{hall.priceRange}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-semibold">{hall.capacity}</span>
                      </div>
                    </div>
                    <Button className="w-full btn-luxury mb-4">
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Request Quote
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="card-luxury">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-4 text-gradient-gold">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <p className="font-semibold">{branch.phone}</p>
                          <p className="text-sm text-muted-foreground">Call for bookings</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <p className="font-semibold">{branch.email}</p>
                          <p className="text-sm text-muted-foreground">Email inquiries</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
                        <div>
                          <p className="font-semibold">{branch.location}</p>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card className="card-luxury">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-4 text-gradient-gold">
                      Operating Hours
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(branch.operatingHours || {}).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize text-muted-foreground">{day}</span>
                          <span className="font-medium">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HallDetailPage;