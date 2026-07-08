import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Home, Calendar, MapPin, Building2, Users, FileText, LogOut, ChevronLeft, ChevronRight, Sun, Moon, Utensils, Sparkles, ArrowRight } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotFloatingButton } from '@/components/chat/ChatbotFloatingButton';
import { Separator } from '@/components/ui/separator';

// Static branch info for simple linking
const BRANCHES = [
  { 
    id: 'evo-road', 
    name: 'Evo Road',
    image: '/images/evo road carousel image/GT-PH-1.jpg'
  },
  { 
    id: 'garden-city', 
    name: 'Garden City',
    image: '/images/garden city images/carousel image/IMG20251204143022.jpg'
  },
  { 
    id: 'stadium-31', 
    name: 'Stadium 31',
    image: '/images/stadium road 31 images/carousel image/IMG20251204133623.jpg'
  },
  { 
    id: 'evergreen', 
    name: 'Evergreen',
    image: '/images/evergreen images/standard room.webp'
  },
];

// Image slider data for main page
const SLIDER_IMAGES = [
  { src: '/images/evo road carousel image/GT-PH-1.jpg', alt: 'Evo Road – Grand Arrival' },
  { src: '/images/garden city images/carousel image/IMG20251204143022.jpg', alt: 'Garden City – Suite Interior' },
  { src: '/images/stadium road 31 images/carousel image/IMG20251204133623.jpg', alt: 'Stadium Road 31 – Lobby' },
  { src: '/images/evergreen images/standard room.webp', alt: 'Evergreen – Standard Room' }
];

