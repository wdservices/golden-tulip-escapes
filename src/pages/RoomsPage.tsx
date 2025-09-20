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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gradient-to-b from-black/80 to-black/50">
        <div className="absolute inset-0 bg-[url('/images/rooms/hero-bg.jpg')] bg-cover bg-center -z-10" />
        <div className="text-center px-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gold-400">Our Rooms & Suites</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience luxury and comfort in our meticulously designed rooms and suites, each offering a unique blend of modern amenities and elegant decor.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Loading room information...</p>
          </div>
        ) : (
          <div className="whitespace-nowrap overflow-x-auto pb-6 -mx-4 scrollbar-hide">
            {roomTypes.map((room) => {
              // Count how many rooms of this type are available
              const roomsOfThisType = rooms.filter(r => r.type === room.id);
              const availableRooms = roomsOfThisType.filter(r => r.availability).length;
              const totalRooms = roomsOfThisType.length;
              
              return (
                <div key={room.id} className="inline-block w-80 mx-3 first:ml-0 last:mr-0 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gold-400/50 transition-colors" style={{ minWidth: '320px' }}>
                  <div className="relative h-64">
                    <img 
                      src={room.images?.[0] || '/placeholder-room.jpg'} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      From ₦{room.price?.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{room.name}</h3>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1">4.9</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        <Users className="w-3 h-3 mr-1" />
                        {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
                      </div>
                      <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        <span>Size: {room.size} m²</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        <span>Available: {availableRooms}/{totalRooms}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <Link to={`/rooms/${room.id}`} className="group">
                        <Button variant="link" className="text-gold-400 p-0 group-hover:underline">
                          View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to={`/book?room=${room.id}`}>
                        <Button className="bg-gold-500 hover:bg-gold-600 text-white">
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
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gold-400">Room Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Free WiFi</h3>
              <p className="text-sm text-gray-400">High-speed internet access</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Coffee Maker</h3>
              <p className="text-sm text-gray-400">Premium coffee selection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Smart TV</h3>
              <p className="text-sm text-gray-400">Streaming services available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AirVent className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Climate Control</h3>
              <p className="text-sm text-gray-400">Individual temperature settings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
