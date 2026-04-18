import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 bg-gradient-to-b from-royal-blue/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              Privacy Policy & Hotel Policies
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know for a seamless stay at Golden Tulip
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
          
          <div className="mt-16 max-w-4xl mx-auto text-center text-foreground/70">
            <h3 className="text-2xl font-serif font-bold text-golden-yellow mb-4">Privacy Note</h3>
            <p className="mb-4">
              At Golden Tulip, we respect your privacy and are committed to protecting your personal data. 
              This policy outlines how we handle your information when you visit our website or stay at our hotels.
            </p>
            <p>
              We collect information to provide better services to all our users. We do not sell your personal information to third parties.
              For more detailed inquiries regarding data protection, please contact our front desk or management.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