export const IOSPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode only for IOS
  const displayName = currentUser?.name || currentUser?.displayName || 'Guest';
  const email = currentUser?.email || '';
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/ios' } });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDER_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDER_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDER_IMAGES.length - 1 : prev - 1));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode 
      ? 'bg-[#1D3649]' 
      : 'bg-slate-50'
    }`}>
      {/* Top App Bar - Glass Morphism */}
      <div className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#1D3649]/80 border-slate-800/50 shadow-lg shadow-slate-900/50' 
          : 'bg-slate-50/80 border-slate-200/50 shadow-lg shadow-slate-200/50'
      }`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Open menu" 
              className={`rounded-full transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-300 hover:shadow-lg hover:shadow-blue-500/20' 
                  : 'hover:bg-slate-100 text-slate-700 hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`w-[85%] sm:max-w-sm transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#1D3649] border-slate-800' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <SheetHeader>
              <div className="flex items-center gap-3 mb-6">
                <Avatar className={`h-14 w-14 ring-2 ring-offset-2 transition-all duration-300 ${
                  isDarkMode 
                    ? 'ring-blue-500 ring-offset-slate-900' 
                    : 'ring-blue-600 ring-offset-white'
                }`}>
                  <AvatarImage src={currentUser?.photoURL || ''} alt={displayName} />
                  <AvatarFallback className={`font-bold text-lg ${
                    isDarkMode 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {displayName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className={`text-lg font-bold ${
                    isDarkMode 
                      ? 'text-slate-100' 
                      : 'text-slate-900'
                  }`}>{displayName}</SheetTitle>
                  {email ? (
                    <SheetDescription className={`text-sm ${
                      isDarkMode 
                        ? 'text-slate-400' 
                        : 'text-slate-600'
                    }`}>{email}</SheetDescription>
                  ) : null}
                </div>
              </div>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  className={`w-full justify-between group transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-yellow-500/40' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-yellow-500/40'
                  }`} 
                  onClick={() => navigate('/book')}
                >
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>

              <Separator />

              {/* Branch Links */}
              <div>
                <div className={`text-sm font-bold mb-3 flex items-center ${
                  isDarkMode 
                    ? 'text-slate-300' 
                    : 'text-slate-700'
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
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-slate-800/50 hover:bg-slate-700/50 shadow-md shadow-slate-900/50 hover:shadow-lg hover:shadow-blue-500/20' 
                            : 'bg-slate-50 hover:bg-slate-100 shadow-sm shadow-slate-300/50 hover:shadow-md hover:shadow-blue-500/20'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          isDarkMode 
                            ? 'bg-yellow-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                        }`}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-semibold flex-1 ${
                          isDarkMode 
                            ? 'text-slate-200' 
                            : 'text-slate-800'
                        }`}>{branch.name}</span>
                        <ArrowRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* User Dashboard Link */}
              <div>
                <Button 
                  className={`w-full justify-between group transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-blue-500/40' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                  }`} 
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    My Profile & Bookings
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>

              <Separator />

              {/* Logout */}
              {currentUser && (
                <Button 
                  className={`w-full justify-start transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100 shadow-sm shadow-red-300/30 hover:shadow-md hover:shadow-red-300/40'
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
          className={`rounded-full transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'hover:bg-slate-800 text-slate-300 hover:shadow-lg hover:shadow-yellow-500/20' 
              : 'hover:bg-slate-100 text-slate-700 hover:shadow-lg hover:shadow-blue-500/20'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button 
          onClick={() => navigate('/book')}
          size="sm"
          className={`font-bold rounded-full px-6 transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-yellow-500/50' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-yellow-500/50'
          }`}
        >
          Book
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8 pb-24">
        {/* Image Slider - Hero Section */}
        <div className={`rounded-3xl overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'shadow-2xl shadow-blue-500/20' 
            : 'shadow-2xl shadow-slate-300/50'
        }`}>
          <div className="aspect-[16/9] relative group">
            {SLIDER_IMAGES.map((image, index) => (
              <img 
                key={index}
                src={image.src} 
                alt={image.alt}
                className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ${
                  index === currentSlide 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                }`}
              />
            ))}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-slate-900/70 text-white hover:bg-slate-800/80 shadow-lg shadow-slate-900/50' 
                  : 'bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg shadow-slate-300/50'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-slate-900/70 text-white hover:bg-slate-800/80 shadow-lg shadow-slate-900/50' 
                  : 'bg-white/70 text-slate-900 hover:bg-white/90 shadow-lg shadow-slate-300/50'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image Counter & Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
              {SLIDER_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`text-xl font-bold mb-5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/book')}
              className={`h-32 flex-col gap-3 rounded-2xl transition-all duration-300 hover:scale-105 group border-2 ${
                isDarkMode 
                  ? 'border-blue-400 bg-transparent text-blue-100 hover:bg-blue-500/10' 
                  : 'border-blue-600 bg-transparent text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Calendar className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-bold">Book Room</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className={`h-32 flex-col gap-3 rounded-2xl transition-all duration-300 hover:scale-105 group border-2 ${
                isDarkMode 
                  ? 'border-yellow-400 bg-transparent text-yellow-100 hover:bg-yellow-500/10' 
                  : 'border-yellow-600 bg-transparent text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <Users className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-bold">My Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Branch Cards Grid (2x2) Enhanced */}
        <div>
          <h2 className={`text-xl font-bold mb-5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Explore Our Branches
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {BRANCHES.map((branch) => {
              const to = `/ios/gallery/${branch.id}`;
              
              return (
                <Link key={branch.id} to={to} className="group">
                  <Card className={`h-40 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 shadow-xl shadow-slate-900/50 hover:shadow-2xl hover:shadow-blue-500/30' 
                      : 'bg-white shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-blue-500/30'
                  }`}>
                    <CardContent className="p-0 h-full flex flex-col relative">
                      <div className="h-28 w-full overflow-hidden relative">
                        <img 
                          src={branch.image} 
                          alt={branch.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className={`flex-1 flex flex-col items-center justify-center p-3 text-center ${
                        isDarkMode ? 'bg-slate-800/80' : 'bg-white'
                      }`}>
                        <div className={`text-xs font-bold mb-1 ${
                          isDarkMode 
                            ? 'text-blue-400' 
                            : 'text-blue-600'
                        }`}>Gallery</div>
                        <div className={`text-sm font-bold leading-tight ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-900'
                        }`}>{branch.name}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-blue-600 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-900/60' 
              : 'bg-blue-600 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60'
          }`}>
            <div className="text-3xl font-bold mb-1 text-white">4</div>
            <div className="text-sm font-medium text-blue-100">Branches</div>
          </div>
          <div className={`rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-yellow-500 shadow-lg shadow-yellow-900/50 hover:shadow-xl hover:shadow-yellow-900/60' 
              : 'bg-yellow-500 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-200/60'
          }`}>
            <div className="text-3xl font-bold mb-1 text-white">24/7</div>
            <div className="text-sm font-medium text-yellow-100">Service</div>
          </div>
          <div className={`rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-blue-600 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-900/60' 
              : 'bg-blue-600 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60'
          }`}>
            <div className="text-3xl font-bold mb-1 text-white">500+</div>
            <div className="text-sm font-medium text-blue-100">Rooms</div>
          </div>
          <div className={`rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-yellow-500 shadow-lg shadow-yellow-900/50 hover:shadow-xl hover:shadow-yellow-900/60' 
              : 'bg-yellow-500 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-200/60'
          }`}>
            <div className="text-3xl font-bold mb-1 text-white">4.8</div>
            <div className="text-sm font-medium text-yellow-100">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSPage;
