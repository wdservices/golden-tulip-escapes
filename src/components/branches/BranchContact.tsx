import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Branch } from "@/types/branch";

interface BranchContactProps {
  branch: Branch;
}

export const BranchContact = ({ branch }: BranchContactProps) => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/10" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Contact Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're here to assist you with any questions about your stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="flex items-start p-6 bg-card rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Address</h3>
                  <p className="text-muted-foreground">{branch.address}</p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-card rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Phone</h3>
                  <a 
                    href={`tel:${branch.phone?.replace(/\D/g, '')}`} 
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    {branch.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start p-6 bg-card rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <a 
                    href={`mailto:${branch.email}`} 
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start p-6 bg-card rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                <div className="bg-primary/20 p-3 rounded-full mr-4 flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Check-in / Check-out</h3>
                  <p className="text-muted-foreground">
                    Check-in: {branch.checkInTime || '2:00 PM'}<br />
                    Check-out: {branch.checkOutTime || '12:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-8 h-full hover:shadow-glow transition-all duration-300">
              <h3 className="text-2xl font-medium mb-4">Get in Touch</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Have questions about your stay or special requests? Our team is here to help.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white text-lg px-6 py-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300">
                <a href={`mailto:${branch.email}?subject=Inquiry about ${branch.name} Branch`}>
                  Send Us a Message
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
