import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const TermsAndConditions = () => {
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
              Terms and Conditions
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using our services
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">1. Acceptance of Terms</h2>
              <p className="text-foreground/80 leading-relaxed">
                By accessing and using the Golden Tulip website, mobile application, and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">2. Booking and Reservations</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                All bookings made through our platform are subject to availability and confirmation. We reserve the right to cancel or modify bookings under certain circumstances. Prices displayed are in Nigerian Naira (NGN) unless otherwise stated.
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Check-in time is 2:00 PM and check-out time is 12:00 PM</li>
                <li>A valid government-issued ID is required at check-in</li>
                <li>Cancellation policies vary by room type and booking rate</li>
                <li>Early check-in and late check-out are subject to availability</li>
              </ul>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">3. User Accounts</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>You must be at least 18 years old to create an account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts for violations</li>
              </ul>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">4. Payment Terms</h2>
              <p className="text-foreground/80 leading-relaxed">
                Payments for bookings are processed securely through our payment partners. By providing payment information, you represent that you are authorized to use the payment method. We accept major credit cards, debit cards, and bank transfers.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">5. Guest Conduct</h2>
              <p className="text-foreground/80 leading-relaxed">
                Guests are expected to behave in a respectful manner towards staff and other guests. We reserve the right to refuse service or ask guests to leave without refund for disruptive behavior, violation of hotel policies, or illegal activities on the premises.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">6. Limitation of Liability</h2>
              <p className="text-foreground/80 leading-relaxed">
                Golden Tulip shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services. Our total liability shall not exceed the total amount paid by you for the specific booking giving rise to the claim.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">7. Intellectual Property</h2>
              <p className="text-foreground/80 leading-relaxed">
                All content on our website and mobile application, including text, graphics, logos, images, and software, is the property of Golden Tulip or its content suppliers and is protected by applicable intellectual property laws.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">8. Modifications to Terms</h2>
              <p className="text-foreground/80 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Your continued use of our services after any modifications indicates your acceptance of the updated terms.
              </p>
            </div>

            <div className="brand-card hover-golden transition-all duration-300 rounded-2xl p-8 shadow-lg border-2 border-golden-yellow/10 hover:border-golden-yellow/30 hover:shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-golden-yellow mb-4">9. Contact Information</h2>
              <p className="text-foreground/80 leading-relaxed">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-foreground/80">
                <p><strong>Email:</strong> reservations@goldentulipportharcourt.com</p>
                <p><strong>Phone:</strong> +234 905 777 7780</p>
                <p><strong>Address:</strong> 1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
