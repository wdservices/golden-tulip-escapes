import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Home, Calendar, MapPin, Building2, Users, FileText, Settings, LogOut } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotFloatingButton } from '@/components/chat/ChatbotFloatingButton';
import { Separator } from '@/components/ui/separator';

// Static branch info for simple linking
const BRANCHES = [
  { id: 'evo-road', name: 'Evo Road' },
  { id: 'garden-city', name: 'Garden City' },
  { id: 'stadium-31', name: 'Stadium 31' },
  { id: 'evergreen', name: 'Evergreen' },
];

export const AndroidPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const displayName = currentUser?.name || currentUser?.displayName || 'Guest';
  const email = currentUser?.email || '';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-primary/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:max-w-sm">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={currentUser?.photoURL || ''} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-lg">{displayName}</SheetTitle>
                  {email ? (
                    <SheetDescription className="text-xs">{email}</SheetDescription>
                  ) : null}
                </div>
              </div>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => navigate('/book')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/')}
                > 
                  <Home className="mr-2 h-4 w-4" />
                  Main Landing
                </Button>
              </div>

              <Separator />

              {/* Branch Links */}
              <div>
                <div className="text-sm font-semibold text-foreground mb-3 flex items-center">
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
                        className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3 hover:bg-accent hover:border-primary transition-all"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{branch.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Navigation Links */}
              <div>
                <div className="text-sm font-semibold text-foreground mb-3">Quick Links</div>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/rooms')}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    View Rooms
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/dashboard')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
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
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="font-bold text-lg bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
          Golden Tulip
        </div>
        <Button 
          onClick={() => navigate('/book')}
          size="sm"
          className="font-semibold"
        >
          Book
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* 360 Tour */}
        <div className="rounded-2xl overflow-hidden border-2 border-border shadow-lg">
          <div className="aspect-[16/9] relative">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none', 
                minHeight: '400px'
              }} 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen={true}
              frameBorder="0" 
              scrolling="no"
              src="https://kuula.co/share/collection/7Hpm5?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.53&autop=90&autopalt=1&thumbs=-1" 
              title="360° Virtual Tour of Golden Tulip Hotel"
              className="w-full h-full"
            />
          </div>
          <div className="bg-card p-3 border-t">
            <p className="text-sm font-medium text-center">
              🏨 Explore Our Properties in 360°
            </p>
          </div>
        </div>

        {/* Branch Cards Grid (2x2) Enhanced */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-foreground">Explore Our Branches</h2>
          <div className="grid grid-cols-2 gap-4">
            {BRANCHES.map((branch, index) => {
              const to = branch.id === 'evo-road' ? '/' : `/branch/${branch.id}`;
              const gradients = [
                'from-amber-500/20 to-amber-600/20',
                'from-emerald-500/20 to-emerald-600/20',
                'from-blue-500/20 to-blue-600/20',
                'from-rose-500/20 to-rose-600/20'
              ];
              const icons = ['🏛️', '🌊', '✈️', '🌳'];
              
              return (
                <Link key={branch.id} to={to}>
                  <Card className={`h-36 bg-gradient-to-br ${gradients[index]} border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center gap-2">
                      <div className="text-3xl mb-1">{icons[index]}</div>
                      <div className="text-xs text-muted-foreground font-medium">Branch</div>
                      <div className="text-sm font-bold leading-tight">{branch.name}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-xs text-muted-foreground">Branches</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">245</div>
              <div className="text-xs text-muted-foreground">Rooms</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">24/7</div>
              <div className="text-xs text-muted-foreground">Service</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chatbot */}
      <ChatbotFloatingButton />
    </div>
  );
};

export default AndroidPage;