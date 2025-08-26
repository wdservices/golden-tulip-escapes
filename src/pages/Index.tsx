import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BranchTabs } from "@/components/BranchTabs";
import { InfoSections } from "@/components/InfoSections";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [activeBranch, setActiveBranch] = useState("main");

  const handleTabChange = (branch: string) => {
    setActiveBranch(branch);
  };

  const handleBookNowClick = () => {
    // Navigate to booking page or show booking modal
    console.log("Book now clicked");
  };

  return (
    <div className="min-h-screen">
      <Header activeTab={activeBranch} onTabChange={handleTabChange} />
      
      <main>
        <HeroSection 
          activeBranch={activeBranch} 
          onBookNowClick={() => window.location.href = '/booking'}
        />
        
        <BranchTabs 
          activeTab={activeBranch} 
          onTabChange={handleTabChange}
        />
        
        <InfoSections />
        
        {/* About Section */}
        <section id="about" className="py-16 bg-gradient-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-serif font-bold mb-6 text-gradient-gold">
                About Golden Tulip Hotels
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Golden Tulip Hotels represents the pinnacle of luxury hospitality in Rivers State, Nigeria. 
                With four strategically located branches, we offer our guests unparalleled access to the best 
                of Port Harcourt and surrounding areas. Our commitment to excellence, combined with warm 
                Nigerian hospitality, creates unforgettable experiences for business and leisure travelers alike.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">4</div>
                  <p className="text-muted-foreground">Premium Locations</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">200+</div>
                  <p className="text-muted-foreground">Luxury Rooms & Suites</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">Concierge Service</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
                Contact Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get in touch with our team for reservations, inquiries, or special requests
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary">Get In Touch</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📞</span>
                        </div>
                        <div>
                          <p className="font-semibold">Reservations Hotline</p>
                          <p className="text-muted-foreground">+234 803 123 4567</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📧</span>
                        </div>
                        <div>
                          <p className="font-semibold">Email Address</p>
                          <p className="text-muted-foreground">info@goldentuliphotels.ng</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📍</span>
                        </div>
                        <div>
                          <p className="font-semibold">Head Office</p>
                          <p className="text-muted-foreground">Plot 123, Government Reserved Area, Port Harcourt</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-card p-8 rounded-2xl">
                  <h3 className="text-2xl font-semibold mb-6 text-primary">Send us a Message</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      className="btn-luxury w-full py-3"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;