import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Home, Calendar, MapPin } from 'lucide-react';
import KuulaViewer from '@/components/KuulaViewer';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

// Static branch info for simple linking
const BRANCHES = [
  { id: 'evo-road', name: 'Evo Road' },
  { id: 'garden-city', name: 'Garden City' },
  { id: 'stadium-31', name: 'Stadium 31' },
  { id: 'evergreen', name: 'Evergreen' },
];

export const AndroidPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const displayName = currentUser?.name || currentUser?.displayName || 'Guest';
  const email = currentUser?.email || '';

  const kuulaUrl = 'https://kuula.co/share/collection/7Hpm5?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.53&autop=90&autopalt=1&thumbs=-1';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:max-w-sm">
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentUser?.photoURL || ''} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
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
                <Button className="w-full" onClick={() => navigate('/book')}>
                  Book Now
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}> 
                  <Home className="mr-2 h-4 w-4" />
                  Main Landing
                </Button>
              </div>

              {/* Branch Links */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Branches</div>
                <div className="grid grid-cols-1 gap-2">
                  {BRANCHES.map((branch) => {
                    const to = branch.id === 'evo-road' ? '/' : `/branch/${branch.id}`;
                    return (
                      <Link key={branch.id} to={to} className="flex items-center gap-3 rounded-md border px-3 py-2 hover:bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{branch.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Other Navigation (optional) */}
              <div className="space-y-2">
                <Button variant="ghost" className="w-full" onClick={() => navigate('/rooms')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Rooms
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="font-semibold">Golden Tulip Mobile</div>
        <Button onClick={() => navigate('/book')}>Book</Button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* 360 Tour */}
        <div className="rounded-xl overflow-hidden border">
          <div className="aspect-[16/9]">
            <KuulaViewer url={kuulaUrl} className="w-full h-full" />
          </div>
        </div>

        {/* Branch Cards Grid (2x2) */}
        <div className="grid grid-cols-2 gap-3">
          {BRANCHES.map((branch) => {
            const to = branch.id === 'evo-road' ? '/' : `/branch/${branch.id}`;
            return (
              <Link key={branch.id} to={to}>
                <Card className="h-28 flex items-center justify-center text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-2">
                    <div className="text-sm text-muted-foreground">Branch</div>
                    <div className="text-base font-semibold">{branch.name}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AndroidPage;