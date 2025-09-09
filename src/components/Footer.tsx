import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      name: "GRA (Head Branch)",
      address: "Plot 123, Government Reserved Area, Port Harcourt, Rivers State",
      phone: "+234 803 123 4567",
      email: "gra@goldentuliphotels.ng"
    },
    {
      name: "Waterlines Branch",
      address: "45 Waterlines Street, Port Harcourt, Rivers State",
      phone: "+234 803 123 4568",
      email: "waterlines@goldentuliphotels.ng"
    },
    {
      name: "Airforce Base Branch",
      address: "Near NAF Base, Port Harcourt, Rivers State",
      phone: "+234 803 123 4569",
      email: "airforce@goldentuliphotels.ng"
    },
    {
      name: "Oyigbo Branch",
      address: "Lagos-Port Harcourt Expressway, Oyigbo, Rivers State",
      phone: "+234 803 123 4570",
      email: "oyigbo@goldentuliphotels.ng"
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
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-serif font-bold text-gradient-gold mb-4">
              Golden Tulip
            </div>
            <p className="text-secondary-foreground/80 mb-6">
              Experience unparalleled luxury and hospitality across our four premium locations in Rivers State, Nigeria.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:text-primary"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-secondary-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>


          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Contact Us</h3>
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
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-secondary-foreground/80">Reservations</p>
                  <p className="font-semibold">+234 803 123 4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-secondary-foreground/80">Email</p>
                  <p className="font-semibold">info@goldentuliphotels.ng</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-secondary-foreground/80">Head Office</p>
                  <p className="font-semibold">GRA, Port Harcourt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Stay Updated</h3>
            <p className="text-secondary-foreground/80 mb-4">
              Subscribe to receive exclusive offers and updates from Golden Tulip Hotels.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/60"
              />
              <Button className="btn-luxury w-full">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Branch Locations */}
        <div className="border-t border-secondary-foreground/20 pt-8 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-primary text-center">Our Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {branches.map((branch, index) => (
              <div key={index} className="text-center p-4 bg-background/5 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">{branch.name}</h4>
                <p className="text-sm text-secondary-foreground/80 mb-2">{branch.address}</p>
                <p className="text-sm font-medium">{branch.phone}</p>
                <p className="text-sm text-secondary-foreground/60">{branch.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-secondary-foreground/60 text-sm mb-4 md:mb-0">
            © 2024 Golden Tulip Hotels. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};