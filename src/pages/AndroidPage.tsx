import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Home, Calendar, MapPin, Building2, Users, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Sun, Moon, Utensils, Sparkles } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatbotFloatingButton } from '@/components/chat/ChatbotFloatingButton';
import { Separator } from '@/components/ui/separator';

// Static branch info for simple linking
const BRANCHES = [
  { 
    id: 'evo-road', 
    name: 'Evo Road',
    image: '/images/hero section image/image (1).jpg'
  },
  { 
    id: 'garden-city', 
    name: 'Garden City',
    image: '/images/garden city images/superior room.webp'
  },
  { 
    id: 'stadium-31', 
    name: 'Stadium 31',
    image: '/images/stadium road 31 images/deluxe.webp'
  },
  { 
    id: 'evergreen', 
    name: 'Evergreen',
    image: '/images/evergreen images/standard room.webp'
  },
];

// Image slider data for main page
const SLIDER_IMAGES = [
  { src: '/images/hero section image/image (1).jpg', alt: 'Luxury Hotel Room' },
  { src: '/images/hero section image/image (2).jpg', alt: 'Hotel Exterior View' },
  { src: '/images/hero section image/image (3).jpg', alt: 'Luxury Suite' },
  { src: '/images/hero section image/image (4).jpg', alt: 'Hotel Lobby' },
  { src: '/images/hero section image/image (5).jpg', alt: 'Dining Area' },
  { src: '/images/hero section image/image (6).jpg', alt: 'Relaxation Area' }
];

