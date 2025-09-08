import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton } from "@/components/auth/UserButton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const navigation = [
    { name: "Home", href: "/", isRoute: true },
    { 
      name: "Rooms & Suites", 
      href: "/rooms", 
      isRoute: true,
      subItems: [
        { name: "Standard Room", href: "/rooms/standard" },
        { name: "Deluxe Room", href: "/rooms/deluxe" },
        { name: "Executive Suite", href: "/rooms/executive" },
        { name: "Presidential Suite", href: "/rooms/presidential" }
      ]
    },
    { name: "Dining", href: "#dining", isRoute: false },
    { name: "Events", href: "#events", isRoute: false },
    { name: "About", href: "#about", isRoute: false },
    { name: "Contact", href: "#contact", isRoute: false }
  ];

  const scrollToSection = (href: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first then scroll
      window.location.href = `/${href}`;
      return;
    }
    
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info('Please log in to book a stay');
      navigate('/auth', { state: { from: '/booking' } });
    } else {
      navigate('/booking');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/golden tulip logo.svg" 
              alt="Golden Tulip Logo" 
              className="h-8 transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.isRoute ? (
                  <>
                    <Link
                      to={item.href}
                      className="nav-link-animated px-4 py-2 rounded-lg flex items-center gap-1"
                    >
                      {item.name}
                      {item.subItems && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {item.subItems && (
                      <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="nav-link-animated px-4 py-2 rounded-lg"
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            
            <div className="flex items-center gap-2 ml-4">
              <Link to="/booking">
                <Button 
                  onClick={handleBookNow}
                  className="btn-luxury-nav group"
                >
                  <Calendar className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                  Book Now
                </Button>
              </Link>
              <UserButton />
            </div>
          </nav>

          {/* Mobile Menu Button and User Button */}
          <div className="flex items-center gap-2 md:hidden">
            <UserButton />
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
            <div className="relative">
              <Menu className={`h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} />
              <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`} />
            </div>
          </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 border-t border-border/20">
            <nav className="space-y-1">
              <div className="md:hidden">
              {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="relative">
                    <Menu className={`h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} />
                    <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`} />
                  </div>
                </Button>
              </div>
              {navigation.map((item, index) => (
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`mobile-nav-link block transition-all duration-300 delay-${index * 50}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.href);
                      setIsMenuOpen(false);
                    }}
                    className={`mobile-nav-link w-full text-left transition-all duration-300 delay-${index * 50}`}
                  >
                    {item.name}
                  </button>
                )
              ))}
              
              <Link 
                to="/booking" 
                className="block pt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button 
                  onClick={handleBookNow}
                  className="btn-luxury w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};