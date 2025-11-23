import { Sparkles, Clock, DollarSign, Star } from "lucide-react";

interface SpaService {
  name: string;
  duration: string;
  price: string;
  description: string;
}

interface BranchSpaProps {
  spaServices?: SpaService[];
}

export const BranchSpa = ({ spaServices }: BranchSpaProps) => {
  if (!spaServices || spaServices.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/10 to-background" id="spa">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-4xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Spa & Wellness
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Rejuvenate your body and mind with our premium spa treatments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {spaServices.map((service, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-glow transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Header with icon and name */}
                <div className="flex items-center mb-6">
                  <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                  </div>
                </div>
                
                {/* Service details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center bg-muted p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Duration</p>
                      <p className="text-foreground font-medium">{service.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-muted p-3 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground/80">Price</p>
                      <p className="text-foreground font-medium">{service.price}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted/50 p-6 rounded-xl mt-auto">
                  <h4 className="text-lg font-medium mb-3">About This Treatment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};