export const AndroidPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const displayName = currentUser?.name || currentUser?.displayName || 'Guest';
  const email = currentUser?.email || '';
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDER_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDER_IMAGES.length - 1 : prev - 1));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode 
      ? 'bg-gradient-to-br from-yellow-900 via-yellow-800 to-amber-900 text-yellow-100' 
      : 'bg-white text-gray-800'
    }`}>
      {/* Top App Bar */}
      <div className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b backdrop-blur supports-[backdrop-filter] shadow-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-yellow-900/95 border-yellow-700' 
          : 'bg-white/95 border-blue-100'
      }`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className={`transition-colors duration-300 ${
              isDarkMode 
                ? 'hover:bg-yellow-800 text-yellow-300' 
                : 'hover:bg-blue-100 text-blue-600'
            }`}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`w-[85%] sm:max-w-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-yellow-900 border-yellow-700 text-yellow-100' 
              : 'bg-white'
          }`}>
            <SheetHeader>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className={`h-12 w-12 border-2 ${
                  isDarkMode 
                    ? 'border-yellow-400' 
                    : 'border-blue-400'
                }`}>
                  <AvatarImage src={currentUser?.photoURL || ''} alt={displayName} />
                  <AvatarFallback className={`font-semibold ${
                    isDarkMode 
                      ? 'bg-yellow-800 text-yellow-200' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {displayName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className={`text-lg ${
                    isDarkMode 
                      ? 'text-yellow-200' 
                      : 'text-blue-800'
                  }`}>{displayName}</SheetTitle>
                  {email ? (
                    <SheetDescription className={`text-xs ${
                      isDarkMode 
                        ? 'text-yellow-300' 
                        : 'text-blue-600'
                    }`}>{email}</SheetDescription>
                  ) : null}
                </div>
              </div>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  className={`w-full justify-start transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-yellow-900' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`} 
                  onClick={() => navigate('/book')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full justify-start transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-800' 
                      : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  }`} 
                  onClick={() => navigate('/')}
                > 
                  <Home className="mr-2 h-4 w-4" />
                  Main Landing
                </Button>
              </div>

              <Separator />

              {/* Branch Links */}
              <div>
                <div className={`text-sm font-semibold mb-3 flex items-center transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-yellow-300' 
                    : 'text-blue-600'
                }`}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Our Branches
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {BRANCHES.map((branch) => {
                    const to = branch.id === 'evo-road' ? '/' : `/branch/${branch.id}`;
                    return (
                      <Link 
                        key={branch.id} 
                        to={to} 
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 transition-all duration-300 ${
                          isDarkMode 
                            ? 'border-yellow-600 bg-yellow-800 hover:bg-yellow-700 hover:border-yellow-500' 
                            : 'border bg-white hover:bg-blue-50 hover:border-blue-400'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-yellow-700 text-yellow-300' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-yellow-200' 
                            : 'text-blue-800'
                        }`}>{branch.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Navigation Links */}
              <div>
                <div className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-yellow-300' 
                    : 'text-blue-600'
                }`}>Quick Links</div>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-yellow-300 hover:bg-yellow-800 hover:text-yellow-200' 
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                    }`} 
                    onClick={() => navigate('/rooms')}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    View Rooms
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-yellow-300 hover:bg-yellow-800 hover:text-yellow-200' 
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                    }`} 
                    onClick={() => navigate('/dashboard')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-yellow-300 hover:bg-yellow-800 hover:text-yellow-200' 
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                    }`} 
                    onClick={() => navigate('/corporate-halls')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Corporate Halls
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Logout */}
              {currentUser && (
                <Button 
                  variant="outline" 
                  className={`w-full justify-start transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-yellow-300 border-yellow-400 hover:bg-yellow-800 hover:text-yellow-200' 
                      : 'text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                  }`} 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Dark Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className={`transition-colors duration-300 ${
            isDarkMode 
              ? 'hover:bg-yellow-800 text-yellow-300' 
              : 'hover:bg-blue-100 text-blue-600'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button 
          onClick={() => navigate('/book')}
          size="sm"
          className={`font-semibold transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-yellow-600 hover:bg-yellow-500 text-yellow-900' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Book
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Image Slider */}
        <div className="rounded-2xl overflow-hidden border-2 border-border shadow-lg">
          <div className="aspect-[16/9] relative">
            <img 
              src={SLIDER_IMAGES[currentSlide].src} 
              alt={SLIDER_IMAGES[currentSlide].alt}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentSlide + 1} / {SLIDER_IMAGES.length}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate('/book')}
              className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Book Room</span>
            </Button>
            <Button 
              onClick={() => navigate('/dining')}
              className="h-24 flex-col gap-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Utensils className="h-6 w-6" />
              <span className="text-sm font-medium">Dining</span>
            </Button>
            <Button 
              onClick={() => navigate('/events')}
              className="h-24 flex-col gap-2 bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Events</span>
            </Button>
            <Button 
              onClick={() => navigate('/spa')}
              className="h-24 flex-col gap-2 bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium">Spa</span>
            </Button>
          </div>
        </div>

        {/* Branch Cards Grid (2x2) Enhanced */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">Explore Our Branches</h2>
          <div className="grid grid-cols-2 gap-4">
            {BRANCHES.map((branch, index) => {
              const to = `/android/gallery/${branch.id}`;
              
              return (
                <Link key={branch.id} to={to}>
                  <Card className={`h-36 bg-white border-2 border-blue-100 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden`}>
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="h-24 w-full overflow-hidden">
                        <img 
                          src={branch.image} 
                          alt={branch.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                        <div className="text-xs text-blue-500 font-medium mb-1">Gallery</div>
                        <div className="text-sm font-bold text-blue-800 leading-tight">{branch.name}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`rounded-lg border p-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-yellow-800 to-yellow-700 border-yellow-600' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-100' 
                : 'text-blue-800'
            }`}>4</div>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-300' 
                : 'text-blue-600'
            }`}>Branches</div>
          </div>
          <div className={`rounded-lg border p-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-yellow-700 to-yellow-600 border-yellow-500' 
              : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-100' 
                : 'text-yellow-800'
            }`}>24/7</div>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-300' 
                : 'text-yellow-600'
            }`}>Service</div>
          </div>
          <div className={`rounded-lg border p-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-yellow-800 to-yellow-700 border-yellow-600' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-100' 
                : 'text-blue-800'
            }`}>500+</div>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-300' 
                : 'text-blue-600'
            }`}>Rooms</div>
          </div>
          <div className={`rounded-lg border p-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-yellow-700 to-yellow-600 border-yellow-500' 
              : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-100' 
                : 'text-yellow-800'
            }`}>★4.8</div>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode 
                ? 'text-yellow-300' 
                : 'text-yellow-600'
            }`}>Rating</div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <ChatbotFloatingButton />
    </div>
  );
};

export default AndroidPage;