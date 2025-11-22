import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, MessageCircle, Lock } from "lucide-react";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { isAdmin } from '@/utils/auth';

export const Footer = () => {
  const { currentUser } = useAuth();

  const branches = [
    {
      name: "GOLDEN TULIP EVO ROAD",
      address: "1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State",
      phones: ["+234 905 777 7780", "+234 905 777 7782"],
      emails: ["reservations@goldentulipportharcourt.com", "fom@goldentulipportharcourt.com"],
    },
    {
      name: "GOLDEN TULIP STADIUM ROAD",
      address: "31 Ken Saro Wiwa, Stadium Road 31, Port Harcourt, Rivers State",
      phones: ["+234 704 338 3142", "+234 704 338 3141"],
      emails: ["reservationsgt@rivotels.com", "fomgt@rivotels.com"],
    },
    {
      name: "GOLDEN TULIP GARDEN CITY",
      address: "63 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
      phones: ["+234 704 215 6775", "+234 906 243 5585"],
      emails: ["reservations@rivotels.com", "fom@rivotels.com"],
    },
    {
      name: "GOLDEN TULIP EVERGREEN",
      address: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
      phones: ["+234 906 243 5582", "+234 916 998 8444"],
      emails: ["reservations@rivotelinternational.com", "sales@rivotelinternational.com"],
    }
  ];

  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Rooms & Suites", href: "#rooms" },
    { name: "Dining", href: "#dining" },
    { name: "Spa & Wellness", href: "#spa" },
    { name: "Events", href: "#events" },
    { name: "Contact", href: "#contact" }
  ];

  const handleWhatsApp = () => {
    window.open("https://wa.me/2348031234567?text=Hello, I'd like to make a reservation at Golden Tulip Hotel", "_blank");
  };

  return (
    <footer className="bg-royal-blue text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-serif font-bold text-golden-yellow mb-4">
              Golden Tulip
            </div>
            <p className="text-white/80 mb-6">
              Experience unparalleled luxury and hospitality across our four premium locations in Rivers State, Nigeria.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-white hover:text-golden-yellow hover:bg-golden-yellow/10 transition-colors duration-300"
                onClick={() => window.open('https://www.facebook.com/729416683793056?ref=_xav_ig_profile_page_web', '_blank')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-white hover:text-golden-yellow hover:bg-golden-yellow/10 transition-colors duration-300"
                onClick={() => window.open('https://www.instagram.com/goldentulipphchotels/#', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-white hover:text-golden-yellow hover:bg-golden-yellow/10 transition-colors duration-300"
                onClick={() => window.open('https://www.tiktok.com/@goldentulipporthar?_t=ZM-8zbeMrCagFx&_r=1', '_blank')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.589 6.686a4.039 4.039 0 0 1-2.25-2.605 4.03 4.03 0 0 0-2.348-1.523C14.34 2.447 12.03 2 9.857 2 7.684 2 5.374 2.447 3.998 2.558c-1.376.11-2.605.663-3.523 1.523C.558 4.94 0 6.17 0 7.5v9c0 1.33.558 2.56 1.475 3.42.918.86 2.147 1.413 3.523 1.523 1.376.11 2.686.558 3.86.558 1.173 0 2.483-.447 3.86-.558 1.376-.11 2.605-.663 3.522-1.523.918-.86 1.476-2.09 1.476-3.42V7.5c0-1.33-.558-2.56-1.476-3.42a4.039 4.039 0 0 1-2.25-2.605zM9.857 16.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-white hover:text-golden-yellow hover:bg-golden-yellow/10 transition-colors duration-300"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-golden-yellow">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-golden-yellow transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>


          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-golden-yellow">Contact Us</h3>
            <div className="space-y-3">
              <div className="mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-amber-700 mb-2">
                        We'd Love Your Feedback
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-6">
                        Your suggestions help us improve our services. Share your thoughts with us!
                      </p>
                    </DialogHeader>
                    <FeedbackForm />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-golden-yellow mt-0.5" />
                <div>
                  <p className="text-white/80">Reservations</p>
                  <p className="font-semibold">+234 905 777 7780</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-golden-yellow mt-0.5" />
                <div>
                  <p className="text-white/80">Email</p>
                  <p className="font-semibold">reservations@goldentulipportharcourt.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-golden-yellow mt-0.5" />
                <div>
                  <p className="text-white/80">Head Office</p>
                  <p className="font-semibold">1c Evo Crescent, GRA Phase II, Port Harcourt</p>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Branch Locations */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-golden-yellow text-center">Our Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {branches.map((branch, index) => (
              <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2 text-golden-yellow">{branch.name}</h4>
                <p className="text-sm text-white/80 mb-2">{branch.address}</p>
                <div className="space-y-1">
                  {branch.phones?.map((p: string, i: number) => (
                    <p key={`phone-${i}`} className="text-sm font-medium text-white">{p}</p>
                  ))}
                  {branch.emails?.map((e: string, i: number) => (
                    <p key={`email-${i}`} className="text-sm text-white/60">{e}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © 2024 Golden Tulip Hotels. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-white/60 hover:text-golden-yellow text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="/terms" className="text-white/60 hover:text-golden-yellow text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="/cookies" className="text-white/60 hover:text-golden-yellow text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};