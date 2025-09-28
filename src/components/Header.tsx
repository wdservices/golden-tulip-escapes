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

  const navigation: Array<{
    name: string;
    href: string;
    isRoute: boolean;
  }> = [
    { name: "Home", href: "/", isRoute: true },
    { name: "Rooms", href: "#rooms", isRoute: false },
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
      navigate('/auth', { state: { from: '/book' } });
    } else {
      navigate('/book');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/golden tulip logo.svg" alt="Golden Tulip Logo" className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">Golden Tulip</span>
              <span className="text-sm text-golden-yellow font-medium -mt-1">Port Harcourt</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.isRoute ? (
                  <Link
                    to={item.href}
                    className="px-4 py-2 rounded-lg text-foreground hover-golden-text transition-all duration-300 font-medium"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="px-4 py-2 rounded-lg text-foreground hover-golden-text transition-all duration-300 font-medium"
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            
            <div className="flex items-center gap-2 ml-4">
              <Link to="/book">
                <Button 
                  onClick={handleBookNow}
                  className="brand-button group"
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
              className="hover-golden text-foreground"
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
          <div className="py-4 border-t border-border/20 bg-white/95">
            <nav className="space-y-1">
              {navigation.map((item, index) => (
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-3 text-foreground hover-golden-text transition-all duration-300 font-medium rounded-lg mx-2"
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
                    className="block w-full text-left px-4 py-3 text-foreground hover-golden-text transition-all duration-300 font-medium rounded-lg mx-2"
                  >
                    {item.name}
                  </button>
                )
              ))}
              
              <div className="px-2 pt-4">
                <Link 
                  to="/book" 
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button 
                    onClick={handleBookNow}
                    className="brand-button w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};