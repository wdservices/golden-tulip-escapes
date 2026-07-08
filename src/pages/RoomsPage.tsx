import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Wifi, Coffee, Tv, AirVent, Utensils, Users } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';

export default function RoomsPage() {
  // Get the first branch ID for now - in a real app, you might want to select a branch
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const { rooms, roomTypes, isLoading } = useRooms(selectedBranchId);
  const { queryDocuments } = useDatabase();

  // Get the first branch ID on component mount
  useEffect(() => {
    const fetchFirstBranch = async () => {
      try {
        // Fetch branches directly using the database context
        const branches = await queryDocuments('branches', []);
        if (branches && branches.length > 0) {
          setSelectedBranchId(branches[0].id);
        } else {
          console.error('No branches found');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchFirstBranch();
  }, [queryDocuments]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gradient-to-b from-blue-900/70 to-blue-800/60">
        <div className="absolute inset-0 bg-[url('/images/rooms/hero-bg.jpg')] bg-cover bg-center -z-10" />
        <div className="text-center px-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">Our Rooms & Suites</h1>
          <p className="text-xl text-blue-50 max-w-2xl mx-auto drop-shadow-md">
            Experience luxury and comfort in our meticulously designed rooms and suites, each offering a unique blend of modern amenities and elegant decor.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-slate-500">Loading room information...</p>
          </div>
        ) : (
          <div className="whitespace-nowrap overflow-x-auto pb-6 -mx-4 scrollbar-hide">
            {roomTypes.map((room) => {
              // Count how many rooms of this type are available
              const roomsOfThisType = rooms.filter(r => r.type === room.id);
              const availableRooms = roomsOfThisType.filter(r => r.availability).length;
              const totalRooms = roomsOfThisType.length;
              
              return (
                <div key={room.id} className="inline-block w-80 mx-3 first:ml-0 last:mr-0 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border border-blue-200 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300" style={{ minWidth: '320px' }}>
                  <div className="relative h-64">
                    <img 
                      src={room.images?.[0] || '/images/rooms/placeholder-room.jpg'} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-blue-900/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      From ₦{room.price?.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                      <div className="flex items-center text-blue-600">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1">4.9</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-xs text-slate-600 bg-blue-50 px-2 py-1 rounded">
                        <Users className="w-3 h-3 mr-1" />
                        {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 bg-blue-50 px-2 py-1 rounded">
                        <span>Size: {room.size} m²</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 bg-blue-50 px-2 py-1 rounded">
                        <span>Available: {availableRooms}/{totalRooms}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <Link to={`/rooms/${room.id}`} className="group">
                        <Button variant="link" className="text-blue-600 p-0 group-hover:underline">
                          View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to={`/book?room=${room.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50/50 to-white/80">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">Room Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Wifi className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-slate-800">Free WiFi</h3>
              <p className="text-sm text-slate-600">High-speed internet access</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Coffee className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-slate-800">Coffee Maker</h3>
              <p className="text-sm text-slate-600">Premium coffee selection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Tv className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-slate-800">Smart TV</h3>
              <p className="text-sm text-slate-600">Streaming services available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <AirVent className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-slate-800">Climate Control</h3>
              <p className="text-sm text-slate-600">Individual temperature settings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
