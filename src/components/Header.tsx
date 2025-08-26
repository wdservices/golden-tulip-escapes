import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const branches = [
    { id: "main", name: "GRA (Head Branch)", location: "Government Reserved Area" },
    { id: "waterlines", name: "Waterlines", location: "Port Harcourt" },
    { id: "airforce", name: "Airforce Base", location: "Port Harcourt" },
    { id: "oyigbo", name: "Oyigbo", location: "Rivers State" }
  ];

  const navigation = [
    { name: "Home", href: "#home" },
    { name: "Rooms & Suites", href: "#rooms" },
    { name: "Dining", href: "#dining" },
    { name: "Spa & Wellness", href: "#spa" },
    { name: "Events", href: "#events" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top Contact Bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+234 803 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@goldentuliphotels.ng</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Rivers State, Nigeria</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-serif font-bold text-gradient-gold">
              Golden Tulip
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Luxury Hotels • Rivers State
            </span>
          </div>

          {/* Branch Tabs - Desktop */}
          <div className="hidden lg:flex space-x-2">
            {branches.map((branch) => (
              <Button
                key={branch.id}
                variant={activeTab === branch.id ? "default" : "ghost"}
                onClick={() => onTabChange(branch.id)}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeTab === branch.id
                    ? "btn-luxury"
                    : "hover:text-primary"
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{branch.name}</div>
                  <div className="text-xs opacity-70">{branch.location}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {/* Mobile Branch Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-primary">Select Branch:</h3>
              <div className="grid grid-cols-2 gap-2">
                {branches.map((branch) => (
                  <Button
                    key={branch.id}
                    variant={activeTab === branch.id ? "default" : "outline"}
                    onClick={() => {
                      onTabChange(branch.id);
                      setIsMenuOpen(false);
                    }}
                    className={`p-3 text-left ${
                      activeTab === branch.id ? "btn-luxury" : ""
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{branch.name}</div>
                      <div className="text-xs opacity-70">{branch.location}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 px-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};