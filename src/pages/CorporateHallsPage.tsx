import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, Users, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useCorporateHalls } from '@/hooks/useCorporateHalls';

const CorporateHallsPage: React.FC = () => {
  const { halls: corporateHalls, loading, error } = useCorporateHalls();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeTab="" onTabChange={() => {}} />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading corporate halls...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && corporateHalls.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeTab="" onTabChange={() => {}} />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Halls</div>
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                        {hall.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center">
                            <Check className="h-3 w-3 mr-2 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to={`/corporate-halls/${hall.id}`}>
                      <Button 
                        className="w-full btn-luxury mt-auto"
                      >
                        View Details & Book
                      </Button>
                    </Link>
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
